import type { Composition } from './types';

export interface FrameTiming {
  totalFrames: number;
  durationSeconds: number;
  frameDuration: number;
  frame: number;
  timeSeconds: number;
  /** current frame / total frames, matching the exclusive-end frame convention. */
  progress: number;
  /** Inclusive endpoint progress. Use periodic functions with this for matching loop endpoints. */
  loopProgress: number;
  isFirstFrame: boolean;
  isFinalFrame: boolean;
}

export function durationSecondsOf(composition: Pick<Composition,'durationFrames'|'fps'>): number {
  return composition.fps > 0 ? composition.durationFrames / composition.fps : 0;
}

export function totalFramesFor(durationSeconds:number,fps:number):number {
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(fps) || durationSeconds <= 0 || fps <= 0) return 0;
  return Math.max(1, Math.round(durationSeconds * fps));
}

export function timingAtFrame(composition: Pick<Composition,'durationFrames'|'fps'>, currentFrame:number): FrameTiming {
  const totalFrames=Math.max(1,Math.round(composition.durationFrames));
  const fps=Math.max(1,composition.fps);
  const frame=Math.max(0,Math.min(totalFrames-1,Math.floor(Number.isFinite(currentFrame)?currentFrame:0)));
  return {totalFrames,durationSeconds:totalFrames/fps,frameDuration:1/fps,frame,timeSeconds:frame/fps,progress:frame/totalFrames,loopProgress:totalFrames===1?0:frame/(totalFrames-1),isFirstFrame:frame===0,isFinalFrame:frame===totalFrames-1};
}

export function compositionSignature(c:Pick<Composition,'width'|'height'|'fps'|'durationFrames'|'loop'>):string {
  return `${c.width}x${c.height}@${c.fps}:${c.durationFrames}:${c.loop?'loop':'once'}`;
}
