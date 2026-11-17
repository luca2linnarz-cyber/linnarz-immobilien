import {notFound} from 'next/navigation';
import {getProperties} from '@/lib/property-store';
import PropertyDetails from '@/components/property-details';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:(await getProperties()).find(p=>p.slug===slug)?.title??'Immobilie'}}
export default async function Property({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await getProperties()).find(p=>p.slug===slug);if(!p)notFound();return <PropertyDetails property={p}/>}
