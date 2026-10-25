export type GiftView={status:'new'|'owned'|'claimed'|'missing';prediction?:string};
export const receiptCookie=(token:string)=>'miracle_'+token;
