import type { Keyframe } from '../core/types';
import { clamp01, lerp, mixColor, resolveEasing } from '../core/math';

export function valueAt(keyframes: Keyframe[], frame: number, fallback: number | string): number | string {
  if (!keyframes.length) return fallback;
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  if (frame <= sorted[0].frame) return sorted[0].value;
  if (frame >= sorted[sorted.length - 1].frame) return sorted[sorted.length - 1].value;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      if (a.hold) return a.value;
      const t = resolveEasing(a.easing)(clamp01((frame - a.frame) / Math.max(1, b.frame - a.frame)));
      if (typeof a.value === 'number' && typeof b.value === 'number') return lerp(a.value, b.value, t);
      return mixColor(String(a.value), String(b.value), t);
    }
  }
  return fallback;
}
