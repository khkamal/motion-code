import type { Composition } from '../core/types';
import { frameCountOf } from '../core/composition';

export interface RenderEstimate {
  frames: number;
  pixelsPerFrame: number;
  totalPixels: number;
  fullFrameBytes: number;
  tileBytes: number;
  estimatedPngBytes: number;
  risk: 'low' | 'medium' | 'high' | 'extreme';
  tiled: boolean;
  warnings: string[];
}

export function estimateRender(c: Composition, tileSize = 2048, guard = 32): RenderEstimate {
  const frames = frameCountOf(c);
  const pixelsPerFrame = c.width * c.height;
  const totalPixels = pixelsPerFrame * frames;
  const fullFrameBytes = pixelsPerFrame * 4;
  const tileEdge = Math.min(tileSize + guard * 2, Math.max(c.width, c.height));
  const tileBytes = tileEdge * tileEdge * 4;
  const tiled = c.width > tileSize || c.height > tileSize;
  const warnings: string[] = [];
  let risk: RenderEstimate['risk'] = 'low';
  if (totalPixels > 2e9) risk = 'medium';
  if (totalPixels > 1e10 || fullFrameBytes > 256 * 1024 ** 2) risk = 'high';
  if (totalPixels > 5e10 || fullFrameBytes > 512 * 1024 ** 2) risk = 'extreme';
  if (tiled) warnings.push('Frames will render in bounded tiles. Blur and shadow effects use guard pixels.');
  if (c.width > 8192 || c.height > 8192) warnings.push('Video codecs commonly reject dimensions above 8K; use PNG frames unless your encoder confirms support.');
  if (fullFrameBytes > 256 * 1024 ** 2) warnings.push(`A decoded full frame needs ${formatBytes(fullFrameBytes)}; avoid full-frame assembly in memory.`);
  if (frames > 1800) warnings.push('Long render: keep this tab visible and prevent device sleep.');
  return { frames, pixelsPerFrame, totalPixels, fullFrameBytes, tileBytes, estimatedPngBytes: Math.round(totalPixels * 0.35), risk, tiled, warnings };
}

export interface Tile { x: number; y: number; width: number; height: number; guardLeft: number; guardTop: number; guardRight: number; guardBottom: number }

export function calculateTiles(width: number, height: number, tileSize = 2048, guard = 32): Tile[] {
  const out: Tile[] = [];
  for (let y = 0; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const w = Math.min(tileSize, width - x), h = Math.min(tileSize, height - y);
      out.push({ x, y, width: w, height: h, guardLeft: Math.min(guard, x), guardTop: Math.min(guard, y), guardRight: Math.min(guard, width - x - w), guardBottom: Math.min(guard, height - y - h) });
    }
  }
  return out;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 1) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}
