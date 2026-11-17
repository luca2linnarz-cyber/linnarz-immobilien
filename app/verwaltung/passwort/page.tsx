import PasswordRecovery from '@/components/admin/password-recovery';
export const metadata={title:'Passwort zurücksetzen',referrer:'no-referrer'};
export default function PasswordPage(){return <section className="section page-section admin-login"><p className="eyebrow">Geschützter Verwaltungszugang</p><h1>Passwort zurücksetzen</h1><PasswordRecovery/></section>}
