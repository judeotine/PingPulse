
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Copy, Twitter, Facebook, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

interface ShareResultsProps {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  disabled?: boolean;
}

const ShareResults = ({ downloadSpeed, uploadSpeed, ping, disabled = false }: ShareResultsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const shareText = `My internet speed: ⚡ Download: ${downloadSpeed.toFixed(1)} Mbps | ⬆️ Upload: ${uploadSpeed.toFixed(1)} Mbps | 📡 Ping: ${ping} ms | Tested with PulseDash`;
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Internet Speed Test Results',
          text: shareText,
          url: window.location.href
        });
        toast.success('Results shared successfully');
      } else {
        // If Web Share API is not available, open dialog
        setIsDialogOpen(true);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
      .then(() => {
        toast.success('Results copied to clipboard');
        setIsDialogOpen(false);
      })
      .catch(error => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy results');
      });
  };
  
  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setIsDialogOpen(false);
  };
  
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setIsDialogOpen(false);
  };
  
  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=My%20Internet%20Speed&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleShare}
        disabled={disabled}
      >
        <Share2 className="h-4 w-4 mr-2" /> Share Results
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Speed Test Results</DialogTitle>
            <DialogDescription>
              Share your internet speed test results with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-muted/30 rounded-md">
            <p className="text-sm">{shareText}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button variant="outline" className="w-full" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" /> Copy Text
            </Button>
            <Button variant="outline" className="w-full" onClick={shareToTwitter}>
              <Twitter className="h-4 w-4 mr-2" /> Twitter
            </Button>
            <Button variant="outline" className="w-full" onClick={shareToFacebook}>
              <Facebook className="h-4 w-4 mr-2" /> Facebook
            </Button>
            <Button variant="outline" className="w-full" onClick={shareToLinkedIn}>
              <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareResults;
