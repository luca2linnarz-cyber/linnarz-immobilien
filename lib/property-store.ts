import 'server-only';
import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { publicDatabase } from './supabase/server';
import { properties as examples } from './properties';
import { displayPrice, type Property, type PropertyMedia } from './property-fields';
export async function loadCatalog(db: SupabaseClient, admin=false): Promise<Property[]> {
  let query=db.from('properties').select('*, property_media(id,path,label,kind)').order('created_at',{ascending:false});
  if(!admin) query=query.eq('published',true);
  const {data,error}=await query;
  if(error) throw new Error('Die Immobilien konnten gerade nicht geladen werden.');
  return Promise.all((data??[]).map(async row=>{
    const all=row.property_media??[];
    const ordered=(row.media_order??[]).map((id:string)=>all.find((m:{id:string})=>m.id===id)).filter(Boolean);
    const media: PropertyMedia[]=await Promise.all(ordered.map(async(m:PropertyMedia)=>{
      const {data:signed}=await db.storage.from('property-media').createSignedUrl(m.path,admin?1800:300);
      return {...m,url:signed?.signedUrl??''};
    }));
    return {id:row.id,slug:row.slug,reference:row.reference,title:row.title,type:row.type,price:displayPrice(row.price_amount,row.type),priceAmount:row.price_amount,area:row.area,rooms:row.rooms,details:row.details??{},extra:row.details?.plotArea?`${row.details.plotArea} m² Grundstück`:row.details?.city??'',image:media.find(m=>m.kind==='photo')?.url??'',description:row.description,equipment:row.equipment,location:row.location,status:row.status,published:row.published,demo:row.is_demo,media,updatedAt:row.updated_at};
  }));
}
export const getProperties=cache(async():Promise<Property[]>=>{
  const db=publicDatabase();
  if(!db) return examples.map((p,i)=>({...p,id:`demo-${i}`,reference:`DEMO-00${i+1}`,priceAmount:null,type:p.type as 'Kauf'|'Miete',status:'Verfügbar',published:true,demo:true,details:{objectType:i===1?'Wohnung':'Haus',...(p.title.includes('Adenau')?{city:'Adenau'}:{}),...(p.extra.includes('Grundstück')?{plotArea:p.extra.replace(' m² Grundstück','')}:{} )},equipment:'',location:'',media:[{id:`photo-${i}`,path:p.image,label:p.title,kind:'photo',url:p.image}]}));
  return loadCatalog(db);
});
