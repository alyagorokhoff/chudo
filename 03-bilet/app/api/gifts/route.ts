import {allowed,reply,createGift} from '../common';
export async function POST(r:Request){if(!allowed(r))return reply({},403);return reply({token:await createGift()})}
