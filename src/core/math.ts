import type { EasingName, EasingSpec } from './types';

export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

export const clamp01 = (v: number): number => clamp(v, 0, 1);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const invLerp = (a: number, b: number, v: number): number =>
  a === b ? 0 : (v - a) / (b - a);

export const remap = (v: number, a: number, b: number, c: number, d: number): number =>
  lerp(c, d, clamp01(invLerp(a, b, v)));

export const round = (v: number, digits = 0): number => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const toDeg = (rad: number): number => (rad * 180) / Math.PI;
export const toRad = (deg: number): number => deg * DEG;

/** Deterministic 32-bit hash -> unit float. Same input always gives same output. */
export function hash01(...parts: (number | string)[]): number {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return ((h >>> 0) % 0x1000000) / 0x1000000;
}

/** mulberry32 — small, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value noise (1D/2D) built on a deterministic hash — no state, frame-safe. */
export function noise2D(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash01(xi, yi, seed);
  const b = hash01(xi + 1, yi, seed);
  const c = hash01(xi, yi + 1, seed);
  const d = hash01(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

/** Fractal brownian motion over noise2D. */
export function fbm(x: number, y: number, octaves = 4, seed = 0): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2D(x * freq, y * freq, seed + i);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return norm === 0 ? 0 : sum / norm;
}

const back = (s = 1.70158) => {
  const c = s + 1;
  return {
    in: (t: number) => c * t * t * t - s * t * t,
    out: (t: number) => 1 + c * (t - 1) ** 3 + s * (t - 1) ** 2,
    inOut: (t: number) =>
      t < 0.5
        ? ((2 * t) ** 2 * ((s * 2 + 1) * 2 * t - s * 2)) / 2
        : ((2 * t - 2) ** 2 * ((s * 2 + 1) * (t * 2 - 2) + s * 2) + 2) / 2,
  };
};

const b = back();

export const EASINGS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) ** 2,
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  easeInCubic: (t) => t ** 3,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  easeInQuart: (t) => t ** 4,
  easeOutQuart: (t) => 1 - (1 - t) ** 4,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
  easeInExpo: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  easeInOutExpo: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2,
  easeInBack: b.in,
  easeOutBack: b.out,
  easeInOutBack: b.inOut,
  easeInElastic: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
  easeOutElastic: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export const EASING_NAMES = Object.keys(EASINGS) as EasingName[];

export function resolveEasing(spec: EasingSpec | undefined): (t: number) => number {
  if (!spec) return EASINGS.linear;
  if (typeof spec === 'string') return EASINGS[spec] ?? EASINGS.linear;
  return cubicBezier(...spec.bezier);
}

/** Newton-Raphson cubic-bezier solver (CSS `cubic-bezier` semantics). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 20; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (v > x) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleY(solveX(t));
  };
}

/* ------------------------------- colour ---------------------------------- */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_RE = /^#?([0-9a-f]{3,8})$/i;

export function parseColor(input: string): RGBA {
  const s = String(input ?? '').trim();
  if (s === 'transparent' || s === 'none' || s === '') return { r: 0, g: 0, b: 0, a: 0 };

  const hex = HEX_RE.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length === 6) h += 'ff';
    const n = parseInt(h, 16);
    return {
      r: (n >>> 24) & 255,
      g: (n >>> 16) & 255,
      b: (n >>> 8) & 255,
      a: ((n & 255) / 255),
    };
  }

  const fn = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (fn) {
    const parts = fn[1].split(/[,/\s]+/).filter(Boolean).map((p) => parseFloat(p));
    return {
      r: parts[0] ?? 0,
      g: parts[1] ?? 0,
      b: parts[2] ?? 0,
      a: parts.length > 3 ? parts[3] : 1,
    };
  }

  const hsla = /^hsla?\(([^)]+)\)$/i.exec(s);
  if (hsla) {
    const parts = hsla[1].split(/[,/\s]+/).filter(Boolean).map((p) => parseFloat(p));
    return hslToRgb(parts[0] ?? 0, (parts[1] ?? 0) / 100, (parts[2] ?? 0) / 100, parts.length > 3 ? parts[3] : 1);
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

export function hslToRgb(h: number, s: number, l: number, a = 1): RGBA {
  const hh = ((h % 360) + 360) % 360 / 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
}

export function toCss(c: RGBA): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${round(c.a, 3)})`;
}

export function mixColor(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  return toCss({
    r: lerp(ca.r, cb.r, t),
    g: lerp(ca.g, cb.g, t),
    b: lerp(ca.b, cb.b, t),
    a: lerp(ca.a, cb.a, t),
  });
}

export function withAlpha(color: string, alpha: number): string {
  const c = parseColor(color);
  return toCss({ ...c, a: clamp01(alpha) });
}

/** Relative luminance (WCAG) — used to pick readable foreground colours. */
export function luminance(color: string): number {
  const { r, g, b } = parseColor(color);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function isDark(color: string): boolean {
  return luminance(color) < 0.35;
}
