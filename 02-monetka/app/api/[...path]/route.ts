import { env } from 'cloudflare:workers';
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
export async function POST(req:Request){
 const db=env.DB!;const u=new URL(req.url);if(req.headers.get('origin')!==u.origin)return Response.json({error:'origin'},{status:403});
 const action=u.pathname.split('/').pop();const b:any=await req.json().catch(()=>({}));const now=Date.now();const event=async(kind:string)=>db.prepare('INSERT INTO events(kind,at) VALUES(?,?)').bind(kind,now).run();
 const out=(v:any,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 try{
 if(action==='create'){
 const key=await hash((req.headers.get('cf-connecting-ip')||'local')+Math.floor(now/3600000));
 const r:any=await db.prepare('INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key).first();if(r.count>60)return out({error:'Слишком много подарков. Попробуй немного позже.'},429);
 const t=token();await db.prepare('INSERT INTO gifts(token,created) VALUES(?,?)').bind(t,now).run();await event(b.forward?'forward':'created');return out({url:u.origin+'/chudo/'+t});}
 if(!/^[a-f0-9]{48}$/.test(b.token||''))return out({error:'missing'},404);
 if(action==='coin'){const c=await db.prepare('SELECT active FROM coins WHERE token=?').bind(b.token).first();if(!c?.active)return out({error:'missing'},404);await event('return');return out({ok:true});}
 if(action==='status'){const g:any=await db.prepare('SELECT status,proof FROM gifts WHERE token=?').bind(b.token).first();if(!g)return out({error:'missing'},404);await event('visit');return out({state:g.status==='created'?'created':b.proof&&g.proof===await hash(b.proof)?'session':'claimed'});}
 const proof=/^[a-f0-9]{48}$/.test(b.proof||'')?await hash(b.proof):'';
 if(action==='claim'&&!proof)return out({error:'forbidden'},403);
 if(action==='claim'){const g:any=await db.prepare("UPDATE gifts SET status='claimed',claimed=?,proof=? WHERE token=? AND status='created' RETURNING token").bind(now,proof,b.token).first();if(!g){const old:any=await db.prepare('SELECT proof FROM gifts WHERE token=?').bind(b.token).first();if(!proof||old?.proof!==proof)return out({error:'claimed'},409);}else await event('claimed');return out({ok:true});}
 const permanent=b.permanent&&await db.prepare('SELECT token FROM coins WHERE token=? AND active=1').bind(b.token).first();
 const gift:any=permanent?null:await db.prepare("SELECT proof,saved FROM gifts WHERE token=? AND status='claimed'").bind(b.token).first();if(!permanent&&(!proof||gift?.proof!==proof))return out({error:'forbidden'},403);
 if(action==='save'){if(permanent)return out({url:u.origin+'/coin/'+b.token});const t=token();await db.batch([db.prepare('UPDATE gifts SET saved=COALESCE(saved,?) WHERE token=?').bind(t,b.token),db.prepare('INSERT OR IGNORE INTO coins(token,created) SELECT saved,? FROM gifts WHERE token=?').bind(now,b.token)]);const g:any=await db.prepare('SELECT saved FROM gifts WHERE token=?').bind(b.token).first();await event('save');return out({url:u.origin+'/coin/'+g.saved});}
 if(action==='event'&&['toss','brand'].includes(b.kind)){await event(b.kind);return out({ok:true});}
 return out({error:'missing'},404);
 }catch{return out({error:'network'},503)}
}
