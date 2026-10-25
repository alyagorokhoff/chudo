import {database,randomToken,json,sameOrigin} from '@/lib/gifts';
export async function POST(r:Request){if(!sameOrigin(r))return json({error:'Forbidden'},403);const token=randomToken();await database().prepare('INSERT INTO gifts (token, created_at) VALUES (?, ?)').bind(token,Date.now()).run();return json({token,url:new URL('/g/'+token,r.url).href},201)}
