import type { Composition } from './types';

export interface AspectPreset {
  id: string;
  label: string;
  /** width / height */
  ratio: number | 'custom';
  hint: string;
}

export const ASPECT_PRESETS: AspectPreset[] = [
  { id: '16:9', label: '16:9', ratio: 16 / 9, hint: 'Landscape · video, YouTube' },
  { id: '9:16', label: '9:16', ratio: 9 / 16, hint: 'Portrait · Reels, Shorts, TikTok' },
  { id: '1:1', label: '1:1', ratio: 1, hint: 'Square · feed, profile' },
  { id: '4:5', label: '4:5', ratio: 4 / 5, hint: 'Portrait · Instagram feed' },
  { id: '3:4', label: '3:4', ratio: 3 / 4, hint: 'Portrait · Pinterest, print' },
  { id: '4:3', label: '4:3', ratio: 4 / 3, hint: 'Landscape · classic TV' },
  { id: '21:9', label: '21:9', ratio: 21 / 9, hint: 'Ultrawide · cinematic' },
  { id: 'custom', label: 'Custom', ratio: 'custom', hint: 'Any width / height' },
];

export interface ResolutionPreset {
  id: string;
  label: string;
  /** Length of the LONG side in pixels. Short side is derived from the ratio. */
  longSide: number;
  group: 'hd' | 'uhd' | 'extreme';
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: '720p', label: 'HD · 720p', longSide: 1280, group: 'hd' },
  { id: '1080p', label: 'Full HD · 1080p', longSide: 1920, group: 'hd' },
  { id: '1440p', label: 'QHD · 1440p', longSide: 2560, group: 'hd' },
  { id: '4k', label: 'UHD · 4K (3840 × 2160)', longSide: 3840, group: 'uhd' },
  { id: '5k', label: '5K (5120 × 2880)', longSide: 5120, group: 'uhd' },
  { id: '6k', label: '6K (6144 × 3456)', longSide: 6144, group: 'uhd' },
  { id: '8k-dci', label: '8K DCI (8192 × 4320)', longSide: 8192, group: 'uhd' },
  { id: '8k-uhd', label: '8K UHD (7680 × 4320)', longSide: 7680, group: 'uhd' },
  { id: '12k', label: '12K UHD (11520 × 6480)', longSide: 11520, group: 'extreme' },
  { id: '16k', label: '16K UHD (15360 × 8640)', longSide: 15360, group: 'extreme' },
];

/** The 16K target required by the product spec. */
export const K16 = { width: 15360, height: 8640 } as const;

export const FPS_PRESETS = [24, 25, 30, 48, 50, 60] as const;

export const MIN_DIMENSION = 16;
export const MAX_DIMENSION = 16384;
export const MIN_FPS = 1;
export const MAX_FPS = 120;
export const MAX_FRAMES = 100000;

/** Round to an even number — required by 4:2:0 chroma subsampling. */
export function toEven(v: number): number {
  const r = Math.round(v);
  return r % 2 === 0 ? r : r + 1;
}

/**
 * Derive width/height for a ratio at a given long-side resolution.
 * Portrait ratios are derived from the height (long side), landscape from the
 * width, so a "9:16 @ 1080p" is 1080 × 1920.
 */
export function dimensionsFor(ratio: number, longSide: number): { width: number; height: number } {
  const long = Math.max(MIN_DIMENSION, Math.round(longSide));
  if (ratio >= 1) {
    return { width: toEven(long), height: clampEven(long / ratio) };
  }
  return { width: clampEven(long * ratio), height: toEven(long) };
}

function clampEven(v: number): number {
  return Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, toEven(v)));
}

export function aspectRatioOf(width: number, height: number): number {
  return height > 0 ? width / height : 1;
}

/** Find the closest named aspect preset for arbitrary dimensions. */
export function matchAspectPreset(width: number, height: number): string {
  const ar = aspectRatioOf(width, height);
  for (const p of ASPECT_PRESETS) {
    if (p.ratio === 'custom') continue;
    if (Math.abs(p.ratio - ar) < 0.005) return p.id;
  }
  return 'custom';
}

/** Closest resolution preset (by long side) for given dimensions. */
export function matchResolutionPreset(width: number, height: number): string | null {
  const long = Math.max(width, height);
  let best: ResolutionPreset | null = null;
  let bestDelta = Infinity;
  for (const p of RESOLUTION_PRESETS) {
    const d = Math.abs(p.longSide - long);
    if (d < bestDelta) {
      bestDelta = d;
      best = p;
    }
  }
  return best && bestDelta <= 2 ? best.id : null;
}

export interface Issue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  fix?: string;
}

export function validateComposition(c: Composition): Issue[] {
  const issues: Issue[] = [];
  const err = (code: string, message: string, fix?: string) =>
    issues.push({ code, message, severity: 'error', fix });
  const warn = (code: string, message: string, fix?: string) =>
    issues.push({ code, message, severity: 'warning', fix });

  if (!Number.isInteger(c.width) || !Number.isInteger(c.height)) {
    err('dim-int', 'Width and height must be whole numbers.');
  }
  if (c.width < MIN_DIMENSION || c.height < MIN_DIMENSION) {
    err('dim-min', `Dimensions must be at least ${MIN_DIMENSION}px.`);
  }
  if (c.width > MAX_DIMENSION || c.height > MAX_DIMENSION) {
    err('dim-max', `Dimensions may not exceed ${MAX_DIMENSION}px.`);
  }
  if (c.width % 2 !== 0 || c.height % 2 !== 0) {
    warn('dim-odd', 'Odd dimensions are incompatible with H.264 4:2:0 encoding.', 'Round to even');
  }
  if (c.fps < MIN_FPS || c.fps > MAX_FPS) {
    err('fps-range', `Frame rate must be between ${MIN_FPS} and ${MAX_FPS}.`);
  }
  if (!Number.isFinite(c.durationFrames) || c.durationFrames < 1) {
    err('dur-min', 'Duration must be at least 1 frame.');
  }
  if (c.durationFrames > MAX_FRAMES) {
    err('dur-max', `Duration may not exceed ${MAX_FRAMES} frames.`);
  }
  if (c.startFrame < 0) err('range-start', 'Start frame may not be negative.');
  if (c.endFrame > c.durationFrames) {
    err('range-end', 'End frame may not exceed the composition duration.');
  }
  if (c.endFrame <= c.startFrame) {
    err('range-empty', 'The work area must contain at least one frame.');
  }
  if (c.pixelAspectRatio <= 0 || !Number.isFinite(c.pixelAspectRatio)) {
    err('par', 'Pixel aspect ratio must be greater than 0.');
  }
  return issues;
}

export function frameCountOf(c: Composition): number {
  return Math.max(0, Math.min(c.endFrame, c.durationFrames) - c.startFrame);
}

/** Even-sized copy of a composition (safe for 4:2:0 encoders). */
export function withEvenDimensions(c: Composition): Composition {
  return { ...c, width: toEven(c.width), height: toEven(c.height) };
}
