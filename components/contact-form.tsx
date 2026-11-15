'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export default function ContactForm({ subject }: { subject: string }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  return <section className="section inquiry-section" aria-labelledby="inquiry-title">
    <p className="eyebrow">Ihre Anfrage</p><h2 id="inquiry-title">Wie können wir Ihnen helfen?</h2>
    <p>Schildern Sie uns Ihr Anliegen. Wir melden uns persönlich bei Ihnen. Alle Felder sind Pflichtfelder.</p>
    <form className="inquiry-form" onSubmit={async e => {
      e.preventDefault(); if (busy) return;
      const form = e.currentTarget; const data = Object.fromEntries(new FormData(form));
      setBusy(true); setStatus(''); setSent(false);
      try {
        const response = await fetch('/api/kontakt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Der Versand ist fehlgeschlagen. Bitte versuchen Sie es erneut.');
        setStatus('Vielen Dank! Ihre Anfrage wurde versendet. Wir melden uns persönlich bei Ihnen.'); setSent(true); form.reset();
      } catch (error) { setStatus(error instanceof Error ? error.message : 'Der Versand ist fehlgeschlagen. Bitte kontaktieren Sie uns telefonisch oder per E-Mail.'); }
      finally { setBusy(false); }
    }}>
      <label>Ihr Name<input name="name" autoComplete="name" required maxLength={120}/></label>
      <label>E-Mail-Adresse<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
      <label>Telefonnummer<input name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={40}/></label>
      <label>Ihr Anliegen<select name="subject" defaultValue={subject} required>{['Verkauf','Vermietung','Bewertung','Baufinanzierung','Sonstiges'].map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="full-width">Ihre Nachricht<textarea name="message" required minLength={10} maxLength={5000} rows={6}/></label>
      <div className="form-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <p className="full-width form-privacy">Wir verwenden Ihre Angaben zur Bearbeitung Ihrer Anfrage und zur Kontaktaufnahme. Weitere Informationen finden Sie in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
      <button className="button" type="submit" disabled={busy}>{busy ? 'Wird gesendet …' : 'Anfrage senden'}<ArrowRight aria-hidden="true"/></button>
      <p className={`full-width form-status${sent ? ' success' : ''}`} role="status" aria-live="polite">{status}</p>
    </form>
  </section>;
}
