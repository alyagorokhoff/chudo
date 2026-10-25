import {env} from 'cloudflare:workers';
export const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
export const key=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
export const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export const reply=(x:unknown,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
export const allowed=(r:Request)=>{const o=r.headers.get('origin');return !o||o===new URL(r.url).origin||o==='http://terminal.local:4173'};
export async function event(name:string){await db().prepare('INSERT INTO events(event,created) VALUES(?,?)').bind(name,new Date().toISOString()).run()}
export function pick(n:number){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
export async function createGift(){const token=key();await db().prepare('INSERT INTO gifts(token,task,butterfly,created) VALUES(?,?,?,?)').bind(token,pick(8),pick(5),new Date().toISOString()).run();await event('created');return token}
export const admin=(r:Request)=>{const k=(env as any).ADMIN_KEY;return !!k && r.headers.get('authorization')===`Bearer ${k}`};
