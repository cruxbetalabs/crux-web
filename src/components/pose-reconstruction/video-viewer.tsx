'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { VideoUpload } from './video-upload';
import { ThreeScene } from './three-scene';
import { AnimationControls } from './animation-controls';
import { Landmark } from '@/lib/pose/types';

interface VideoViewerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoUpload: (file: File) => boolean;
  onStartProcessing: () => void;
  isProcessing: boolean;
  canStart: boolean;
  animationReady: boolean;
  landmarks: Landmark[] | null;
  hipOffset: { x: number; y: number };
  currentFrame: number;
  totalFrames: number;
  processingFrame?: number;
  // Animation controls
  isPlaying?: boolean;
  onFrameChange?: (frame: number) => void;
  onPlayPause?: () => void;
}

export function VideoViewer({
  videoRef,
  onVideoUpload,
  onStartProcessing,
  isProcessing,
  canStart,
  animationReady,
  landmarks,
  hipOffset,
  currentFrame,
  totalFrames,
  processingFrame = 0,
  isPlaying = false,
  onFrameChange,
  onPlayPause
}: VideoViewerProps) {
  const [activeTab, setActiveTab] = useState('video');
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);

  // Auto-switch to 3D scene when processing is done (only once)
  useEffect(() => {
    if (animationReady && activeTab === 'video' && !hasAutoSwitched) {
      setActiveTab('scene');
      setHasAutoSwitched(true);
    }
  }, [animationReady, activeTab, hasAutoSwitched]);

  // Reset auto-switch state when animation is no longer ready (new video uploaded)
  useEffect(() => {
    if (!animationReady) {
      setHasAutoSwitched(false);
      setActiveTab('video');
    }
  }, [animationReady]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pb-0 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="video">Video Upload</TabsTrigger>
              <TabsTrigger value="scene" disabled={!animationReady}>
                3D Scene
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pt-3 pb-6 flex-1 flex flex-col min-h-0">
            <TabsContent value="video" className="mt-0 flex-1 flex flex-col">
              <div className="space-y-4">
                <VideoUpload
                  videoRef={videoRef}
                  onVideoUpload={onVideoUpload}
                  onStartProcessing={onStartProcessing}
                  isProcessing={isProcessing}
                  canStart={canStart}
                />
                
                {(isProcessing || totalFrames > 0) && (
                  <div className="text-center text-sm text-muted-foreground">
                    {isProcessing ? (
                      <span>Processing video... {processingFrame} frames processed</span>
                    ) : (
                      <span>Processing complete - {totalFrames} frames ready</span>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="scene" className="mt-0 flex-1 flex flex-col min-h-0">
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <ThreeScene
                  landmarks={landmarks}
                  hipOffset={hipOffset}
                  className="rounded-lg border flex-1 min-h-0"
                />
                
                {/* Animation Controls - shown when animation is ready */}
                {animationReady && onFrameChange && onPlayPause && (
                  <AnimationControls
                    currentFrame={currentFrame}
                    maxFrame={Math.max(0, totalFrames - 1)}
                    isPlaying={isPlaying}
                    onFrameChange={onFrameChange}
                    onPlayPause={onPlayPause}
                  />
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
