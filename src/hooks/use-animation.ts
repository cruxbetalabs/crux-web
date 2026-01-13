'use client';

import { useEffect, useRef } from 'react';

interface UseAnimationProps {
  isPlaying: boolean;
  maxFrames: number;
  animationSpeed: number;
  currentFrame: number;
  onFrameChange: (frame: number) => void;
}

export function useAnimation({
  isPlaying,
  maxFrames,
  animationSpeed,
  currentFrame,
  onFrameChange
}: UseAnimationProps) {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const frameFloatRef = useRef<number>(currentFrame);

  useEffect(() => {
    frameFloatRef.current = currentFrame;
  }, [currentFrame]);

  useEffect(() => {
    if (!isPlaying || maxFrames === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update frame based on animation speed
      // Assuming 60 FPS, move animationSpeed frames per second
      frameFloatRef.current += (animationSpeed * deltaTime) / 1000 * 60;
      
      if (frameFloatRef.current >= maxFrames) {
        frameFloatRef.current = 0;
      }

      const newFrame = Math.floor(frameFloatRef.current);
      if (newFrame !== currentFrame) {
        onFrameChange(newFrame);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, maxFrames, animationSpeed, currentFrame, onFrameChange]);
}
