import { Resolver } from 'node:dns/promises';
import { domainToASCII } from 'node:url';

export type MailDomainStatus = 'valid' | 'invalid' | 'unavailable';
const missing = (error: unknown) => ['ENOTFOUND', 'ENODATA'].includes((error as NodeJS.ErrnoException).code ?? '');

const domainCache = new Map<string, { status: MailDomainStatus; expires: number }>();
const pendingChecks = new Map<string, Promise<MailDomainStatus>>();

// Look up only the domain; no address or message is sent to a verification service.
export async function checkEmailDomain(email: string): Promise<MailDomainStatus> {
  const domain = domainToASCII(email.slice(email.lastIndexOf('@') + 1).toLowerCase());
  if (!domain || domain.length > 253 || domain.split('.').some(label => !/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))) return 'invalid';
  const now = Date.now();
  const cached = domainCache.get(domain);
  if (cached && cached.expires > now) return cached.status;
  const pending = pendingChecks.get(domain);
  if (pending) return pending;
  const check = resolveMailDomain(domain).then(status => {
    if (status !== 'unavailable') {
      if (domainCache.size >= 1000) domainCache.delete(domainCache.keys().next().value!);
      domainCache.set(domain, { status, expires: Date.now() + (status === 'valid' ? 300000 : 30000) });
    }
    return status;
  }).finally(() => { pendingChecks.delete(domain); });
  pendingChecks.set(domain, check);
  return check;
}

async function resolveMailDomain(domain: string): Promise<MailDomainStatus> {
  const resolver = new Resolver({ timeout: 2000, tries: 1 });
  try {
    try {
      const records = await resolver.resolveMx(domain);
      if (records.length) return records.some(record => record.exchange && record.exchange !== '.') ? 'valid' : 'invalid';
    } catch (error) {
      if (!missing(error)) return 'unavailable';
      if ((error as NodeJS.ErrnoException).code === 'ENOTFOUND') return 'invalid';
    }
    // SMTP permits an address-record fallback when no MX record is published.
    const addresses = await Promise.allSettled([resolver.resolve4(domain), resolver.resolve6(domain)]);
    if (addresses.some(result => result.status === 'fulfilled' && result.value.length)) return 'valid';
    return addresses.every(result => result.status === 'rejected' && missing(result.reason)) ? 'invalid' : 'unavailable';
  } finally { resolver.cancel(); }
}
