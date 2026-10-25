import Experience from '../../experience';
export default async function Page({params}:{params:Promise<{token:string}>}){return <Experience token={(await params).token}/>}
