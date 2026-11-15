import Link from 'next/link';
import { ArrowRight, House, Handshake, MessagesSquare } from 'lucide-react';
export const metadata = { title: 'Baufinanzierung', description: 'Traumhaus gefunden? Gemeinsam mit unseren Finanzierungspartnern finden wir eine Baufinanzierung, die zu Ihren Plänen passt.' };
export default function Finanzierung() {
  return <section className="section financing-page">
    <div className="financing-intro">
      <p className="eyebrow">Ihre Baufinanzierung</p>
      <h1>Traumhaus gefunden?<br/>Jetzt fehlt noch die passende Finanzierung.</h1>
      <p className="financing-lead">Mit starken Finanzierungspartnern an unserer Seite unterstützen wir Sie dabei, eine Bank und eine Finanzierung zu finden, die zu Ihnen und Ihren Plänen passen.</p>
      <Link className="button financing-cta" href="/kontakt?anliegen=Baufinanzierung">Jetzt Angebot anfragen <ArrowRight aria-hidden="true"/></Link>
      <p className="financing-caption">Persönlich beraten. Gemeinsam den nächsten Schritt gehen.</p>
    </div>
    <div className="financing-benefits">
      <article><House aria-hidden="true"/><h2>Ihre Pläne im Mittelpunkt</h2><p>Ob erste eigene Wohnung oder Haus für die Familie: Wir sprechen über Ihre Wünsche und Ihren finanziellen Rahmen.</p></article>
      <article><Handshake aria-hidden="true"/><h2>Starke Partner an Ihrer Seite</h2><p>Gemeinsam mit unseren Finanzierungspartnern unterstützen wir Sie auf dem Weg zur passenden Baufinanzierung.</p></article>
      <article><MessagesSquare aria-hidden="true"/><h2>Ein persönlicher Ansprechpartner</h2><p>Als gelernter Bankkaufmann begleite ich Sie bei Ihren Fragen rund um Immobilie und Finanzierung.</p></article>
    </div>
  </section>;
}
