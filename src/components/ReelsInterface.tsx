import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";
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

const ASPECT_RATIO = 16 / 9;

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

  // Like, Play/Pause, Share, etc remain unchanged

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

  // Layout: Centered 16:9 container, never stretched
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div
        className="relative w-full max-w-2xl aspect-video bg-black rounded-xl overflow-hidden shadow-lg"
        style={{ aspectRatio: `${ASPECT_RATIO}` }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          controls={false}
          autoPlay
          loop
          playsInline
          onClick={handleVideoClick}
          onDoubleClick={() => setIsLiked(true)}
        >
          <source src="/wedding-invitation-video.mp4" type="video/mp4" />
        </video>

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 cursor-pointer pointer-events-auto">
            <div className="bg-black/60 rounded-full p-4 mb-3">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
            <span className="text-white text-lg font-semibold drop-shadow">Click to Play</span>
          </div>
        )}

        {/* Example overlays: likes, comments, etc. */}
        <div className="absolute top-4 right-4 flex flex-col gap-4 z-20">
          <Button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-12 h-12 rounded-full ${isLiked ? 'bg-pink-500' : 'bg-black/50'} backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300`}
            size="icon"
          >
            <Heart className="w-6 h-6 text-white" />
          </Button>
          <Button
            onClick={() => setShowComments(true)}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          <Button
            onClick={() => {navigator.share?.({title: "Wedding Reel", url: window.location.href});}}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <Share2 className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Comments and other overlays can go here */}
      </div>
    </div>
  );
};

export default ReelsInterface;
