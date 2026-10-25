import Miracle from '../../../components/Miracle';
import {cookies} from 'next/headers';
import {database,hash} from '../../../lib/gifts';
import {receiptCookie,type GiftView} from '../../../lib/gift-view';
import {predictions} from '../../../lib/predictions';
export const dynamic='force-dynamic';
export default async function Page({params}:any){
 const {token}=await params;
 const row=await database().prepare('SELECT status,prediction,receipt FROM gifts WHERE token=?').bind(token).first<{status:string;prediction:number;receipt:string}>();
 let initial:GiftView={status:'missing'};
 if(row?.status==='new')initial={status:'new'};
 else if(row){const receipt=(await cookies()).get(receiptCookie(token))?.value;initial=receipt&&/^[a-f0-9]{64}$/.test(receipt)&&await hash(receipt)===row.receipt?{status:'owned',prediction:predictions[row.prediction]}:{status:'claimed'}}
 return <Miracle key={token} token={token} initial={initial}/>;
}
