import {allowed,reply,event} from '../common';
export async function POST(r:Request){if(!allowed(r))return reply({},403);const {name}=await r.json() as any;if(['page','tear','png_offered','share_created','brand'].includes(name))await event(name);return reply({ok:true})}
