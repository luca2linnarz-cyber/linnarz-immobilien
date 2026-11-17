import Link from 'next/link';
import {redirect} from 'next/navigation';
import {adminDatabase} from '@/lib/supabase/server';
import {loadCatalog} from '@/lib/property-store';
import {logout} from './anmelden/actions';
export const metadata={title:'Immobilienverwaltung',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Administration(){const db=await adminDatabase();if(!db)redirect('/verwaltung/anmelden');const properties=await loadCatalog(db,true);return <section className="section page-section admin-page"><div className="section-heading"><div><p className="eyebrow">Ihre Verwaltung</p><h1>Immobilien</h1></div><form action={logout}><button className="text-link admin-plain">Abmelden</button></form></div><Link className="button" href="/verwaltung/immobilien/neu">Neue Immobilie anlegen +</Link><div className="admin-list">{properties.map(p=><Link href={'/verwaltung/immobilien/'+p.id} className="admin-property" key={p.id}><span><strong>{p.title}</strong><small>{p.reference} · {p.type} · {p.details.city}</small></span><span className="object-status">{p.published?p.status:'Entwurf'}</span><span>Bearbeiten →</span></Link>)}{!properties.length&&<p>Noch keine Immobilie angelegt. Starten Sie mit einem Testangebot als Entwurf.</p>}</div></section>}
