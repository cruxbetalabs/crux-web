'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePoseProcessing } from '@/hooks/use-pose-processing';
import { useAnimation } from '@/hooks/use-animation';
import { VideoViewer } from './video-viewer';
import { ControlPanel } from './control-panel';
import { OutputLog } from './output-log';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Settings, Bug } from 'lucide-react';

export function PoseReconstruction() {
  const {
    poseState,
    outputLog,
    videoFile,
    videoRef,
    mediaPipeReady,
    processingFrame,
    updatePoseState,
    handleVideoUpload,
    processVideo,
    getHip2DOffset,
    getCurrentLandmarks
  } = usePoseProcessing();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  // Handle animation
  useAnimation({
    isPlaying: poseState.isPlaying && poseState.animationReady,
    maxFrames: poseState.allLandmarks.length,
    animationSpeed: poseState.animationSpeed,
    currentFrame: poseState.animationFrame,
    onFrameChange: (frame) => updatePoseState({ animationFrame: frame })
  });

  const handleStartProcessing = useCallback(async () => {
    console.log('Start processing button clicked');
    try {
      await processVideo();
    } catch (error) {
      console.error('Error during processing:', error);
    }
  }, [processVideo]);

  // Control handlers
  const handleHip2DScaleChange = useCallback((value: number) => {
    updatePoseState({ hip2DScale: value });
  }, [updatePoseState]);

  const handleSmoothingWindowChange = useCallback((value: number) => {
    updatePoseState({ smoothingWindow: value });
    // Recompute smoothing if we have landmarks
    if (poseState.allLandmarks.length >= value) {
      // Note: In a real implementation, you'd want to recompute smoothing here
      // For now, we'll just update the parameter
    }
  }, [updatePoseState, poseState.allLandmarks.length]);

  const handleSmoothingOrderChange = useCallback((value: number) => {
    updatePoseState({ smoothingOrder: value });
  }, [updatePoseState]);

  const handleApplySmoothingChange = useCallback((checked: boolean) => {
    updatePoseState({ applySmoothing: checked });
  }, [updatePoseState]);

  const handleAnimationSpeedChange = useCallback((value: number) => {
    updatePoseState({ animationSpeed: value });
  }, [updatePoseState]);

  const handlePlayPause = useCallback(() => {
    updatePoseState({ isPlaying: !poseState.isPlaying });
  }, [updatePoseState, poseState.isPlaying]);

  const handleFrameChange = useCallback((frame: number) => {
    updatePoseState({ animationFrame: frame });
  }, [updatePoseState]);

  // Get current frame data
  const currentLandmarks = getCurrentLandmarks(poseState.animationFrame);
  const hipOffset = getHip2DOffset(poseState.animationFrame);

  // Scroll to 3D scene when animation is ready
  useEffect(() => {
    if (poseState.animationReady) {
      const sceneElement = document.getElementById('video-viewer');
      if (sceneElement) {
        sceneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [poseState.animationReady]);

  return (
    <div className="h-screen flex flex-col container mx-auto p-4 max-w-2xl">
      {/* Header - Fixed height */}
      <div className="text-center space-y-2 flex-shrink-0 mb-4">
        <h1 className="text-3xl font-bold">Crux Web</h1>
        <p className="text-muted-foreground">A climbing pose 3D reconstruction web app.</p>

        {/* Header actions */}
        <div className="flex justify-center gap-2">

          <Drawer
            trigger={
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            }
            title="Pose Reconstruction Settings"
            description="Adjust parameters for pose detection and smoothing"
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
          >
            <div className="space-y-6 px-4 pb-6">
              <ControlPanel
                hip2DScale={poseState.hip2DScale}
                onHip2DScaleChange={handleHip2DScaleChange}
                smoothingWindow={poseState.smoothingWindow}
                onSmoothingWindowChange={handleSmoothingWindowChange}
                smoothingOrder={poseState.smoothingOrder}
                onSmoothingOrderChange={handleSmoothingOrderChange}
                applySmoothing={poseState.applySmoothing}
                onApplySmoothingChange={handleApplySmoothingChange}
                animationSpeed={poseState.animationSpeed}
                onAnimationSpeedChange={handleAnimationSpeedChange}
              />
            </div>
          </Drawer>

          <Drawer
            trigger={
              <Button variant="outline" size="sm">
                <Bug className="h-4 w-4 mr-2" />
                Debug
              </Button>
            }
            title="Debug Information"
            description="Development information and processing logs"
            open={debugOpen}
            onOpenChange={setDebugOpen}
          >
            <div className="space-y-6 px-4 pb-6">
              {/* Debug Info */}
              <div className="text-left space-y-2">
                <h3 className="font-semibold">Debug Info</h3>
                <div className="text-sm space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">Video File</span>
                    <span className="font-medium break-all">{videoFile ? videoFile.name : 'None'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">Is Processing</span>
                    <span className="font-medium">{poseState.isProcessing.toString()}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">Processing Frame</span>
                    <span className="font-medium">{processingFrame}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">Animation Ready</span>
                    <span className="font-medium">{poseState.animationReady.toString()}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">Landmarks Count</span>
                    <span className="font-medium">{poseState.allLandmarks.length}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">MediaPipe Available</span>
                    <span className="font-medium">{mediaPipeReady ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Processing Log */}
              <OutputLog value={outputLog} />
            </div>
          </Drawer>
        </div>
      </div>

      {/* Main Video Viewer - Takes remaining height */}
      <div id="video-viewer" className="flex-1 min-h-0">
        <VideoViewer
          videoRef={videoRef}
          onVideoUpload={handleVideoUpload}
          onStartProcessing={handleStartProcessing}
          isProcessing={poseState.isProcessing}
          canStart={!!videoFile && !poseState.isProcessing && mediaPipeReady}
          animationReady={poseState.animationReady}
          landmarks={currentLandmarks}
          hipOffset={hipOffset}
          currentFrame={poseState.animationFrame}
          totalFrames={poseState.allLandmarks.length}
          processingFrame={processingFrame}
          isPlaying={poseState.isPlaying}
          onFrameChange={handleFrameChange}
          onPlayPause={handlePlayPause}
        />
      </div>
    </div>
  );
}
