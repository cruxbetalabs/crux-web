export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  poseWorldLandmarks?: Landmark[];
  poseLandmarks?: Landmark[];
}

export interface Hip2DTrajectory {
  x: number;
  y: number;
}

export interface PoseState {
  allLandmarks: Landmark[][];
  all2DLandmarks: Landmark[][];
  hip2DTrajectory: (Hip2DTrajectory | null)[];
  smoothedHip2DTrajectory: (Hip2DTrajectory | null)[];
  smoothedLandmarks: Landmark[][];
  hip2DStart: Hip2DTrajectory | null;
  hip2DScale: number;
  autoHip2DScale: number | null;
  animationFrame: number;
  isPlaying: boolean;
  animationReady: boolean;
  animationSpeed: number;
  animationFrameFloat: number;
  smoothingWindow: number;
  smoothingOrder: number;
  applySmoothing: boolean;
  isProcessing: boolean;
}

export interface CameraState {
  radius: number;
  height: number;
  azimuth: number;
  phi: number;
}

// MediaPipe pose connections for skeleton visualization
export const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], 
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], 
  [27, 29], [29, 31], [26, 28], [28, 30], [30, 32], [27, 31], [28, 32]
];
