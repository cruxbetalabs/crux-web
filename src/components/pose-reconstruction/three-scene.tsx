'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PoseRenderer } from '@/lib/pose/three-renderer';
import { Landmark } from '@/lib/pose/types';

interface ThreeSceneProps {
  landmarks: Landmark[] | null;
  hipOffset: { x: number; y: number };
  className?: string;
}

export function ThreeScene({ landmarks, hipOffset, className }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PoseRenderer | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const animate = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.render();
    }
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Initialize renderer
    rendererRef.current = new PoseRenderer(canvas);

    // Start animation loop
    animate();

    // Use ResizeObserver for better resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current && rendererRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        rendererRef.current.resize(rect.width, rect.height);
      }
    });

    resizeObserver.observe(canvas);

    // Initial size setup
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    rendererRef.current.resize(rect.width, rect.height);

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [animate]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateLandmarks(landmarks || [], hipOffset);
    }
  }, [landmarks, hipOffset]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full min-h-[400px] block bg-black ${className}`}
    />
  );
}
