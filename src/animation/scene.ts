import type { SceneNode } from '../core/types';
import { valueAt } from './keyframes';
import { DEG } from '../core/math';
import { uid } from '../core/ids';
import type { GeometryWarning } from './safeCanvas';

const finite = (value: number, fallback = 0): number => Number.isFinite(value) ? value : fallback;
function num(node: SceneNode, prop: keyof SceneNode, frame: number, fallback = 0): number {
  const base = node[prop];
  return finite(Number(valueAt(node.keyframes[String(prop)] || [], frame, typeof base === 'number' ? base : fallback)), fallback);
}
function color(node: SceneNode, prop: keyof SceneNode, frame: number): string {
  const base = node[prop];
  return String(valueAt(node.keyframes[String(prop)] || [], frame, typeof base === 'string' ? base : '#000000'));
}
function size(value: number, label: string, warn?: GeometryWarning): number {
  if (!Number.isFinite(value)) { warn?.(`${label} was not finite and was replaced with 0.`); return 0; }
  if (value < 0) { warn?.(`${label} was negative; its magnitude was used. Use scale to flip objects.`); return Math.abs(value); }
  return value;
}

export function renderScene(ctx: CanvasRenderingContext2D, nodes: SceneNode[], frame: number, warn?: GeometryWarning): void {
  for (const node of nodes) {
    if (!node.visible || frame < finite(node.startFrame) || frame >= finite(node.endFrame, frame + 1)) continue;
    ctx.save();
    const x = num(node, 'x', frame);
    const y = num(node, 'y', frame);
    const width = size(num(node, 'width', frame), `${node.name} width`, warn);
    const height = size(num(node, 'height', frame), `${node.name} height`, warn);
    const opacity = Math.max(0, Math.min(1, num(node, 'opacity', frame, 1)));
    const scaleX = num(node, 'scaleX', frame, 1);
    const scaleY = num(node, 'scaleY', frame, 1);
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(num(node, 'rotation', frame) * DEG);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-width * finite(node.originX, .5), -height * finite(node.originY, .5));
    ctx.fillStyle = color(node, 'fill', frame);
    ctx.strokeStyle = color(node, 'stroke', frame);
    ctx.lineWidth = size(num(node, 'strokeWidth', frame), `${node.name} stroke width`, warn);

    if (node.type === 'rect') {
      const corner = Math.min(size(num(node, 'cornerRadius', frame), `${node.name} corner radius`, warn), width / 2, height / 2);
      if (width > 0 && height > 0) { ctx.beginPath(); ctx.roundRect(0, 0, width, height, corner); ctx.fill(); if (ctx.lineWidth > 0) ctx.stroke(); }
    } else if (node.type === 'ellipse') {
      const rx = width / 2, ry = height / 2;
      if (rx > 0 && ry > 0) { ctx.beginPath(); ctx.ellipse(rx, ry, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); if (ctx.lineWidth > 0) ctx.stroke(); }
    } else if (node.type === 'text') {
      const fontSize = size(num(node, 'fontSize', frame, 48), `${node.name} font size`, warn);
      if (width > 0 && fontSize > 0) { ctx.font = `${Math.max(1, finite(node.fontWeight ?? 700, 700))} ${fontSize}px ${node.fontFamily || 'system-ui'}`; ctx.textAlign = node.align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(node.text || 'Text', width / 2, height / 2, width); if (ctx.lineWidth > 0) ctx.strokeText(node.text || 'Text', width / 2, height / 2, width); }
    } else if (node.type === 'star') {
      const points = Math.max(3, Math.min(100, Math.round(finite(node.points ?? 5, 5))));
      const outer = Math.min(width, height) / 2;
      const inner = outer * Math.max(0, Math.min(1, finite(node.innerRadius ?? .45, .45)));
      if (outer > 0) { ctx.beginPath(); for (let i = 0; i < points * 2; i++) { const angle = -Math.PI / 2 + i * Math.PI / points; const radius = i % 2 ? inner : outer; const px = width / 2 + Math.cos(angle) * radius, py = height / 2 + Math.sin(angle) * radius; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); if (ctx.lineWidth > 0) ctx.stroke(); }
    }
    renderScene(ctx, node.children, frame, warn);
    ctx.restore();
  }
}

export function createSceneNode(type: 'rect' | 'ellipse' | 'text' | 'star', width: number, height: number, endFrame: number): SceneNode {
  return { id: uid('node'), type, name: type === 'text' ? 'Text' : type[0].toUpperCase() + type.slice(1), visible: true, locked: false, x: finite(width) / 2, y: finite(height) / 2, width: type === 'text' ? 500 : 240, height: type === 'text' ? 100 : 240, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, originX: .5, originY: .5, startFrame: 0, endFrame: Math.max(1, finite(endFrame, 1)), fill: type === 'text' ? '#ffffff' : '#7c5cff', stroke: '#ffffff', strokeWidth: 0, cornerRadius: type === 'rect' ? 24 : 0, gradient: null, blendMode: 'normal', effects: [], keyframes: {}, children: [], text: type === 'text' ? 'EDITABLE TEXT' : undefined, fontFamily: 'system-ui', fontSize: 64, fontWeight: 700, align: 'center', points: type === 'star' ? 5 : undefined, innerRadius: type === 'star' ? .45 : undefined };
}
