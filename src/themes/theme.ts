export type ThemeName='dark'|'light'|'midnight'; export type Density='compact'|'comfortable';
export interface Preferences{theme:ThemeName;accent:string;density:Density;reducedMotion:boolean}
const KEY='motion-studio-preferences'; export const defaults:Preferences={theme:'dark',accent:'#7c5cff',density:'comfortable',reducedMotion:false};
export function loadPreferences():Preferences{try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaults}}
export function applyPreferences(p:Preferences){document.documentElement.dataset.theme=p.theme;document.documentElement.dataset.density=p.density;document.documentElement.style.setProperty('--accent',p.accent);document.documentElement.classList.toggle('reduced-motion',p.reducedMotion);localStorage.setItem(KEY,JSON.stringify(p));}
