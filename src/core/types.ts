/**
 * Motion Studio — project schema types.
 *
 * The schema is versioned (`SCHEMA_VERSION`). `src/core/schema.ts` owns
 * validation + migration so older project files keep loading.
 */

export const SCHEMA_VERSION = 2;

export type ProjectMode = 'code' | 'scene';

export type RenderQuality = 'draft' | 'normal' | 'high';

export type ColorSpace = 'srgb' | 'display-p3';

export interface Composition {
  width: number;
  height: number;
  fps: number;
  /** Total composition length in frames (always >= 1). */
  durationFrames: number;
  /** Work area / render range, inclusive start, exclusive end. */
  startFrame: number;
  endFrame: number;
  background: string;
  transparent: boolean;
  seed: number;
  /** Pixel aspect ratio (1 = square pixels). */
  pixelAspectRatio: number;
  loop: boolean;
  colorSpace: ColorSpace;
  quality: RenderQuality;
}

export type EasingName =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeOutBounce'
  | 'easeInOutSine'
  | 'easeOutSine'
  | 'easeInSine';

export type EasingSpec = EasingName | { bezier: [number, number, number, number] };

export interface Keyframe {
  id: string;
  frame: number;
  /** Numeric value, or a color string for color-typed properties. */
  value: number | string;
  easing: EasingSpec;
  /** Hold: value stays constant until the next keyframe (step interpolation). */
  hold?: boolean;
}

export type SceneNodeType =
  | 'group'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'image'
  | 'svg'
  | 'path'
  | 'star'
  | 'polygon'
  | 'line';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'add'
  | 'difference'
  | 'lighten'
  | 'darken';

export interface GradientStop {
  offset: number;
  color: string;
}

export interface Gradient {
  type: 'linear' | 'radial';
  /** For linear: [x0,y0,x1,y1] in 0..1 object space. For radial: [cx,cy,r]. */
  coords: [number, number, number, number];
  stops: GradientStop[];
}

export type EffectKind = 'shadow' | 'blur' | 'glow' | 'noise' | 'tint' | 'motionBlur';

export interface Effect {
  id: string;
  kind: EffectKind;
  enabled: boolean;
  params: Record<string, number | string>;
}

export type FitMode = 'fit' | 'fill' | 'stretch' | 'crop';

export interface SceneNode {
  id: string;
  type: SceneNodeType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  /** Transform origin in normalized object space (0..1). */
  originX: number;
  originY: number;
  startFrame: number;
  endFrame: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  gradient: Gradient | null;
  blendMode: BlendMode;
  effects: Effect[];
  /** property -> keyframes (sorted by frame) */
  keyframes: Record<string, Keyframe[]>;
  children: SceneNode[];

  // type specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  /** assetId for image/svg nodes */
  assetId?: string;
  fit?: FitMode;
  /** path data for `path` nodes (SVG path mini-language subset) */
  d?: string;
  points?: number;
  innerRadius?: number;
  /** 0..1 draw-on progress for strokes */
  trimStart?: number;
  trimEnd?: number;
}

export interface AssetMeta {
  id: string;
  name: string;
  type: 'image' | 'svg' | 'font';
  mime: string;
  size: number;
  width: number;
  height: number;
  /** SHA-256 (hex) of the file bytes, used for duplicate detection. */
  hash: string;
  addedAt: number;
}

export interface CodeVersion {
  id: string;
  label: string;
  code: string;
  createdAt: number;
  source: 'user' | 'ai' | 'preset' | 'import';
}

export interface Project {
  id: string;
  schemaVersion: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  mode: ProjectMode;
  composition: Composition;
  code: string;
  scene: SceneNode[];
  assets: AssetMeta[];
  versions: CodeVersion[];
  notes: string;
  aiGeneration?: { prompt:string; compositionSignature:string; generatedAt:number };
}

export const DEFAULT_COMPOSITION: Composition = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationFrames: 150,
  startFrame: 0,
  endFrame: 150,
  background: '#0b0d12',
  transparent: false,
  seed: 1337,
  pixelAspectRatio: 1,
  loop: true,
  colorSpace: 'srgb',
  quality: 'normal',
};

export const ANIMATABLE_NUMERIC: ReadonlyArray<keyof SceneNode> = [
  'x',
  'y',
  'width',
  'height',
  'rotation',
  'scaleX',
  'scaleY',
  'opacity',
  'cornerRadius',
  'strokeWidth',
  'fontSize',
  'letterSpacing',
  'trimStart',
  'trimEnd',
  'points',
  'innerRadius',
];

export const ANIMATABLE_COLOR: ReadonlyArray<keyof SceneNode> = ['fill', 'stroke'];

export function isAnimatable(prop: string): boolean {
  return (ANIMATABLE_NUMERIC as ReadonlyArray<string>).includes(prop) ||
    (ANIMATABLE_COLOR as ReadonlyArray<string>).includes(prop);
}
