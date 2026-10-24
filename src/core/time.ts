/** Frame <-> time helpers. All durations are expressed in frames; time is seconds. */

export const frameToTime = (frame: number, fps: number): number => (fps > 0 ? frame / fps : 0);

export const timeToFrame = (time: number, fps: number): number => (fps > 0 ? time * fps : 0);

/** Frame index (integer) for a time in seconds. */
export const frameIndexOf = (time: number, fps: number): number => Math.floor(timeToFrame(time, fps));

/** Total frames in a range where `start` is inclusive and `end` exclusive. */
export const rangeFrameCount = (start: number, end: number): number => Math.max(0, end - start);

export const durationSeconds = (frames: number, fps: number): number => frameToTime(frames, fps);

export const secondsToFrames = (seconds: number, fps: number): number =>
  Math.max(1, Math.round(seconds * fps));

/**
 * Deterministic timestamp for a frame index: the *centre* of the frame's
 * exposure window is NOT used — we use frame/fps so that frame N always maps
 * to exactly the same number regardless of playback history.
 */
export const frameTimestamp = (frame: number, fps: number): number => round6(frame / fps);

function round6(v: number): number {
  return Math.round(v * 1e6) / 1e6;
}

/** SMPTE-ish timecode HH:MM:SS:FF (non-drop). */
export function formatTimecode(frame: number, fps: number): string {
  const safeFps = Math.max(1, Math.round(fps));
  const f = Math.max(0, Math.round(frame));
  const totalSeconds = Math.floor(f / safeFps);
  const ff = f % safeFps;
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(hh)}:${p(mm)}:${p(ss)}:${p(ff)}`;
}

/** Human "1.5s / 45f" style label. */
export function formatDuration(frames: number, fps: number): string {
  const s = frameToTime(frames, fps);
  const secs = Math.abs(s - Math.round(s)) < 1e-6 ? String(Math.round(s)) : s.toFixed(2);
  return `${secs}s · ${Math.max(0, Math.round(frames))}f`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`;
}
