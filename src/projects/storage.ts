import type { Project } from '../core/types';

const DB = 'motion-studio'; const STORE = 'projects';
function openDb(): Promise<IDBDatabase> { return new Promise((resolve,reject)=>{ const r=indexedDB.open(DB,1); r.onupgradeneeded=()=>{ if(!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE,{keyPath:'id'}); }; r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); }); }
export async function saveProject(project: Project): Promise<void> { const db=await openDb(); await new Promise<void>((resolve,reject)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put({...project,updatedAt:Date.now()}); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); }); db.close(); }
export async function listProjects(): Promise<Project[]> { const db=await openDb(); const items=await new Promise<Project[]>((resolve,reject)=>{ const r=db.transaction(STORE).objectStore(STORE).getAll(); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); }); db.close(); return items.sort((a,b)=>b.updatedAt-a.updatedAt); }
export async function deleteProject(id:string):Promise<void>{ const db=await openDb(); await new Promise<void>((resolve,reject)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); }); db.close(); }
