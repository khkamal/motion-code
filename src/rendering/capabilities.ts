export interface StudioCapabilities {
  webCodecs: boolean;
  mediaRecorder: boolean;
  offscreenCanvas: boolean;
  workers: boolean;
  indexedDB: boolean;
  fileSystemAccess: boolean;
  canvasMaxDimension: number;
  supportedRecorderTypes: string[];
}

const RECORDER_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4;codecs=avc1.42E01E',
  'video/mp4',
];

export function detectCapabilities(scope: typeof globalThis = globalThis): StudioCapabilities {
  const mr = (scope as typeof globalThis & { MediaRecorder?: typeof MediaRecorder }).MediaRecorder;
  return {
    webCodecs: 'VideoEncoder' in scope && 'VideoFrame' in scope,
    mediaRecorder: Boolean(mr),
    offscreenCanvas: 'OffscreenCanvas' in scope,
    workers: 'Worker' in scope,
    indexedDB: 'indexedDB' in scope,
    fileSystemAccess: 'showSaveFilePicker' in scope,
    canvasMaxDimension: 16384,
    supportedRecorderTypes: mr
      ? RECORDER_TYPES.filter((type) => typeof mr.isTypeSupported !== 'function' || mr.isTypeSupported(type))
      : [],
  };
}

export function preferredVideoMime(c: StudioCapabilities): string | null {
  return c.supportedRecorderTypes[0] ?? null;
}

export function extensionForMime(mime: string): string {
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('json')) return 'json';
  return 'bin';
}
