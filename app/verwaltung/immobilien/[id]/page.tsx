import {redirect,notFound} from 'next/navigation';
import {adminDatabase} from '@/lib/supabase/server';
import {loadCatalog} from '@/lib/property-store';
import PropertyEditor from '@/components/admin/property-editor';
import PropertyDetails from '@/components/property-details';
export default async function EditProperty({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{vorschau?:string}>}){const db=await adminDatabase();if(!db)redirect('/verwaltung/anmelden');const {id}=await params;const p=(await loadCatalog(db,true)).find(p=>p.id===id);if(!p)notFound();return (await searchParams).vorschau?<PropertyDetails property={p} preview/>:<PropertyEditor initial={p}/>}
