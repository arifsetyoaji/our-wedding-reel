import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WeddingInvitation = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Wedding invitation link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareInvitation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Us On Our Wedding Day!",
          text: "Join us as we celebrate our love and begin our journey together.",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-romantic flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-in fade-in-50 duration-1000">
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-4 tracking-wide">
            Join Us On Our
          </h1>
          <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-medium text-romantic-pink mb-6 tracking-wider">
            Wedding Day
          </h2>
          <p className="font-inter text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're excited to share this special moment with you. Watch our invitation and join us in celebrating our love story.
          </p>
        </div>

        <Card className="shadow-romantic border-0 bg-card/95 backdrop-blur-sm animate-in fade-in-50 duration-1000 delay-300">
          <div className="p-6 md:p-8">
              <div className="relative w-full max-w-3xl mx-auto">
              {/* Video Container with 16:9 Aspect Ratio - Perfect fit with no white spaces */}
              <div className="relative w-full overflow-hidden rounded-lg shadow-elegant" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  controls
                  autoPlay
                  preload="auto"
                >
                  <source src="/wedding-invitation-video.mp4" type="video/mp4" />
                  <p className="text-muted-foreground text-center py-8">
                    Your browser doesn't support video playback. Please update your browser or 
                    <a href="/wedding-invitation-video.mp4" className="text-primary underline ml-1">
                      download the video directly
                    </a>.
                  </p>
                </video>
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-8 text-center space-y-4">
              <p className="font-inter text-muted-foreground text-sm md:text-base">
                Share our joy with family and friends
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={shareInvitation}
                  variant="wedding-share"
                  className="font-inter font-medium"
                  size="lg"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Invitation
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="wedding-copy"
                  className="font-inter font-medium"
                  size="lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 animate-in fade-in-50 duration-1000 delay-700">
          <p className="font-inter text-sm text-muted-foreground">
            We can't wait to celebrate with you! 💕
          </p>
        </div>
      </main>
    </div>
  );
};

export default WeddingInvitation;
