import sharp from 'sharp';
import {adminDatabase} from '@/lib/supabase/server';
export const runtime='nodejs';
export async function POST(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Ungültige Anfrage.'},{status:403});
  const db=await adminDatabase();if(!db)return Response.json({error:'Bitte erneut anmelden.'},{status:401});
  const id=new URL(request.url).searchParams.get('objekt');
  if(!id||!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'Speichern Sie zuerst einen Entwurf.'},{status:400});
  const {data:property}=await db.from('properties').select('id').eq('id',id).maybeSingle();if(!property)return Response.json({error:'Objekt nicht gefunden.'},{status:404});
  if(Number(request.headers.get('content-length'))>3000000)return Response.json({error:'Das Bild ist zu groß.'},{status:413});
  const raw=Buffer.from(await request.arrayBuffer());if(raw.length>3000000)return Response.json({error:'Das Bild ist zu groß.'},{status:413});
  let image:Buffer;try{image=await sharp(raw,{limitInputPixels:40000000}).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();}catch{return Response.json({error:'Bitte ein gültiges JPG-, PNG- oder WebP-Bild auswählen.'},{status:400});}
  let label='';try{label=decodeURIComponent(request.headers.get('x-image-label')??'').slice(0,180);}catch{return Response.json({error:'Ungültiger Bildtitel.'},{status:400});}
  const mediaId=crypto.randomUUID(),path=`${id}/${mediaId}.webp`;
  const kind=new URL(request.url).searchParams.get('art')==='floorplan'?'floorplan':'photo';
  const {error:upload}=await db.storage.from('property-media').upload(path,image,{contentType:'image/webp',upsert:false});if(upload)return Response.json({error:'Das Bild konnte nicht hochgeladen werden.'},{status:500});
  const {error}=await db.from('property_media').insert({id:mediaId,property_id:id,path,kind,label});
  if(error){await db.storage.from('property-media').remove([path]);return Response.json({error:'Die Bildzuordnung konnte nicht gespeichert werden.'},{status:500});}
  const {data:signed}=await db.storage.from('property-media').createSignedUrl(path,1800);
  return Response.json({id:mediaId,path,kind,label,url:signed?.signedUrl??''});
}
