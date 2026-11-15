# Linnarz Immobilien

Responsive Next.js website based on the approved design, with the original SVG logo, independently extracted/restored castle landscape, demonstration listings, purchase/rental filters, property detail pages and working telephone/email contact links.

## Run locally

Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Production validation: `npm run build`, `npm run typecheck`. Start the production build with `npm start`.

## Current scope

- App Router, TypeScript, local images and system fonts; no tracking or external font calls.
- Accessible mobile navigation, reduced-motion support and keyboard focus indicators.
- Example listings are explicitly labeled; all contact links use +49 175 1165719 and info@linnarz-immobilien.de.
- No deployment, DNS changes or paid services have been configured.
- Search engine indexing is disabled for this development version.
- Sanity CMS, Resend delivery and any video service are not connected yet. Contact currently uses telephone/email links, not a pretend submission form.
- Legal pages are clearly marked incomplete. Business address, licensing/supervisory information and the final privacy notice must be supplied and reviewed before publication.

## Images and source fidelity

`public/images/hero-castle.png` is a standalone 1199×431 PNG, not a screenshot used as a web page. About 50.7% of its pixels are copied unchanged from the original screenshot, including the visible castle. Text, button and contact-card regions were reconstructed, with narrow blended boundaries. Hidden pixels cannot be recovered pixel-identically. The AI restoration was composited only into the masked regions; the complete image was not replaced by the generated variant.

The supplied SVG logo is copied unchanged. A separate original portrait was not present among the accessible conversation attachments, so `portrait.png` is a lossless crop from the supplied design; replace it with the original portrait when available. Property and valuation images are also cropped from the supplied design and are demonstration material, not evidence of real listings.

`ASSET-PROVENANCE.md` documents the image provenance. Local reference inputs and masks are kept outside the Git commit in `reference/`.

## Before launch

Replace example listings, connect Sanity if required, configure verified Resend sending if a form is added, complete legal information, check image rights and original portrait, remove development notices and enable indexing only after approval. Deployment is a separate step.

## Contact form delivery
The contact form posts to `/api/kontakt` and sends plain-text email via Namecheap Private Email (TLS, port 465), to info@linnarz-immobilien.de. Set server-only Vercel variables `SMTP_USER` and `SMTP_PASSWORD` (Namecheap application password; SMTP access enabled), then redeploy. Never commit credentials. Missing configuration returns 503 and does not claim success. Delivery acceptance and inbox receipt must be tested after configuration. The in-memory abuse limit is best-effort per instance; deployment protection remains enabled for previews.
