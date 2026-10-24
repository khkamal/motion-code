// @vitest-environment node
import{describe,it,expect}from'vitest';import{verifyMp4Signature}from'../src/rendering/verify';
describe('MP4 container verification',()=>{it('recognizes an ISO BMFF ftyp box',async()=>{const bytes=new Uint8Array([0,0,0,24,102,116,121,112,105,115,111,109,0,0,0,0]);expect(await verifyMp4Signature(new Blob([bytes]))).toBe(true)});it('rejects renamed WebM or empty data',async()=>{expect(await verifyMp4Signature(new Blob([new Uint8Array([26,69,223,163])]))).toBe(false);expect(await verifyMp4Signature(new Blob())).toBe(false)})});
