import type { Composition } from '../core/types';

export const DEFAULT_CODE = `// Motion Studio frame script\n// Use ctx, width, height, time, frame, fps and api. No DOM or network access.\nconst t = (time % 5) / 5;\nconst ease = api.easeInOutCubic(t < .5 ? t * 2 : (1 - t) * 2);\n\nctx.fillStyle = '#090b16';\nctx.fillRect(0, 0, width, height);\n\n// orbital rings\nctx.save();\nctx.translate(width / 2, height / 2);\nctx.rotate(time * .35);\nfor (let i = 0; i < 5; i++) {\n  ctx.beginPath();\n  ctx.strokeStyle = api.alpha(i % 2 ? '#8b5cf6' : '#22d3ee', .25 + i * .12);\n  ctx.lineWidth = Math.max(2, width / 500);\n  ctx.ellipse(0, 0, width * (.08 + i * .035), height * (.14 + i * .025), i * .35, 0, Math.PI * 2);\n  ctx.stroke();\n}\nctx.restore();\n\nconst pulse = .86 + Math.sin(time * Math.PI * 2 / 2.5) * .08;\nctx.save();\nctx.translate(width / 2, height / 2);\nctx.scale(pulse, pulse);\nctx.shadowColor = '#22d3ee';\nctx.shadowBlur = width * .035;\nconst g = ctx.createLinearGradient(-width*.12, -height*.1, width*.12, height*.1);\ng.addColorStop(0, '#22d3ee');\ng.addColorStop(1, '#8b5cf6');\nctx.fillStyle = g;\nctx.beginPath();\nfor (let i = 0; i < 6; i++) {\n  const a = i * Math.PI / 3 - Math.PI / 2;\n  const r = Math.min(width, height) * .13;\n  const x = Math.cos(a) * r, y = Math.sin(a) * r;\n  i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);\n}\nctx.closePath(); ctx.fill();\nctx.restore();\n\nctx.textAlign = 'center';\nctx.textBaseline = 'middle';\nctx.fillStyle = '#f8fafc';\nctx.font = '700 ' + Math.round(Math.min(width,height)*.075) + 'px system-ui';\nctx.fillText('MOTION', width/2, height*.76);\nctx.fillStyle = '#94a3b8';\nctx.font = '500 ' + Math.round(Math.min(width,height)*.025) + 'px system-ui';\nctx.fillText('CREATE · ANIMATE · EXPORT', width/2, height*.83);`;

export interface RuntimeApi {
  clamp(v: number, min?: number, max?: number): number;
  lerp(a: number, b: number, t: number): number;
  easeInOutCubic(t: number): number;
  alpha(hex: string, alpha: number): string;
  random(index?: number): number;
}

export interface FrameInput { ctx: CanvasRenderingContext2D; composition: Composition; frame: number }

const blocked = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|importScripts|indexedDB|localStorage|sessionStorage|document|window|globalThis|navigator|location|Function|eval)\b/;

export function validateCode(code: string): string[] {
  const errors: string[] = [];
  if (code.length > 100_000) errors.push('Script exceeds the 100 KB execution limit.');
  const match = blocked.exec(code);
  if (match) errors.push(`Restricted global “${match[1]}” is not available in frame scripts.`);
  if (/\b(import|export)\s/.test(code)) errors.push('Imports and exports are not supported in frame scripts.');
  try { new Function('ctx','width','height','time','frame','fps','api', `'use strict';\n${code}`); } catch (e) { errors.push(e instanceof Error ? e.message : String(e)); }
  return errors;
}

// Dynamic compilation is isolated by design in production render workers. Preview
// uses this runner with a restricted lexical scope; imported projects require an
// explicit Run action. See docs/SECURITY.md for residual same-origin risks.
export function compileFrame(code: string): (input: FrameInput) => void {
  const errors = validateCode(code);
  if (errors.length) throw new Error(errors.join('\n'));
  const fn = new Function('ctx','width','height','time','frame','fps','api', `'use strict';\n${code}`) as (...args: unknown[]) => void;
  return ({ ctx, composition, frame }) => {
    const seed = composition.seed;
    const api: RuntimeApi = {
      clamp: (v,min=0,max=1) => Math.min(max,Math.max(min,v)),
      lerp: (a,b,t) => a+(b-a)*t,
      easeInOutCubic: (t) => t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2,
      alpha: (hex,a) => { const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; },
      random: (index=0) => { let x=Math.imul(seed+index+frame*374761393,668265263); x=(x^(x>>>13))*1274126177; return ((x^(x>>>16))>>>0)/4294967296; },
    };
    fn(ctx, composition.width, composition.height, frame / composition.fps, frame, composition.fps, Object.freeze(api));
  };
}
