import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseConfig } from './config';
export function publicDatabase() {
  const config = supabaseConfig();
  return config ? createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
export async function sessionDatabase() {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, { cookies: {
    getAll: () => jar.getAll(),
    setAll(values) { try { values.forEach(({name,value,options}) => jar.set(name,value,options)); } catch { /* Server components rely on proxy refresh. */ } },
  } });
}
export async function adminDatabase() {
  const db = await sessionDatabase();
  if (!db) return null;
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: admin } = await db.from('catalog_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  return admin ? db : null;
}
