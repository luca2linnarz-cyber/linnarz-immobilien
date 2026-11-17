export const contactSubjects = ['Verkauf', 'Vermietung', 'Bewertung', 'Baufinanzierung', 'Sonstiges'];
export type ContactField = 'subject' | 'name' | 'phone' | 'email' | 'message';
export type ContactErrors = Partial<Record<ContactField, string>>;
export const contactFields: ContactField[] = ['subject', 'name', 'phone', 'email', 'message'];
const emailDomainTypos: Record<string, string> = {
  'gmail.con': 'gmail.com', 'gmail.cmo': 'gmail.com', 'gmail.comm': 'gmail.com',
  'gamil.com': 'gmail.com', 'gmial.com': 'gmail.com',
  'outlook.con': 'outlook.com', 'hotmail.con': 'hotmail.com', 'yahoo.con': 'yahoo.com',
};
export function validateContact(data: Record<string, unknown>): ContactErrors {
  const value = (key: string) => typeof data[key] === 'string' ? (data[key] as string).trim() : '';
  const name = value('name'), email = value('email'), phone = value('phone'), message = value('message');
  const errors: ContactErrors = {};
  if (!contactSubjects.includes(value('subject'))) errors.subject = 'Wählen Sie bitte Ihr Anliegen aus.';
  if (!name || name.length > 120 || /[\r\n]/.test(name)) errors.name = 'Geben Sie bitte Ihren Namen an.';
  if (phone.length > 40 || !/^[+\d\s()./-]+$/.test(phone) || phone.replace(/\D/g, '').length < 6) errors.phone = 'Geben Sie eine gültige Telefonnummer an.';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) errors.email = 'Geben Sie eine gültige E-Mail-Adresse an.';
  const suggestedDomain = emailDomainTypos[email.split('@')[1]?.toLowerCase()];
  if (!errors.email && suggestedDomain) errors.email = `Prüfen Sie die E-Mail-Adresse. Meinten Sie „${suggestedDomain}“?`;
  if (message.length < 10) errors.message = 'Geben Sie eine Nachricht mit mindestens 10 Zeichen ein.';
  else if (message.length > 5000) errors.message = 'Ihre Nachricht darf höchstens 5.000 Zeichen enthalten.';
  return errors;
}
