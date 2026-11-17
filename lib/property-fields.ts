export const propertyFields = [
  ['objectType','Immobilienart'],['postalCode','Postleitzahl'],['city','Ort'],
  ['bedrooms','Schlafzimmer'],['bathrooms','Badezimmer'],['usableArea','Nutzfläche (m²)'],
  ['plotArea','Grundstück (m²)'],['floor','Etage'],['floors','Etagen im Gebäude'],
  ['yearBuilt','Baujahr'],['condition','Zustand'],['modernization','Letzte Modernisierung'],
  ['parking','Stellplätze / Garage'],['availableFrom','Verfügbar ab'],['occupancy','Vermietungsstatus'],
  ['commission','Provision'],['serviceCharges','Nebenkosten (€/Monat)'],['warmRent','Warmmiete (€/Monat)'],
  ['deposit','Kaution'],['houseMoney','Hausgeld (€/Monat)'],['annualRent','Jahresnettokaltmiete (€)'],
  ['energyCertificate','Art des Energieausweises'],['energyValue','Endenergiebedarf / -verbrauch (kWh/m²a)'],
  ['energyClass','Energieeffizienzklasse'],['energyValidUntil','Energieausweis gültig bis'],
  ['energyYearBuilt','Baujahr laut Energieausweis'],['heating','Heizungsart'],['energySource','Wesentlicher Energieträger'],
] as const;
export type PropertyDetails = Partial<Record<typeof propertyFields[number][0], string>>;
export const propertyStatuses = ['Verfügbar','Reserviert','Verkauft','Vermietet'] as const;
export type PropertyStatus = typeof propertyStatuses[number];
export type PropertyMedia = { id: string; path: string; label: string; kind: 'photo'|'floorplan'; url: string };
export type Property = {
  id: string; slug: string; reference: string; title: string; type: 'Kauf'|'Miete';
  price: string; priceAmount: number | null; area: number | null; rooms: number | null;
  extra: string; image: string; description: string; equipment: string; location: string;
  details: PropertyDetails; status: PropertyStatus; published: boolean; demo: boolean;
  media: PropertyMedia[]; updatedAt?: string;
};
export function displayPrice(amount: number | null, type: string) {
  return amount === null ? 'Preis auf Anfrage' : new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(amount) + (type==='Miete'?' / Monat':'');
}
export function validateProperty(input: Record<string,unknown>) {
  const errors: string[] = [];
  const text = (name:string,max=500) => typeof input[name]==='string' ? String(input[name]).trim().slice(0,max) : '';
  const number = (name:string) => input[name] === '' || input[name] == null ? null : Number(input[name]);
  const title=text('title',180), slug=text('slug',120), reference=text('reference',60), type=text('type');
  if (!title || !reference || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('Titel, Objektnummer und ein gültiger URL-Name sind erforderlich.');
  if (!['Kauf','Miete'].includes(type)) errors.push('Bitte Kauf oder Miete auswählen.');
  const priceAmount=number('priceAmount'),area=number('area'),rooms=number('rooms');
  for(const n of [priceAmount,area,rooms]) if(n!==null && (!Number.isFinite(n)||n<0||n>1e10)) errors.push('Flächen, Zimmer und Preise müssen gültige positive Zahlen sein.');
  const details: PropertyDetails={};
  const raw=input.details && typeof input.details==='object' ? input.details as Record<string,unknown> : {};
  for(const [key] of propertyFields) if(typeof raw[key]==='string') details[key]=String(raw[key]).trim().slice(0,500);
  const mediaOrder=Array.isArray(input.mediaOrder)? [...new Set(input.mediaOrder.filter((id:unknown):id is string=>typeof id==='string' && /^[0-9a-f-]{36}$/i.test(id)))].slice(0,60):[];
  const published=input.published===true;
  if(published && (!text('description',20000)||!details.city||!mediaOrder.length)) errors.push('Zum Veröffentlichen benötigen Sie eine Beschreibung, den Ort und mindestens ein Bild.');
  return { errors, row: { title,slug,reference,type,price_amount:priceAmount,area,rooms,details,status:propertyStatuses.includes(input.status as PropertyStatus)?input.status:'Verfügbar',published,is_demo:input.demo===true,description:text('description',20000),equipment:text('equipment',12000),location:text('location',12000),media_order:mediaOrder } };
}
