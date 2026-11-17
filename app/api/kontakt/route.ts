import {getProperties} from '@/lib/property-store';
import nodemailer from 'nodemailer';
import { checkEmailDomain } from '@/lib/email-domain';
import { validateContact } from '@/lib/contact-validation';
export const runtime = 'nodejs';
export const maxDuration = 30;
// Best-effort per-instance abuse guard; deployment protection also remains active.
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return fail('Ungültige Anfrage.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return fail('Ungültiges Format.', 415);
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 16000) return fail('Die Anfrage ist zu lang.', 413);
  let data: Record<string, unknown>;
  try { data = JSON.parse(raw); if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(); } catch { return fail('Ungültige Anfrage.', 400); }
  if (data.website) return fail('Die Anfrage konnte nicht verarbeitet werden.', 400);
  const value = (key: string) => typeof data[key] === 'string' ? (data[key] as string).trim() : '';
  const name=value('name'), email=value('email'), phone=value('phone'), subject=value('subject'), message=value('message');
  const fieldErrors = validateContact(data);
  if (Object.keys(fieldErrors).length) return Response.json({ error: 'Bitte korrigieren Sie die markierten Felder.', fieldErrors }, { status: 400 });
  const now=Date.now(), key=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  for (const [ip, entry] of attempts) if (entry.until<now) attempts.delete(ip);
  const entry=attempts.get(key);
  if (entry && entry.count>=5) return fail('Bitte warten Sie einige Minuten, bevor Sie erneut eine Anfrage senden.',429);
  if (attempts.size>10000) return fail('Bitte versuchen Sie es später erneut.',429);
  attempts.set(key,{count:(entry?.count || 0)+1,until:entry?.until || now+600000});
  const propertySlug=value('property');
  const property=propertySlug?(await getProperties()).find(p=>p.slug===propertySlug):undefined;
  if(propertySlug&&!property)return fail('Dieses Angebot ist nicht mehr verfügbar. Bitte wählen Sie eine andere Immobilie oder kontaktieren Sie uns direkt.',400);
  const propertyText=property?`Objekt: ${property.reference} – ${property.title}\n\n`:'';
  const domainStart = performance.now();
  const domainStatus = await checkEmailDomain(email);
  const domainMs = performance.now() - domainStart;
  if (domainStatus === 'invalid') return Response.json({ error: 'Bitte korrigieren Sie die markierte E-Mail-Adresse.', fieldErrors: { email: 'Diese E-Mail-Domain kann keine E-Mails empfangen. Prüfen Sie die Schreibweise nach dem @-Zeichen.' } }, { status: 400 });
  if (domainStatus === 'unavailable') return fail('Die E-Mail-Domain konnte gerade nicht geprüft werden. Bitte versuchen Sie es in Kürze erneut.', 503);
  const user=process.env.SMTP_USER, pass=process.env.SMTP_PASSWORD;
  if (!user || !pass) return fail('Der Formularversand wird gerade eingerichtet. Bitte nutzen Sie vorerst Telefon oder E-Mail.',503);
  const transport=nodemailer.createTransport({host:'mail.privateemail.com',port:465,secure:true,auth:{user,pass},connectionTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
  try {
    const smtpStart = performance.now();
    const result=await transport.sendMail({from:{name:'Linnarz Immobilien · Website',address:user},to:'info@linnarz-immobilien.de',replyTo:{name,address:email},subject:`Website-Anfrage: ${subject}${property?` · ${property.reference}`:''}`,text:`${propertyText}Anliegen: ${subject}\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone}\n\nNachricht:\n${message}`});
    if (!result.accepted?.length) throw new Error('Not accepted');
    return Response.json({ok:true}, { headers: { 'Server-Timing': `domain;dur=${domainMs.toFixed(1)}, smtp;dur=${(performance.now() - smtpStart).toFixed(1)}` } });
  } catch { return fail('Ihre Anfrage konnte nicht versendet werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.',502); }
  finally { transport.close(); }
}
