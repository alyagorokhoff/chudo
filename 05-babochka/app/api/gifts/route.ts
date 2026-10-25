import {env} from 'cloudflare:workers';
import {allowed,reply,createGift,db,digest} from '../common';
export async function POST(r:Request){
 if(!allowed(r))return reply({},403);
 const bucket=await digest(((env as any).ADMIN_KEY||'preview')+':'+(r.headers.get('cf-connecting-ip')||'preview')+':'+Math.floor(Date.now()/3600000));
 const expires=new Date(Date.now()+7200000).toISOString();
 const row=await db().prepare('INSERT INTO budgets(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,expires).first<any>();
 if(row.count>60)return reply({error:'Слишком много подарков за короткое время. Попробуй чуть позже.'},429);
 await db().prepare('DELETE FROM budgets WHERE expires < ?').bind(new Date().toISOString()).run();
 return reply({token:await createGift()});
}

export async function GET(r:Request){const t=new URL(r.url).searchParams.get('token');if(!/^[a-f0-9]{64}$/.test(t||''))return reply({state:'invalid'},404);const row=await db().prepare('SELECT status FROM gifts WHERE token=?').bind(t).first<any>();return row?reply({state:row.status}):reply({state:'invalid'},404)}
