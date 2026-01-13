'use client';

import { Progress } from '@/components/ui/progress';

interface ProcessingProgressProps {
  isProcessing: boolean;
  currentFrame: number;
  totalFrames: number;
  className?: string;
  error?: boolean;
}

export function ProcessingProgress({ 
  isProcessing, 
  currentFrame, 
  totalFrames, 
  className,
  error = false
}: ProcessingProgressProps) {
  if (!isProcessing && totalFrames === 0) return null;

  // During processing, we don't know total frames, so show indeterminate progress
  // After processing, we can show actual progress for animation scrubbing
  const showIndeterminate = isProcessing && totalFrames === 0;
  const progress = !showIndeterminate && totalFrames > 0 ? (currentFrame / totalFrames) * 100 : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {error ? "Processing stopped due to error" : 
           isProcessing ? "Processing video..." : 
           "Processing complete"}
        </span>
        <span>
          {showIndeterminate ? 
            `${currentFrame} frames processed` : 
            `${currentFrame} / ${totalFrames} frames`
          }
        </span>
      </div>
      
      {showIndeterminate ? (
        // Indeterminate progress bar with pulsing animation
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-full"></div>
        </div>
      ) : (
        <Progress value={progress} className="w-full" />
      )}
      
      {error && (
        <p className="text-sm text-destructive">
          Check your internet connection and try again.
        </p>
      )}
    </div>
  );
}
