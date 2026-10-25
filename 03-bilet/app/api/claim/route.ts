import {allowed,reply,db,digest,event} from '../common';
export async function POST(r:Request){
 if(!allowed(r))return reply({},403);
 const {token,receipt,open}=await r.json() as any;
 if(!/^[a-f0-9]{64}$/.test(token||'')||!/^[a-f0-9]{64}$/.test(receipt||''))return reply({state:'invalid'},404);
 const hash=await digest(receipt);
 if(open){let n:number;const a=new Uint32Array(1);do{crypto.getRandomValues(a);n=a[0]}while(n>=4294967280);
 await db().prepare("UPDATE gifts SET status='claimed',task=?,receipt=?,claimed=? WHERE token=? AND status='created'").bind(n%20,hash,new Date().toISOString(),token).run();}
 const row=await db().prepare('SELECT status,task,receipt FROM gifts WHERE token=?').bind(token).first<any>();
 if(!row){await event('invalid');return reply({state:'invalid'},404)}
 if(row.status==='created')return reply({state:'created'});
 if(row.receipt!==hash){await event('repeat');return reply({state:'used'},409)}
 if(open)await event('claim');return reply({state:'owned',task:row.task});
}
