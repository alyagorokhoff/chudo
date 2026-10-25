import {allowed,reply,db,digest,event} from '../common';
export async function POST(r:Request){
 if(!allowed(r))return reply({},403);
 let data:any;try{data=await r.json()}catch{return reply({state:'invalid'},400)}
 const {token,receipt,open}=data;
 if(!/^[a-f0-9]{64}$/.test(token||'')||!/^[a-f0-9]{64}$/.test(receipt||''))return reply({state:'invalid'},404);
 const hash=await digest(receipt);
 if(open){const changed=await db().prepare("UPDATE gifts SET status='claimed',receipt=?,claimed=? WHERE token=? AND status='created' RETURNING task,butterfly").bind(hash,new Date().toISOString(),token).first();if(changed)await event('claimed');}
 const row=await db().prepare('SELECT status,task,butterfly,receipt FROM gifts WHERE token=?').bind(token).first<any>();
 if(!row){await event('invalid_link');return reply({state:'invalid'},404)}
 if(row.status==='created')return reply({state:'created'});
 if(row.receipt!==hash){await event('already_claimed');return reply({state:'used'},409)}
 return reply({state:'owned',task:row.task,butterfly:row.butterfly});
}
