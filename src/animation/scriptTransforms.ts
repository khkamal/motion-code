const MARKER_PREFIX='/* @motion-code:green-screen:';
const OLD_MARKER='/* @motion-code:green-screen */';
const END_MARKER='/* @motion-code:green-screen:end */';
const blockPattern=/\/\* @motion-code:green-screen:([^*]*) \*\/[\s\S]*?\/\* @motion-code:green-screen:end \*\//;

const block=(original:string)=>`${MARKER_PREFIX}${encodeURIComponent(original)} */\n  ctx.fillStyle = "#00ff00";\n  ctx.fillRect(0, 0, typeof W === "number" ? W : width, typeof H === "number" ? H : height);\n  ${END_MARKER}`;

export function hasGreenScreenBackground(code:string):boolean{return code.includes(MARKER_PREFIX)||code.includes(OLD_MARKER)}

/** A reversible, script-persisted chroma-key toggle. */
export function toggleGreenScreenBackground(code:string):{code:string;enabled:boolean;replaced:boolean}{
  const existing=blockPattern.exec(code);
  if(existing){let original='';try{original=decodeURIComponent(existing[1])}catch{/* malformed marker: remove safely */}return{code:code.replace(blockPattern,original),enabled:false,replaced:!!original}}
  // Compatibility with the first marker format. Its original paint was not stored.
  if(code.includes(OLD_MARKER)){const legacy=/\/\* @motion-code:green-screen \*\/[\s\S]*?ctx\.fillRect\([^;]+;?/;return{code:code.replace(legacy,''),enabled:false,replaced:false}}
  const background=/(ctx\.fillStyle\s*=\s*[^;]+;\s*ctx\.fillRect\(\s*0\s*,\s*0\s*,\s*(?:W|width)\s*,\s*(?:H|height)\s*\)\s*;?)/;
  const found=background.exec(code);
  if(found)return{code:code.replace(background,block(found[1])),enabled:true,replaced:true};
  const functionStart=/(export\s+)?function\s+renderFrame\s*\([^)]*\)\s*\{/;
  if(functionStart.test(code))return{code:code.replace(functionStart,m=>`${m}${block('')}`),enabled:true,replaced:false};
  return{code:`${block('')}${code}`,enabled:true,replaced:false};
}
