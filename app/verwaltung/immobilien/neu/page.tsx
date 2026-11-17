import {redirect} from 'next/navigation';
import {adminDatabase} from '@/lib/supabase/server';
import PropertyEditor from '@/components/admin/property-editor';
export default async function NewProperty(){if(!await adminDatabase())redirect('/verwaltung/anmelden');return <PropertyEditor/>}
