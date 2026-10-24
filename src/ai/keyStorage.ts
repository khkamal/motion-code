export type GeminiKeyStatus='ready'|'testing'|'rate-limited'|'quota-exhausted'|'invalid'|'permission-denied'|'error';
export interface GeminiApiKey{id:string;label:string;key:string;enabled:boolean;status:GeminiKeyStatus;cooldownUntil?:number;lastError?:string;lastUsedAt?:number;deniedModels?:string[]}
const LEGACY_KEY='motion-studio-gemini-api-key',KEYS_KEY='motion-studio-gemini-api-keys-v2';
const id=()=>`key_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
export function maskGeminiKey(key:string):string{const value=key.trim();return value.length<8?'••••••••':`${value.slice(0,4)}••••${value.slice(-4)}`}
export function loadGeminiKeys(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>=localStorage):GeminiApiKey[]{try{const parsed=JSON.parse(storage.getItem(KEYS_KEY)||'[]') as GeminiApiKey[];if(Array.isArray(parsed)&&parsed.length)return parsed.filter(k=>k&&typeof k.key==='string').map(k=>({...k,enabled:k.enabled!==false,status:k.status||'ready'}));const legacy=storage.getItem(LEGACY_KEY);if(legacy){const migrated=[createGeminiKey(legacy,'Migrated key')];storage.setItem(KEYS_KEY,JSON.stringify(migrated));storage.removeItem(LEGACY_KEY);return migrated}}catch{/* inaccessible or malformed local storage */}return[]}
export function saveGeminiKeys(keys:GeminiApiKey[],storage:Pick<Storage,'setItem'>=localStorage):void{storage.setItem(KEYS_KEY,JSON.stringify(keys))}
export function createGeminiKey(key:string,label=''):GeminiApiKey{const value=key.trim();if(!value)throw new Error('Enter an API key.');return{id:id(),label:label.trim()||`Gemini key`,key:value,enabled:true,status:'ready',deniedModels:[]}}
export function clearGeminiKeys(storage:Pick<Storage,'removeItem'>=localStorage):void{storage.removeItem(KEYS_KEY);storage.removeItem(LEGACY_KEY)}
// Legacy single-key helpers retained for existing callers/projects.
export function loadSavedGeminiKey(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>=localStorage):string{return loadGeminiKeys(storage).find(k=>k.enabled)?.key||''}
export function saveGeminiKey(key:string,storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>=localStorage):void{const keys=loadGeminiKeys(storage),next=createGeminiKey(key,keys.length?`Key ${keys.length+1}`:'Primary');saveGeminiKeys([...keys,next],storage)}
export function removeGeminiKey(storage:Pick<Storage,'removeItem'>=localStorage):void{clearGeminiKeys(storage)}
export function hasSavedGeminiKey(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>=localStorage):boolean{return loadGeminiKeys(storage).length>0}
