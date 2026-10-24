export type GeometryWarning=(message:string)=>void;
const finite=(v:number,fallback=0)=>Number.isFinite(v)?v:fallback;
const radius=(v:number,name:string,warn?:GeometryWarning)=>{if(!Number.isFinite(v)){warn?.(`${name} radius was not finite and was replaced with 0.`);return 0}if(v<0){warn?.(`${name} radius ${v} was negative; its magnitude was used.`);return Math.abs(v)}return v};
/**
 * Canvas facade for executable frame scripts. Native Canvas throws for negative
 * radii and may propagate NaN through transforms. The facade normalizes radius
 * magnitude and finite numeric inputs before native drawing, while reporting
 * each correction instead of silently swallowing it.
 */
export function createSafeCanvasContext(ctx:CanvasRenderingContext2D,warn?:GeometryWarning):CanvasRenderingContext2D{
 const methods:Record<string,(...a:number[])=>unknown>={
  arc:(x,y,r,start,end,ccw=0)=>ctx.arc(finite(x),finite(y),radius(r,'arc',warn),finite(start),finite(end),Boolean(ccw)),
  ellipse:(x,y,rx,ry,rotation,start,end,ccw=0)=>ctx.ellipse(finite(x),finite(y),radius(rx,'ellipse x',warn),radius(ry,'ellipse y',warn),finite(rotation),finite(start),finite(end),Boolean(ccw)),
  arcTo:(x1,y1,x2,y2,r)=>ctx.arcTo(finite(x1),finite(y1),finite(x2),finite(y2),radius(r,'arcTo',warn)),
  translate:(x,y)=>ctx.translate(finite(x),finite(y)),
  rotate:(angle)=>ctx.rotate(finite(angle)),
  scale:(x,y)=>ctx.scale(finite(x,1),finite(y,1)),
  transform:(a,b,c,d,e,f)=>ctx.transform(finite(a,1),finite(b),finite(c),finite(d,1),finite(e),finite(f)),
  setTransform:(a,b,c,d,e,f)=>ctx.setTransform(finite(a,1),finite(b),finite(c),finite(d,1),finite(e),finite(f)),
  moveTo:(x,y)=>ctx.moveTo(finite(x),finite(y)),lineTo:(x,y)=>ctx.lineTo(finite(x),finite(y)),
  fillRect:(x,y,w,h)=>ctx.fillRect(finite(x),finite(y),finite(w),finite(h)),strokeRect:(x,y,w,h)=>ctx.strokeRect(finite(x),finite(y),finite(w),finite(h)),clearRect:(x,y,w,h)=>ctx.clearRect(finite(x),finite(y),finite(w),finite(h)),
 };
 return new Proxy(ctx,{get(target,prop){if(typeof prop==='string'&&methods[prop])return methods[prop];const value=Reflect.get(target,prop,target);return typeof value==='function'?value.bind(target):value},set(target,prop,value){if(prop==='globalAlpha'){const n=Number(value);Reflect.set(target,prop,Number.isFinite(n)?Math.max(0,Math.min(1,n)):1,target);return true}if(prop==='lineWidth'||prop==='shadowBlur'||prop==='miterLimit'){Reflect.set(target,prop,radius(Number(value),String(prop),warn),target);return true}return Reflect.set(target,prop,value,target)}}) as CanvasRenderingContext2D;
}
