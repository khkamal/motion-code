/** Minimal standards-compliant ZIP writer (STORE method, no compression).
 * PNG data is already compressed, so DEFLATE would add CPU without meaningful savings.
 */
export interface ZipEntry { name: string; data: Uint8Array }
const encoder = new TextEncoder();
let table: Uint32Array | undefined;
function crcTable(): Uint32Array { if(table)return table; table=new Uint32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}return table }
export function crc32(bytes: Uint8Array): number { let c=0xffffffff;const t=crcTable();for(const b of bytes)c=t[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0 }
function u16(v:number){const a=new Uint8Array(2);new DataView(a.buffer).setUint16(0,v,true);return a}
function u32(v:number){const a=new Uint8Array(4);new DataView(a.buffer).setUint32(0,v>>>0,true);return a}
function concat(parts:Uint8Array[]):Uint8Array{const n=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(n);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}
export function createZip(entries: ZipEntry[]): Blob {
 const locals:Uint8Array[]=[],centrals:Uint8Array[]=[];let offset=0;
 for(const entry of entries){const name=encoder.encode(entry.name);if(name.length>65535)throw new Error('ZIP entry name is too long.');const crc=crc32(entry.data);const local=concat([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(entry.data.length),u32(entry.data.length),u16(name.length),u16(0),name,entry.data]);locals.push(local);centrals.push(concat([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(entry.data.length),u32(entry.data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));offset+=local.length}
 const centralSize=centrals.reduce((s,p)=>s+p.length,0);const end=concat([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralSize),u32(offset),u16(0)]);return new Blob([...locals,...centrals,end].map(p=>p.slice().buffer as ArrayBuffer),{type:'application/zip'})
}
export async function verifyZip(blob:Blob,expectedEntries:number):Promise<boolean>{if(blob.size<22)return false;const bytes=new Uint8Array(await blob.slice(Math.max(0,blob.size-65557)).arrayBuffer());for(let i=bytes.length-22;i>=0;i--){if(bytes[i]===0x50&&bytes[i+1]===0x4b&&bytes[i+2]===0x05&&bytes[i+3]===0x06){const view=new DataView(bytes.buffer,bytes.byteOffset+i);return view.getUint16(8,true)===expectedEntries&&view.getUint16(10,true)===expectedEntries}}return false}
