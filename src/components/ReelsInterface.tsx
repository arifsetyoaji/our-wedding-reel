import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Send, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
}

const ReelsInterface = () => {
  const [likes, setLikes] = useState(247);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      name: 'Sarah & Mike',
      message: 'Congratulations! Can\'t wait to celebrate with you both! 💕',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2', 
      name: 'The Johnson Family',
      message: 'Such a beautiful invitation! Wishing you both endless happiness! 🥂',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState({ name: '', message: '' });
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

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

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
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

  const handleAddComment = () => {
    if (newComment.name.trim() && newComment.message.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        name: newComment.name.trim(),
        message: newComment.message.trim(),
        timestamp: new Date(),
      };
      setComments(prev => [comment, ...prev]);
      setNewComment({ name: '', message: '' });
      toast({
        title: "💬 Comment Added!",
        description: "Thank you for your congratulations!",
      });
    }
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        controls={false}
        autoPlay
        loop
        playsInline
        onClick={handleVideoClick}
        {/* onDoubleClick={handleVideoDoubleClick} */}
      >
        <source src="/wedding-invitation-video.mp4" type="video/mp4" />
      </video>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20" onClick={handleVideoClick}>
          <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
            <Play className="w-9 h-9 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

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

      {/* Top Title */}
      <div className="absolute top-6 left-6 right-6 z-8">
        <div className="text-white">
          <h1 className="font-playfair text-2xl font-semibold mb-2">
            Shabrina & Arif
          </h1>
          <p className="font-inter text-sm opacity-80">Wedding Invitation</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-5 bottom-32 flex flex-col items-center space-y-6 z-10">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleLike}
            className={`w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300 ${
              showHeartAnimation ? 'animate-heart-bounce' : ''
            } ${isLiked ? 'animate-pulse-ring' : ''}`}
            size="icon"
          >
            <Heart 
              className={`w-9 h-9 transition-colors duration-300 ${
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
            className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <MessageCircle className="w-9 h-9 text-white" />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">{comments.length}</span>
        </div>

        {/* Share Button 
        <div className="flex flex-col items-center">
          <Button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <Share2 className="w-9 h-9 text-white" />
          </Button>
        </div>
      </div> */}

      {/* Bottom Content */}
      <div className="absolute bottom-6 left-6 right-20 z-10">
        <div className="text-white">
          <p className="font-inter text-sm mb-2 opacity-90">
            Join us as we celebrate our love and begin our journey together! 💕
          </p>
          <p className="font-inter text-xs opacity-70">
            We can't wait to celebrate with you! #ShabrinaArif2024
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
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-3 last:border-0">
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
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReelsInterface;
