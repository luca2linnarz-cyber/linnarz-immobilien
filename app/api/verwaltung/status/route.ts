import {adminDatabase} from '@/lib/supabase/server';
export async function GET(){return Response.json({admin:!!await adminDatabase()},{headers:{'Cache-Control':'private, no-store'}});}
