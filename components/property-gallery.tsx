'use client';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { PropertyMedia } from '@/lib/property-fields';
export default function PropertyGallery({media,title}:{media:PropertyMedia[];title:string}) {
  const [index,setIndex]=useState(0);const dialog=useRef<HTMLDialogElement>(null);
  const photos=media.filter(m=>m.kind==='photo');
  if(!photos.length)return <div className="gallery-placeholder">Bilder werden ergänzt.</div>;
  const current=photos[index]??photos[0];
  const move=(step:number)=>setIndex(i=>(i+step+photos.length)%photos.length);
  return <div className="property-gallery"><button className="gallery-main" onClick={()=>dialog.current?.showModal()} aria-label="Bilder in Vollbild öffnen"><img src={current.url} alt={current.label||title}/><span><Expand size={18}/> {photos.length===1?'Bild vergrößern':`Alle ${photos.length} Bilder ansehen`}</span></button><div className="gallery-thumbs">{photos.map((m,i)=><button key={m.id} onClick={()=>setIndex(i)} aria-label={`Bild ${i+1}: ${m.label||title}`} aria-pressed={i===index}><img src={m.url} alt="" loading="lazy"/></button>)}</div><dialog ref={dialog} className="gallery-dialog" onKeyDown={e=>{if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1)}}><button className="gallery-close" onClick={()=>dialog.current?.close()} aria-label="Bildansicht schließen"><X/></button><img src={current.url} alt={current.label||title}/><div className="gallery-controls"><button onClick={()=>move(-1)} aria-label="Vorheriges Bild"><ChevronLeft/></button><span>{index+1} / {photos.length}</span><button onClick={()=>move(1)} aria-label="Nächstes Bild"><ChevronRight/></button></div></dialog></div>;
}
