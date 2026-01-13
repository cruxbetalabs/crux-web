'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PoseState,
  Landmark,
  Hip2DTrajectory,
  PoseResults
} from '@/lib/pose/types';
import {
  smoothAllLandmarks,
  smoothHip2DTrajectory,
  computeAutoHip2DScale
} from '@/lib/pose/smoothing';
import { loadMediaPipePose } from '@/lib/pose/loader';

// MediaPipe Pose interface for TypeScript
interface Pose {
  setOptions(options: any): void;
  onResults(callback: (results: PoseResults) => void): void;
  send(input: { image: HTMLCanvasElement }): Promise<void>;
}

// Global declaration for MediaPipe Pose
declare global {
  interface Window {
    Pose: new (config: { locateFile: (file: string) => string }) => Pose;
  }
}

const initialPoseState: PoseState = {
  allLandmarks: [],
  all2DLandmarks: [],
  hip2DTrajectory: [],
  smoothedHip2DTrajectory: [],
  smoothedLandmarks: [],
  hip2DStart: null,
  hip2DScale: 6.0,
  autoHip2DScale: null,
  animationFrame: 0,
  isPlaying: true,
  animationReady: false,
  animationSpeed: 0.2,
  animationFrameFloat: 0,
  smoothingWindow: 7,
  smoothingOrder: 2,
  applySmoothing: true,
  isProcessing: false,
};

export function usePoseProcessing() {
  const [poseState, setPoseState] = useState<PoseState>(initialPoseState);
  const [outputLog, setOutputLog] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const poseRef = useRef<Pose | null>(null);

  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [processingFrame, setProcessingFrame] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);

    // Only check MediaPipe after mounting to prevent hydration issues
    const checkMediaPipe = () => {
      if (typeof window !== 'undefined' && (window as any).Pose) {
        console.log('MediaPipe Pose is available');
        setMediaPipeReady(true);
        return true;
      }
      return false;
    };

    // Check immediately after mount
    if (!checkMediaPipe()) {
      // If not available, check every 100ms for up to 10 seconds
      const interval = setInterval(() => {
        if (checkMediaPipe()) {
          clearInterval(interval);
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.error('MediaPipe Pose failed to load within 10 seconds');
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Remove the separate MediaPipe check effect that was causing hydration issues

  const updatePoseState = useCallback((updates: Partial<PoseState>) => {
    setPoseState(prev => ({ ...prev, ...updates }));
  }, []);

  const addToLog = useCallback((message: string) => {
    setOutputLog(prev => prev + message + '\n');
  }, []);

  const clearLog = useCallback(() => {
    setOutputLog('');
  }, []);

  const handleVideoUpload = useCallback((file: File) => {
    // Accept common video formats
    const allowedTypes = ['video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(mp4|mov|avi|webm)$/)) {
      alert('Please upload a video file (MP4, MOV).');
      return false;
    }

    setVideoFile(file);
    clearLog();

    // Reset pose state
    setPoseState(initialPoseState);

    return true;
  }, [clearLog]);

  const initializePose = useCallback(async () => {
    if (poseRef.current) {
      poseRef.current = null;
    }

    // Check if MediaPipe is ready and we're on the client
    if (!isMounted || !mediaPipeReady || typeof window === 'undefined' || !(window as any).Pose) {
      console.error('MediaPipe Pose not ready. Available:', typeof window !== 'undefined' ? Object.keys(window).filter(k => k.toLowerCase().includes('pose')) : 'window undefined');
      return { pose: null, frameResults: null };
    }

    console.log('Creating MediaPipe Pose instance...');
    const pose = new (window as any).Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    let frameResults: {
      landmarks: Landmark[][];
      landmarks2D: Landmark[][];
      hipTrajectory: (Hip2DTrajectory | null)[];
      hipStart: Hip2DTrajectory | null;
    } = {
      landmarks: [],
      landmarks2D: [],
      hipTrajectory: [],
      hipStart: null
    };

    pose.onResults((results: PoseResults) => {
      console.log('Pose results received:', results);
      if (results.poseWorldLandmarks && results.poseLandmarks) {
        addToLog(`Found ${results.poseWorldLandmarks.length} landmarks`);

        frameResults.landmarks.push(results.poseWorldLandmarks);
        frameResults.landmarks2D.push(results.poseLandmarks);

        // Compute hip center in 2D (image space)
        const lhip = results.poseLandmarks[23];
        const rhip = results.poseLandmarks[24];

        if (lhip && rhip) {
          const cx = (lhip.x + rhip.x) / 2;
          const cy = (lhip.y + rhip.y) / 2;
          frameResults.hipTrajectory.push({ x: cx, y: cy });

          if (!frameResults.hipStart) {
            frameResults.hipStart = { x: cx, y: cy };
          }
        } else {
          frameResults.hipTrajectory.push(null);
        }
      } else {
        console.log('No pose landmarks found in results');
        addToLog('No pose detected in this frame');
      }
    });

    poseRef.current = pose;
    return { pose, frameResults };
  }, [addToLog, mediaPipeReady, isMounted]);

  const processVideo = useCallback(async () => {
    if (!videoFile || !videoRef.current) {
      console.log('No video file or video ref:', { videoFile, videoRef: videoRef.current });
      return;
    }

    console.log('Starting video processing...');
    updatePoseState({ isProcessing: true });
    setProcessingFrame(0);
    addToLog('Processing...');

    const video = videoRef.current;
    console.log('Video element:', video);

    const result = await initializePose();
    console.log('Pose initialization result:', result);

    if (!result.pose || !result.frameResults) {
      addToLog('Error: MediaPipe Pose not available');
      updatePoseState({ isProcessing: false });
      return;
    }

    const { pose, frameResults } = result;

    // Ensure video is loaded and ready
    if (video.readyState < 2) {
      addToLog('Waiting for video to load...');
      await new Promise<void>((resolve) => {
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          resolve();
        };
        video.addEventListener('canplay', onCanPlay);
        video.load(); // Force reload if needed
      });
    }

    video.pause();
    video.currentTime = 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    let frameCount = 0;
    const totalFrames = Math.floor(video.duration * 10); // Assuming 10 FPS

    return new Promise<void>((resolve) => {
      const onSeeked = async () => {
        addToLog(`\nVideo state: paused=${video.paused}, ended=${video.ended}, currentTime=${video.currentTime}, duration=${video.duration}`);

        // Process the current frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          await pose!.send({ image: canvas });
          addToLog(`Processed frame at ${video.currentTime.toFixed(2)}s`);
          frameCount++;
          setProcessingFrame(frameCount);
        } catch (error) {
          console.error('Error processing frame:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);

          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            addToLog(`Network error: Cannot load MediaPipe assets. Please check your internet connection.`);
            // Stop processing on network errors
            video.removeEventListener('seeked', onSeeked);
            updatePoseState({ isProcessing: false });
            setProcessingFrame(0);
            return resolve();
          } else {
            addToLog(`Error processing frame: ${errorMessage}`);
          }
        }

        if (video.currentTime < video.duration) {
          // Move to next frame
          video.currentTime = Math.min(video.currentTime + 1 / 10, video.duration); // 10 FPS
          addToLog(`\nMoving to frame at ${video.currentTime}s`);
        } else {
          // Finished processing all frames
          video.removeEventListener('seeked', onSeeked);

          addToLog('\nApplying smoothing filter...');

          // Apply smoothing
          let smoothedLandmarks = frameResults!.landmarks;
          let smoothedHipTrajectory = frameResults!.hipTrajectory;

          if (poseState.applySmoothing) {
            smoothedLandmarks = smoothAllLandmarks(
              frameResults!.landmarks,
              poseState.smoothingWindow,
              poseState.smoothingOrder
            );
            smoothedHipTrajectory = smoothHip2DTrajectory(
              frameResults!.hipTrajectory,
              poseState.smoothingWindow,
              poseState.smoothingOrder
            );
          }

          // Compute auto scale
          const autoScale = computeAutoHip2DScale(
            frameResults!.landmarks,
            frameResults!.landmarks2D
          );

          let hip2DScale = poseState.hip2DScale;
          if (autoScale !== null) {
            hip2DScale = autoScale;
            addToLog(`\n[Auto] Movement scale set to ${autoScale.toFixed(2)} (based on hip width)`);
          }

          // Update state
          updatePoseState({
            allLandmarks: frameResults!.landmarks,
            all2DLandmarks: frameResults!.landmarks2D,
            hip2DTrajectory: frameResults!.hipTrajectory,
            smoothedHip2DTrajectory: smoothedHipTrajectory,
            smoothedLandmarks,
            hip2DStart: frameResults!.hipStart,
            hip2DScale,
            autoHip2DScale: autoScale,
            animationReady: true,
            isProcessing: false,
            animationFrame: 0,
            isPlaying: true
          });

          setProcessingFrame(0); // Reset processing frame
          addToLog('\nSmoothing done!');

          resolve();
        }
      };

      video.addEventListener('seeked', onSeeked);
      video.currentTime = 0;
    });
  }, [videoFile, poseState.applySmoothing, poseState.smoothingWindow, poseState.smoothingOrder, poseState.hip2DScale, addToLog, updatePoseState, initializePose]);

  const getHip2DOffset = useCallback((frameIdx: number) => {
    const hipTrajectory = (
      poseState.smoothedHip2DTrajectory &&
      poseState.smoothedHip2DTrajectory.length === poseState.hip2DTrajectory.length
    ) ? poseState.smoothedHip2DTrajectory : poseState.hip2DTrajectory;

    if (!hipTrajectory[frameIdx] || !poseState.hip2DStart) {
      return { x: 0, y: 0 };
    }

    return {
      x: -(hipTrajectory[frameIdx]!.x - poseState.hip2DStart.x) * poseState.hip2DScale,
      y: -(hipTrajectory[frameIdx]!.y - poseState.hip2DStart.y) * poseState.hip2DScale
    };
  }, [poseState.smoothedHip2DTrajectory, poseState.hip2DTrajectory, poseState.hip2DStart, poseState.hip2DScale]);

  const getCurrentLandmarks = useCallback((frameIdx: number) => {
    const landmarks = (
      poseState.smoothedLandmarks &&
      poseState.smoothedLandmarks.length === poseState.allLandmarks.length
    ) ? poseState.smoothedLandmarks[frameIdx] : poseState.allLandmarks[frameIdx];

    return landmarks || null;
  }, [poseState.smoothedLandmarks, poseState.allLandmarks]);

  return {
    poseState,
    videoFile,
    videoRef,
    mediaPipeReady,
    processingFrame,
    updatePoseState,
    handleVideoUpload,
    processVideo,
    getHip2DOffset,
    getCurrentLandmarks,
    addToLog,
    clearLog,
    outputLog
  };
}
