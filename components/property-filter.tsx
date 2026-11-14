'use client';
import {useState} from 'react';
import {properties} from '@/lib/properties';
import {PropertyCard} from './property-card';
export function PropertyFilter(){const [filter,setFilter]=useState('Alle');return <><div className="filters" aria-label="Angebotsart">{['Alle','Kauf','Miete'].map(type=><button aria-pressed={filter===type} onClick={()=>setFilter(type)} key={type}>{type}</button>)}</div><p aria-live="polite" className="demo-note">{properties.filter(p=>filter==='Alle'||p.type===filter).length} Beispielangebote</p><div className="property-grid">{properties.filter(p=>filter==='Alle'||p.type===filter).map(p=><PropertyCard property={p} key={p.slug}/>)}</div></>}
