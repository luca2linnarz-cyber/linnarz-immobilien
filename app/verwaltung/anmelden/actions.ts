'use server';
import { redirect } from 'next/navigation';
import { sessionDatabase } from '@/lib/supabase/server';
export async function login(data: FormData) {
  const db=await sessionDatabase();
  if(!db) redirect('/verwaltung/anmelden?fehler=einrichtung');
  const {error}=await db.auth.signInWithPassword({email:String(data.get('email')??'').trim(),password:String(data.get('password')??'')});
  if(error) redirect('/verwaltung/anmelden?fehler=anmeldung');
  const {data:{user}}=await db.auth.getUser();
  const {data:admin}=await db.from('catalog_admins').select('user_id').eq('user_id',user?.id??'').maybeSingle();
  if(!admin){await db.auth.signOut();redirect('/verwaltung/anmelden?fehler=berechtigung');}
  redirect('/verwaltung');
}
export async function logout(){const db=await sessionDatabase();await db?.auth.signOut();redirect('/verwaltung/anmelden');}
