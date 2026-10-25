import {allowed,reply,db,digest,event} from '../common';
export async function POST(r:Request){
 if(!allowed(r))return reply({},403);
 let data:any;try{data=await r.json()}catch{return reply({state:'invalid'},400)}
 const {token,receipt,open}=data;
 if(!/^[a-f0-9]{64}$/.test(token||'')||!/^[a-f0-9]{64}$/.test(receipt||''))return reply({state:'invalid'},404);
 const hash=await digest(receipt);
 if(open){const a=new Uint32Array(1);crypto.getRandomValues(a);
 const changed=await db().prepare("UPDATE gifts SET status='claimed',task=?,receipt=?,claimed=? WHERE token=? AND status='created' RETURNING task").bind(a[0]%4,hash,new Date().toISOString(),token).first();
 if(changed)await event('claim');}
 const row=await db().prepare('SELECT status,task,receipt FROM gifts WHERE token=?').bind(token).first<any>();
 if(!row){await event('invalid');return reply({state:'invalid'},404)}
 if(row.status==='created')return reply({state:'created'});
 if(row.receipt!==hash){await event('repeat');return reply({state:'used'},409)}
 return reply({state:'owned',task:row.task});
}
