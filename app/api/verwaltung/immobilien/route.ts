import {adminDatabase} from '@/lib/supabase/server';
import {validateProperty} from '@/lib/property-fields';
export async function POST(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Ungültige Anfrage.'},{status:403});
  const db=await adminDatabase();if(!db)return Response.json({error:'Bitte erneut anmelden.'},{status:401});
  const raw=await request.text();if(Buffer.byteLength(raw)>60000)return Response.json({error:'Die Angaben sind zu umfangreich.'},{status:413});
  let input;try{input=JSON.parse(raw);if(!input||typeof input!=='object'||Array.isArray(input))throw Error();}catch{return Response.json({error:'Ungültige Angaben.'},{status:400});}
  const {row,errors}=validateProperty(input);
  if(errors.length)return Response.json({error:errors.join(' ')},{status:400});
  const id=typeof input.id==='string'?input.id:undefined;
  if(id&&!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'Ungültige Objektnummer.'},{status:400});
  if(row.media_order.length){const {data:media}=await db.from('property_media').select('id,kind').eq('property_id',id??'00000000-0000-0000-0000-000000000000').in('id',row.media_order);if(row.published&&!media?.some(m=>m.kind==='photo'))return Response.json({error:'Zum Veröffentlichen benötigen Sie mindestens ein Objektfoto.'},{status:400});if(media?.length!==row.media_order.length)return Response.json({error:'Bilder konnten dem Objekt nicht zugeordnet werden.'},{status:400});}
  const query=id?db.from('properties').update({...row,updated_at:new Date().toISOString()}).eq('id',id).eq('updated_at',input.updatedAt??''):db.from('properties').insert(row);
  const {data,error}=await query.select('id,updated_at').maybeSingle();
  if(error)return Response.json({error:error.code==='23505'?'Objektnummer oder URL-Name ist bereits vergeben.':'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.'},{status:400});
  if(!data)return Response.json({error:'Das Angebot wurde inzwischen geändert. Bitte laden Sie es neu.'},{status:409});
  return Response.json(data);
}
