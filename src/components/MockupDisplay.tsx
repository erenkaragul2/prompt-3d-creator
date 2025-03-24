
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Share2, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import LoadingAnimation from './LoadingAnimation';

interface MockupDisplayProps {
  imageUrl: string | null;
  prompt: string;
  isLoading: boolean;
}

const MockupDisplay: React.FC<MockupDisplayProps> = ({ 
  imageUrl, 
  prompt,
  isLoading 
}) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset error state when new image is loaded
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `3d-mockup-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  };

  const handleShare = () => {
    if (!imageUrl) return;
    
    if (navigator.share) {
      navigator.share({
        title: '3D Mockup',
        text: prompt,
        url: imageUrl,
      })
      .then(() => toast.success('Shared successfully'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(imageUrl)
        .then(() => toast.success('Image URL copied to clipboard'))
        .catch(() => toast.error('Failed to copy URL'));
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
      .then(() => toast.success('Prompt copied to clipboard'))
      .catch(() => toast.error('Failed to copy prompt'));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleImageError = () => {
    console.error("Image failed to load:", imageUrl);
    setImageError(true);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full glass rounded-lg overflow-hidden transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none p-6 bg-background/95 backdrop-blur-lg flex items-center justify-center" : "",
      )}
    >
      <div className={cn(
        "w-full relative",
        isFullscreen ? "max-w-5xl" : ""
      )}>
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium truncate max-w-[60%]">
            {prompt ? prompt : 'Your 3D mockup will appear here'}
          </h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRotate} 
              disabled={isLoading || !imageUrl || imageError}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut} 
              disabled={isLoading || !imageUrl || scale <= 0.5 || imageError}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn} 
              disabled={isLoading || !imageUrl || scale >= 2 || imageError}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen} 
              disabled={isLoading || !imageUrl || imageError}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Main display area */}
        <div className="aspect-square md:aspect-video w-full relative bg-card/50 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <LoadingAnimation />
              <p className="text-sm text-muted-foreground mt-4">Generating your 3D mockup...</p>
            </div>
          ) : imageUrl && !imageError ? (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Generated 3D mockup"
              className="max-w-full max-h-full object-contain transition-all duration-300 animate-blur-in"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
              }}
              onError={handleImageError}
            />
          ) : imageError ? (
            <div className="text-center p-8 flex flex-col items-center">
              <div className="mb-4 text-destructive">
                <RefreshCw className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-semibold">Image generation failed</p>
              </div>
              <p className="text-muted-foreground mb-4">The API was unable to generate an image. Please try again with a different prompt.</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Enter a prompt and click Generate to create your 3D mockup</p>
            </div>
          )}
        </div>
        
        {/* Action bar */}
        {imageUrl && !isLoading && !imageError && (
          <div className="flex items-center justify-between p-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyPrompt}
              className="text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy Prompt
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button 
                size="sm" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockupDisplay;
