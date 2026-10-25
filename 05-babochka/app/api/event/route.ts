import {allowed,reply,event} from '../common';
export async function POST(r:Request){if(!allowed(r))return reply({},403);let data:any;try{data=await r.json()}catch{return reply({},400)}if(['opened','butterfly_touch','blessing_revealed','save','regift','brand_click','technical_error'].includes(data.name))await event(data.name);return reply({ok:true})}
