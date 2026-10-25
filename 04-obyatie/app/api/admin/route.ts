import {admin,reply,createGift,db} from '../common';
export async function POST(r:Request){if(!admin(r))return reply({},403);return reply({token:await createGift()})}
export async function GET(r:Request){if(!admin(r))return reply({},403);return reply(await db().prepare('SELECT event,COUNT(*) AS count FROM events GROUP BY event').all())}
