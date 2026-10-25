import Experience from '../../ui';export default async function Page({params}:any){const {token}=await params;return <Experience mode="coin" token={token}/>}
