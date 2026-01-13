'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause } from 'lucide-react';

interface AnimationControlsProps {
  currentFrame: number;
  maxFrame: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onPlayPause: () => void;
}

export function AnimationControls({
  currentFrame,
  maxFrame,
  isPlaying,
  onFrameChange,
  onPlayPause
}: AnimationControlsProps) {
  return (
    <Card>
      <CardContent className="px-4">
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={maxFrame}
            step={1}
            value={[currentFrame]}
            onValueChange={(value) => onFrameChange(value[0])}
            className="flex-1"
          />
          <Button
            onClick={onPlayPause}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-2 text-center">
          Frame {currentFrame} / {maxFrame}
        </div>
      </CardContent>
    </Card>
  );
}
