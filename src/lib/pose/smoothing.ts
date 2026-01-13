import { Landmark, Hip2DTrajectory } from './types';

/**
 * Savitzky-Golay smoothing implementation
 * Reference: https://github.com/mljs/savitzky-golay
 */
export function savitzkyGolay(y: number[], window: number, order: number): number[] {
  // y: array of values, window: odd integer, order: polynomial order
  // Returns a new array with smoothed values
  if (window % 2 !== 1) throw new Error('Window length must be odd');
  if (window < order + 2) throw new Error('Window too small for polynomial order');
  
  const half = Math.floor(window / 2);
  const n = y.length;
  const result = new Array(n);
  
  // Precompute convolution coefficients (for central window)
  function getCoefficients(window: number, order: number): number[] {
    // For order=2, window=7, coefficients are:
    if (window === 7 && order === 2) {
      return [-2 / 21, 3 / 21, 6 / 21, 7 / 21, 6 / 21, 3 / 21, -2 / 21];
    }
    // Fallback: simple moving average
    return Array(window).fill(1 / window);
  }
  
  const coeffs = getCoefficients(window, order);
  
  for (let i = 0; i < n; ++i) {
    let acc = 0;
    for (let j = -half; j <= half; ++j) {
      let idx = i + j;
      if (idx < 0) idx = 0;
      if (idx >= n) idx = n - 1;
      acc += y[idx] * coeffs[j + half];
    }
    result[i] = acc;
  }
  
  return result;
}

/**
 * Smooth all landmarks across frames using Savitzky-Golay filter
 */
export function smoothAllLandmarks(
  allLandmarks: Landmark[][],
  windowLength = 7,
  polyOrder = 2
): Landmark[][] {
  if (!allLandmarks || allLandmarks.length < windowLength) return allLandmarks;
  
  const nFrames = allLandmarks.length;
  const nLandmarks = allLandmarks[0].length;
  
  // Prepare arrays for each coordinate
  const xs = Array.from({ length: nLandmarks }, () => new Array(nFrames));
  const ys = Array.from({ length: nLandmarks }, () => new Array(nFrames));
  const zs = Array.from({ length: nLandmarks }, () => new Array(nFrames));
  
  for (let f = 0; f < nFrames; ++f) {
    for (let l = 0; l < nLandmarks; ++l) {
      const lm = allLandmarks[f][l];
      xs[l][f] = lm ? lm.x : 0;
      ys[l][f] = lm ? lm.y : 0;
      zs[l][f] = lm ? lm.z : 0;
    }
  }
  
  // Smooth each landmark trajectory
  const xsSmooth = xs.map(arr => savitzkyGolay(arr, windowLength, polyOrder));
  const ysSmooth = ys.map(arr => savitzkyGolay(arr, windowLength, polyOrder));
  const zsSmooth = zs.map(arr => savitzkyGolay(arr, windowLength, polyOrder));
  
  // Reconstruct smoothed landmarks
  const smoothed: Landmark[][] = [];
  for (let f = 0; f < nFrames; ++f) {
    const frame: Landmark[] = [];
    for (let l = 0; l < nLandmarks; ++l) {
      if (allLandmarks[f][l]) {
        frame[l] = {
          x: xsSmooth[l][f],
          y: ysSmooth[l][f],
          z: zsSmooth[l][f],
          visibility: allLandmarks[f][l].visibility
        };
      } else {
        frame[l] = null as any;
      }
    }
    smoothed.push(frame);
  }
  
  return smoothed;
}

/**
 * Smooth hip trajectory across frames
 */
export function smoothHip2DTrajectory(
  hip2DTrajectory: (Hip2DTrajectory | null)[],
  windowLength = 7,
  polyOrder = 2
): (Hip2DTrajectory | null)[] {
  if (!hip2DTrajectory || hip2DTrajectory.length < windowLength) return hip2DTrajectory;
  
  const nFrames = hip2DTrajectory.length;
  const xs = new Array(nFrames);
  const ys = new Array(nFrames);
  
  for (let f = 0; f < nFrames; ++f) {
    xs[f] = hip2DTrajectory[f] ? hip2DTrajectory[f]!.x : 0;
    ys[f] = hip2DTrajectory[f] ? hip2DTrajectory[f]!.y : 0;
  }
  
  const xsSmooth = savitzkyGolay(xs, windowLength, polyOrder);
  const ysSmooth = savitzkyGolay(ys, windowLength, polyOrder);
  
  const smoothed: (Hip2DTrajectory | null)[] = [];
  for (let f = 0; f < nFrames; ++f) {
    if (hip2DTrajectory[f]) {
      smoothed[f] = { x: xsSmooth[f], y: ysSmooth[f] };
    } else {
      smoothed[f] = null;
    }
  }
  
  return smoothed;
}

/**
 * Compute automatic scale based on hip distance ratio between 2D and 3D
 */
export function computeAutoHip2DScale(
  allLandmarks: Landmark[][],
  all2DLandmarks: Landmark[][]
): number | null {
  const ratios: number[] = [];
  
  for (let f = 0; f < Math.min(allLandmarks.length, all2DLandmarks.length); ++f) {
    const lm3d = allLandmarks[f];
    const lm2d = all2DLandmarks[f];
    if (!lm3d || !lm2d) continue;
    
    const lhip3d = lm3d[23];
    const rhip3d = lm3d[24];
    const lhip2d = lm2d[23];
    const rhip2d = lm2d[24];
    
    if (lhip3d && rhip3d && lhip2d && rhip2d) {
      // 3D world distance
      const dx3 = lhip3d.x - rhip3d.x;
      const dy3 = lhip3d.y - rhip3d.y;
      const dz3 = lhip3d.z - rhip3d.z;
      const dist3d = Math.sqrt(dx3 * dx3 + dy3 * dy3 + dz3 * dz3);
      
      // 2D image distance
      const dx2 = lhip2d.x - rhip2d.x;
      const dy2 = lhip2d.y - rhip2d.y;
      const dist2d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      if (dist2d > 0.0001) ratios.push(dist3d / dist2d);
    }
  }
  
  if (ratios.length > 0) {
    // Use median for robustness
    ratios.sort((a, b) => a - b);
    return ratios[Math.floor(ratios.length / 2)];
  }
  
  return null;
}
