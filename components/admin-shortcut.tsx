'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
export default function AdminShortcut(){
  const pathname=usePathname();const [admin,setAdmin]=useState(false);
  useEffect(()=>{let active=true;const check=async()=>{try{const response=await fetch('/api/verwaltung/status',{cache:'no-store'});const result=await response.json();if(active)setAdmin(result.admin===true);}catch{if(active)setAdmin(false);}};void check();window.addEventListener('focus',check);return()=>{active=false;window.removeEventListener('focus',check)};},[pathname]);
  return admin?<Link href="/verwaltung" className="admin-shortcut" aria-label="Interne Immobilienverwaltung">Verwaltung</Link>:null;
}
