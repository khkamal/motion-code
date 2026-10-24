const KEY='motion-studio-gemini-api-key';
export function loadSavedGeminiKey(storage:Pick<Storage,'getItem'>=localStorage):string{try{return storage.getItem(KEY)||''}catch{return''}}
export function saveGeminiKey(key:string,storage:Pick<Storage,'setItem'>=localStorage):void{const value=key.trim();if(!value)throw new Error('Enter an API key before saving.');storage.setItem(KEY,value)}
export function removeGeminiKey(storage:Pick<Storage,'removeItem'>=localStorage):void{storage.removeItem(KEY)}
export function hasSavedGeminiKey(storage:Pick<Storage,'getItem'>=localStorage):boolean{return Boolean(loadSavedGeminiKey(storage))}
