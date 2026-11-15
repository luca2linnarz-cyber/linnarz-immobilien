import nodemailer from 'nodemailer';
export const runtime = 'nodejs';
export const maxDuration = 30;
const subjects = ['Verkauf','Vermietung','Bewertung','Baufinanzierung','Sonstiges'];
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
  if (!name || name.length>120 || /[\r\n]/.test(name) || email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || phone.length>40 || !/^[+\d\s()./-]+$/.test(phone) || phone.replace(/\D/g,'').length<6 || !subjects.includes(subject) || message.length<10 || message.length>5000) return fail('Bitte prüfen Sie die Pflichtfelder, die Telefonnummer und Ihre E-Mail-Adresse.',400);
  const now=Date.now(), key=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  for (const [ip, entry] of attempts) if (entry.until<now) attempts.delete(ip);
  const entry=attempts.get(key);
  if (entry && entry.count>=5) return fail('Bitte warten Sie einige Minuten, bevor Sie erneut eine Anfrage senden.',429);
  if (attempts.size>10000) return fail('Bitte versuchen Sie es später erneut.',429);
  attempts.set(key,{count:(entry?.count || 0)+1,until:entry?.until || now+600000});
  const user=process.env.SMTP_USER, pass=process.env.SMTP_PASSWORD;
  if (!user || !pass) return fail('Der Formularversand wird gerade eingerichtet. Bitte nutzen Sie vorerst Telefon oder E-Mail.',503);
  const transport=nodemailer.createTransport({host:'mail.privateemail.com',port:465,secure:true,auth:{user,pass},connectionTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
  try {
    const result=await transport.sendMail({from:{name:'Linnarz Immobilien · Website',address:user},to:'info@linnarz-immobilien.de',replyTo:{name,address:email},subject:`Website-Anfrage: ${subject}`,text:`Anliegen: ${subject}\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone}\n\nNachricht:\n${message}`});
    if (!result.accepted?.length) throw new Error('Not accepted');
    return Response.json({ok:true});
  } catch { return fail('Ihre Anfrage konnte nicht versendet werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.',502); }
  finally { transport.close(); }
}
