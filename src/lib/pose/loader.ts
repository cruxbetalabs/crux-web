/**
 * Utility to dynamically load MediaPipe Pose from CDN
 * This function should only be called on the client side
 */
export async function loadMediaPipePose(): Promise<boolean> {
  // Early return if not in browser environment
  if (typeof window === 'undefined') {
    console.warn('loadMediaPipePose called on server side');
    return false;
  }

  // Check if already loaded
  if ((window as any).Pose) {
    console.log('MediaPipe Pose already loaded');
    return true;
  }

  console.log('Loading MediaPipe Pose...');
  
  // Load MediaPipe Pose script
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js';
    script.onload = () => {
      console.log('MediaPipe Pose loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load MediaPipe Pose');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}
