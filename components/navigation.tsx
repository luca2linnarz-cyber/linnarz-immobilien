'use client';
import AdminShortcut from '@/components/admin-shortcut';
import Link from 'next/link';
import {useState} from 'react';
import {Menu,X} from 'lucide-react';
export function Navigation(){const [open,setOpen]=useState(false);return <><button className="menu-button" aria-label={open?'Menü schließen':'Menü öffnen'} aria-expanded={open} aria-controls="navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav id="navigation" className={open?'navigation open':'navigation'} aria-label="Hauptnavigation" onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}>{[['/immobilien','Immobilien'],['/#leistungen','Leistungen'],['/finanzierung','Finanzierung'],['/kontakt','Kontakt']].map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<AdminShortcut/></nav></>}
