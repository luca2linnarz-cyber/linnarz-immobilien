import {PropertyFilter} from '@/components/property-filter';
import {getProperties} from '@/lib/property-store';
export const metadata={title:'Immobilien'};
export const dynamic='force-dynamic';
export default async function Immobilien(){const properties=await getProperties();return <section className="section page-section"><p className="eyebrow">Raum für neue Perspektiven</p><h1>Immobilien entdecken</h1><p>Entdecken Sie unsere Immobilien am Nürburgring und in der gesamten Eifel.</p>{properties.some(p=>p.demo)&&<p className="demo-note">Als Testangebot markierte Immobilien dienen ausschließlich zur Demonstration.</p>}{properties.length?<PropertyFilter properties={properties}/>:<p>Aktuell sind keine Angebote veröffentlicht. Sprechen Sie mich gerne auf Ihre Immobiliensuche an.</p>}</section>}
