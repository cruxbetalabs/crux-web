'use client';

import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VideoUploadProps {
  onVideoUpload: (file: File) => boolean;
  onStartProcessing: () => void;
  isProcessing: boolean;
  canStart: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const VideoUpload = forwardRef<HTMLInputElement, VideoUploadProps>(function VideoUpload({ 
  onVideoUpload, 
  onStartProcessing, 
  isProcessing, 
  canStart,
  videoRef
}, ref) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const success = onVideoUpload(file);
    if (success && videoRef.current) {
      const videoURL = URL.createObjectURL(file);
      videoRef.current.src = videoURL;
      videoRef.current.style.display = 'block';
      
      // Clean up the previous URL when component unmounts
      return () => URL.revokeObjectURL(videoURL);
    } else if (!success) {
      // Reset input if upload failed
      e.target.value = '';
      if (videoRef.current) {
        videoRef.current.style.display = 'none';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="pb-4" htmlFor="video-upload">Upload Video</Label>
        <div className="space-y-2">
          <Input
            id="video-upload"
            ref={ref}
            type="file"
            accept="video/mp4,video/quicktime,video/mov"
            onChange={handleFileChange}
            className="w-full"
          />
          <Button 
            onClick={onStartProcessing}
            disabled={!canStart || isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Start Pose Detection'}
          </Button>
        </div>
      </div>
      
      <video 
        ref={videoRef}
        muted 
        className="w-full max-w-full h-80 object-contain rounded-lg bg-muted"
      />
    </div>
  );
});
