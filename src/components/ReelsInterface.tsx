import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const ASPECT_RATIO = 16 / 9;

const ReelsInterface = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Instagram Reels Centered 16:9 Container */}
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
          onClick={toggleVideoPlay}
        >
          <source src="/wedding-invitation-video.mp4" type="video/mp4" />
        </video>
        {/* Play Overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 cursor-pointer pointer-events-auto">
            <div className="bg-black/60 rounded-full p-4 mb-3">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
            <span className="text-white text-lg font-semibold drop-shadow">Click to Play</span>
          </div>
        )}
        {/* Example floating action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-4 z-20">
          <Button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-12 h-12 rounded-full ${isLiked ? 'bg-pink-500' : 'bg-black/50'} backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300`}
            size="icon"
          >
            <Heart className="w-6 h-6 text-white" />
          </Button>
          <Button
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          <Button
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border-0 hover:bg-black/70 transition-all duration-300"
            size="icon"
          >
            <Share2 className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReelsInterface;
