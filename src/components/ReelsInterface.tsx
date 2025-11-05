import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Send, X, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
}

const ReelsInterface = () => {
  // Loading and envelope states
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState({ video: false, audio: false });
  
  // Video and audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Like states
  const [likes, setLikes] = useState(247);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  
  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState({ name: '', message: '' });
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [swipedCommentId, setSwipedCommentId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const { toast } = useToast();

  // Optimized asset loading for low-end devices and slow connections
  useEffect(() => {
    const handleVideoLoad = () => {
      console.log('Video ready to play');
      setAssetsLoaded(prev => ({ ...prev, video: true }));
    };

    const handleAudioLoad = () => {
      console.log('Audio ready to play');
      setAssetsLoaded(prev => ({ ...prev, audio: true }));
    };

    const handleVideoError = (e: Event) => {
      console.error('Video load error:', e);
      // Mark as loaded to prevent blocking
      setAssetsLoaded(prev => ({ ...prev, video: true }));
    };

    const handleAudioError = (e: Event) => {
      console.error('Audio load error:', e);
      // Mark as loaded to prevent blocking
      setAssetsLoaded(prev => ({ ...prev, audio: true }));
    };

    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      // Use 'canplay' instead of 'canplaythrough' for faster response on slow connections
      video.addEventListener('canplay', handleVideoLoad);
      video.addEventListener('error', handleVideoError);
      video.load();
    }

    if (audio) {
      // Use 'canplay' instead of 'canplaythrough' for faster response
      audio.addEventListener('canplay', handleAudioLoad);
      audio.addEventListener('error', handleAudioError);
      audio.load();
    }

    return () => {
      if (video) {
        video.removeEventListener('canplay', handleVideoLoad);
        video.removeEventListener('error', handleVideoError);
      }
      if (audio) {
        audio.removeEventListener('canplay', handleAudioLoad);
        audio.removeEventListener('error', handleAudioError);
      }
    };
  }, []);

  // Fixed loading progress - always completes in 7 seconds
  useEffect(() => {
    if (!isLoading) return;

    const duration = 7000; // 7 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      
      if (currentProgress >= 100) {
        setLoadingProgress(100);
        clearInterval(timer);
        setTimeout(() => {
          setIsReady(true);
        }, 300);
      } else {
        setLoadingProgress(currentProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isLoading]);

  // Fetch comments from database
  useEffect(() => {
    fetchComments();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          const newComment = payload.new as Comment;
          setComments(prev => [
            { 
              ...newComment, 
              timestamp: new Date(newComment.timestamp) 
            }, 
            ...prev
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } else if (data) {
      setComments(data.map(comment => ({
        ...comment,
        timestamp: new Date(comment.created_at)
      })));
    }
    setIsLoadingComments(false);
  };

  const handleLike = () => {
    if (!isLiked) {
      setLikes(prev => prev + 1);
      setIsLiked(true);
      setShowHeartAnimation(true);
      
      // Add floating heart
      const newHeart = {
        id: Date.now(),
        x: Math.random() * 50 + 25, // Random position between 25% and 75%
        y: Math.random() * 20 + 40, // Random position between 40% and 60%
      };
      setFloatingHearts(prev => [...prev, newHeart]);
      
      // Remove floating heart after animation
      setTimeout(() => {
        setFloatingHearts(prev => prev.filter(heart => heart.id !== newHeart.id));
      }, 1000);
      
      // Reset heart animation
      setTimeout(() => setShowHeartAnimation(false), 600);
      
      toast({
        title: "❤️ Loved!",
        description: "Thank you for sharing the love!",
      });
    } else {
      setLikes(prev => prev - 1);
      setIsLiked(false);
    }
  };

  // Video and audio control handlers - optimized for low bandwidth
  const toggleVideoPlay = async () => {
    if (!videoRef.current || !audioRef.current) return;
    
    if (videoRef.current.paused) {
      try {
        // For low-end devices, start playing even if not fully buffered
        // This allows playback to start faster on slow connections
        if (videoRef.current.readyState < 2) {
          console.log('Video buffering, starting playback anyway...');
        }

        // Sync audio to video time
        audioRef.current.currentTime = videoRef.current.currentTime;
        
        // Start both together with better error handling
        try {
          await Promise.all([
            videoRef.current.play(),
            audioRef.current.play()
          ]);
          setIsPlaying(true);
        } catch (error) {
          // Fallback: try playing them separately
          console.warn('Parallel playback failed, trying sequentially:', error);
          try {
            await videoRef.current.play();
            try {
              await audioRef.current.play();
            } catch (audioError) {
              console.warn('Audio playback failed, continuing with video only:', audioError);
            }
            setIsPlaying(true);
          } catch (videoError) {
            console.error('Video playback failed:', videoError);
            setIsPlaying(false);
            toast({
              title: "Playback Error",
              description: "Unable to play video. Please check your connection.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error in playback handler:', error);
        setIsPlaying(false);
      }
    } else {
      videoRef.current.pause();
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoClick = () => {
    toggleVideoPlay();
  };

  const handleVideoDoubleClick = () => {
    handleLike();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join Us On Our Wedding Day!',
      text: 'Join us as we celebrate our love and begin our journey together! 💍✨',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `${shareData.text} ${shareData.url}`
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleAddComment = async () => {
    if (newComment.name.trim() && newComment.message.trim()) {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            name: newComment.name.trim(),
            message: newComment.message.trim(),
          }
        ]);

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive"
        });
      } else {
        setNewComment({ name: '', message: '' });
        toast({
          title: "💬 Comment Added!",
          description: "Thank you for your congratulations!",
        });
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive"
      });
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setSwipedCommentId(null);
      toast({
        title: "Comment Deleted",
        description: "The comment has been removed.",
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent, commentId: string) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent, commentId: string) => {
    if (!touchStart) return;

    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = Math.abs(touchStart.y - touchEnd.y);

    // Swipe left detection (deltaX > 50 and mostly horizontal)
    if (deltaX > 50 && deltaY < 30) {
      setSwipedCommentId(commentId);
    } else if (deltaX < -30) {
      // Swipe right to close
      setSwipedCommentId(null);
    }

    setTouchStart(null);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours === 1) return '1h ago';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handleOpenEnvelope = () => {
    setEnvelopeOpened(true);
    setTimeout(() => {
      setShowEnvelope(false);
      setIsLoading(true);
    }, 800);
  };

  // Envelope Screen
  if (showEnvelope) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center transition-opacity duration-700">
        <div 
          className={`cursor-pointer transition-all duration-1000 ease-out ${
            envelopeOpened ? 'scale-150 opacity-0' : 'scale-100 opacity-100 hover:scale-105'
          }`}
          onClick={handleOpenEnvelope}
        >
          <div className="relative">
            {/* Envelope body */}
            <div className="w-80 h-52 bg-white rounded-lg shadow-2xl relative overflow-hidden transition-all duration-700">
              <div className="absolute inset-0 border-4 border-rose-200 rounded-lg" />
              
              {/* Envelope flap */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-rose-300 to-pink-400 transition-all duration-700 origin-top ${
                envelopeOpened ? '-translate-y-full rotate-[-15deg]' : ''
              }`}>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-rose-200" 
                  style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} 
                />
              </div>

              {/* Invitation card peeking */}
              <div className="absolute inset-4 top-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded flex flex-col items-center justify-center p-6">
                <div className="text-rose-900 text-center space-y-3">
                  <h2 className="font-playfair text-3xl font-bold">S & A</h2>
                  <div className="text-6xl">💍</div>
                  <p className="font-inter text-sm">Tap to open</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (isLoading && !isReady) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-6">
          <div className="font-playfair text-3xl font-semibold text-rose-900 mb-8">
            Shabrina & Arif
          </div>
          <div className="w-64 h-2 bg-rose-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="font-inter text-sm text-rose-700">Loading your announcement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black transition-opacity duration-1000 ${
      isReady ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        controls={false}
        muted
        loop
        playsInline
        preload="metadata"
        onClick={handleVideoClick}
        onDoubleClick={handleVideoDoubleClick}
        crossOrigin="anonymous"
      >
        <source src="/wedding-invitation-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 cursor-pointer"
          onClick={toggleVideoPlay}
          onDoubleClick={handleVideoDoubleClick}
          role="button"
          aria-label="Resume video"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleVideoPlay();
          }}
        >
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Floating Hearts Animation */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-float-up"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
          }}
        >
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        </div>
      ))}

      {/* Top Gradient Overlay for Title */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-[5]" />

      {/* Top Title */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="text-white drop-shadow-lg">
          <h1 className="font-playfair text-2xl font-semibold mb-2">
            Shabrina & Arif
          </h1>
          <p className="font-inter text-sm opacity-90">Wedding Announcement</p>
        </div>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        muted={isMuted}
        preload="metadata"
        crossOrigin="anonymous"
      >
        <source src="/wedding-audio.mp3" type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>

      {/* Sound Control Button - Bottom Right */}
      <div className="absolute right-4 bottom-6 z-10">
        <Button
          onClick={toggleMute}
          className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
          size="icon"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-10">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleLike}
            className={`w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300 ${
              showHeartAnimation ? 'animate-heart-bounce' : ''
            } ${isLiked ? 'animate-pulse-ring' : ''}`}
            size="icon"
          >
            <Heart 
              className={`w-6 h-6 transition-colors duration-300 ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-white'
              }`} 
            />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">{likes}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={() => setShowComments(true)}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">{comments.length}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <Share2 className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Bottom Gradient Overlay for Content */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-[5]" />

      {/* Bottom Content */}
      <div className="absolute bottom-6 left-6 right-20 z-10">
        <div className="text-white drop-shadow-lg">
          <p className="font-inter text-sm mb-2 opacity-95">
            We're excited to announce our upcoming wedding, celebrated together with our families.
          </p>
          <p className="font-inter text-xs opacity-80">
            Your prayers and support mean so much to us. Thank you for sending your love and blessings our way. ✨💍✨ #ShabrinaArif 14/11/25
          </p>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <Card className="w-full max-h-[70vh] bg-white rounded-t-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-xl font-semibold">
                  Congratulations ({comments.length})
                </h3>
                <Button
                  onClick={() => setShowComments(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Add Comment Form */}
              <div className="border-b pb-4 mb-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={newComment.name}
                    onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                    className="border-romantic-pink/30 focus:border-romantic-pink"
                  />
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Write your congratulations..."
                      value={newComment.message}
                      onChange={(e) => setNewComment(prev => ({ ...prev, message: e.target.value }))}
                      className="flex-1 border-romantic-pink/30 focus:border-romantic-pink min-h-[80px]"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.name.trim() || !newComment.message.trim()}
                      className="self-end bg-romantic-pink hover:bg-romantic-pink/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="max-h-60 overflow-y-auto space-y-4">
                {isLoadingComments ? (
                  <div className="text-center text-gray-500 py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No comments yet. Be the first!</div>
                ) : (
                  comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="relative border-b border-gray-100 pb-3 last:border-0 overflow-hidden"
                    onTouchStart={(e) => handleTouchStart(e, comment.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, comment.id)}
                  >
                    <div 
                      className={`transition-transform duration-300 ${
                        swipedCommentId === comment.id ? '-translate-x-20' : 'translate-x-0'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-inter font-medium text-sm text-gray-900">
                          {comment.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="font-inter text-sm text-gray-700 leading-relaxed">
                        {comment.message}
                      </p>
                    </div>
                    {swipedCommentId === comment.id && (
                      <Button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 h-auto"
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReelsInterface;