'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { contactFields, contactSubjects, validateContact, type ContactErrors, type ContactField } from '@/lib/contact-validation';
export default function ContactForm({ subject, propertySlug, propertyTitle }: { subject: string; propertySlug?: string; propertyTitle?: string }) {
  const [errors, setErrors] = useState<ContactErrors>({});
  const fieldProps = (field: ContactField) => ({ 'aria-invalid': errors[field] ? true : undefined, 'aria-describedby': errors[field] ? `${field}-error` : undefined });
  const fieldError = (field: ContactField) => errors[field] ? <span className="field-error" id={`${field}-error`}>{errors[field]}</span> : null;
  const showErrors = (form: HTMLFormElement, next: ContactErrors) => {
    setErrors(next); setSent(false); setStatus('Bitte korrigieren Sie die markierten Felder.');
    const first = contactFields.find(field => next[field]);
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
  };
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [borderSize, setBorderSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!sent || !formRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setBorderSize({ width: entry.borderBoxSize[0].inlineSize, height: entry.borderBoxSize[0].blockSize });
    });
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [sent]);
  useEffect(() => {
    if (sent) {
      successRef.current?.focus({ preventScroll: true });
    }
  }, [sent]);
  return <section className="section inquiry-section" aria-labelledby="inquiry-title">
    <p className="eyebrow">Ihre Anfrage</p><h2 id="inquiry-title">Erzählen Sie mir von Ihren Plänen.</h2>
    <p>Schildern Sie uns Ihr Anliegen. Wir melden uns persönlich bei Ihnen. Alle Felder sind Pflichtfelder.</p>
    <form ref={formRef} className={`inquiry-form${sent ? ' is-sent' : ''}`} noValidate onInput={e => {
      if (sent) { setSent(false); setStatus(''); }
      const field = (e.target as HTMLInputElement).name as ContactField;
      if (errors[field]) {
        const next = validateContact(Object.fromEntries(new FormData(e.currentTarget)));
        const remaining = { ...errors, [field]: next[field] };
        setErrors(remaining);
        if (!Object.values(remaining).some(Boolean)) setStatus('');
      }
    }} onSubmit={async e => {
      e.preventDefault(); if (busy) return;
      const form = e.currentTarget; const data = Object.fromEntries(new FormData(form));
      const nextErrors = validateContact(data);
      if (Object.keys(nextErrors).length) { showErrors(form, nextErrors); return; }
      setErrors({}); setBusy(true); setStatus(''); setSent(false);
      try {
        const response = await fetch('/api/kontakt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (response.status === 400 && result.fieldErrors) { showErrors(form, result.fieldErrors); return; }
        if (!response.ok) throw new Error(result.error || 'Der Versand ist fehlgeschlagen. Bitte versuchen Sie es erneut.');
        setStatus('Vielen Dank! Ihre Anfrage wurde versendet. Wir melden uns persönlich bei Ihnen.'); setSent(true); form.reset();
      } catch (error) { setStatus(error instanceof Error ? error.message : 'Der Versand ist fehlgeschlagen. Bitte kontaktieren Sie uns telefonisch oder per E-Mail.'); }
      finally { setBusy(false); }
    }}>
      {sent && borderSize.width > 0 && <svg className="success-outline" viewBox={`0 0 ${borderSize.width} ${borderSize.height}`} aria-hidden="true">
        {(() => {
          const { width: w, height: h } = borderSize, r = 20;
          return [
            `M ${w/2} 0 H ${w-r} Q ${w} 0 ${w} ${r} V ${h/2}`,
            `M ${w/2} 0 H ${r} Q 0 0 0 ${r} V ${h/2}`,
            `M ${w/2} ${h} H ${w-r} Q ${w} ${h} ${w} ${h-r} V ${h/2}`,
            `M ${w/2} ${h} H ${r} Q 0 ${h} 0 ${h-r} V ${h/2}`,
          ].map((d, i) => <path key={i} d={d} pathLength="100"/>);
        })()}
      </svg>}
      {sent && <div ref={successRef} className="full-width form-success" tabIndex={-1} role="status">
        <CircleCheck aria-hidden="true"/><div><strong>Ihre Anfrage wurde erfolgreich versendet.</strong><p>Vielen Dank für Ihr Vertrauen. Ich melde mich persönlich bei Ihnen.</p></div>
      </div>}
      {propertySlug&&<input type="hidden" name="property" value={propertySlug}/>}
      <label>Ihr Anliegen<select name="subject" {...fieldProps('subject')} defaultValue={subject} required>{contactSubjects.map(s=><option key={s}>{s}</option>)}</select>{fieldError('subject')}</label>
      <label>Ihr Name<input name="name" {...fieldProps('name')} autoComplete="name" required maxLength={120}/>{fieldError('name')}</label>
      <label>Telefonnummer<input name="phone" {...fieldProps('phone')} type="tel" autoComplete="tel" required minLength={6} maxLength={40}/>{fieldError('phone')}</label>
      <label>E-Mail-Adresse<input name="email" {...fieldProps('email')} type="email" onBlur={e => {
        const error = validateContact({ email: e.currentTarget.value }).email;
        setErrors(previous => ({ ...previous, email: error }));
      }} autoComplete="email" required maxLength={254}/>{fieldError('email')}</label>
      <label className="full-width">Ihre Nachricht<textarea name="message" {...fieldProps('message')} required minLength={10} maxLength={5000} rows={6} defaultValue={propertyTitle?`Ich interessiere mich für „${propertyTitle}“. Bitte senden Sie mir weitere Informationen zu.`:undefined}/>{fieldError('message')}</label>
      <div className="form-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <p className="full-width form-privacy">Wir verwenden Ihre Angaben zur Bearbeitung Ihrer Anfrage und zur Kontaktaufnahme. Weitere Informationen finden Sie in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
      <button className="button" type="submit" disabled={busy || sent} aria-busy={busy}>{sent ? 'Anfrage gesendet' : busy ? 'Wird gesendet …' : 'Anfrage senden'}<ArrowRight aria-hidden="true"/></button>
      <p className={`full-width form-status${sent ? ' success' : ''}`} role="status" aria-live="polite">{sent ? '' : status}</p>
    </form>
  </section>;
}
