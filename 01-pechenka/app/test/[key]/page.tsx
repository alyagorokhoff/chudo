import Miracle from '../../../components/Miracle';
import {testKey} from '../../../lib/test-access';
import {notFound} from 'next/navigation';
export default async function Page({params}:any){if((await params).key!==testKey)notFound();return <Miracle test/>}
