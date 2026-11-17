import {adminDatabase} from '@/lib/supabase/server';
export async function POST(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Ungültige Anfrage.'},{status:403});
  const db=await adminDatabase();if(!db)return Response.json({error:'Bitte erneut anmelden.'},{status:401});
  const raw=await request.text();if(Buffer.byteLength(raw)>2000)return Response.json({error:'Die Anfrage ist zu umfangreich.'},{status:413});
  let input:Record<string,unknown>;try{input=JSON.parse(raw);if(!input||typeof input!=='object'||Array.isArray(input))throw Error();}catch{return Response.json({error:'Ungültige Anfrage.'},{status:400});}
  const id=crypto.randomUUID();
  const title=typeof input.title==='string'?input.title.trim().slice(0,180):'';
  const {data,error}=await db.from('properties').insert({id,title:title||'Neue Immobilie (Entwurf)',reference:`LI-${new Date().getFullYear()}-${id.slice(0,8).toUpperCase()}`,slug:`entwurf-${id}`,type:input.type==='Miete'?'Miete':'Kauf',published:false,is_demo:true}).select('id,updated_at,reference,slug').single();
  if(error)return Response.json({error:'Der Bildspeicher konnte nicht vorbereitet werden. Bitte versuchen Sie es erneut.'},{status:500});
  return Response.json(data);
}
