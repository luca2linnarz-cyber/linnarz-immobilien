'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { supabaseConfig } from '@/lib/supabase/config';

function client(){const config=supabaseConfig();return config?createBrowserClient(config.url,config.key,{auth:{detectSessionInUrl:false}}):null;}
export default function PasswordRecovery(){
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[done,setDone]=useState(false),[message,setMessage]=useState(''),[email,setEmail]=useState('');
  useEffect(()=>{
    let active=true;
    async function initialize(){
      const db=client();if(!db){setMessage('Der Verwaltungszugang ist noch nicht eingerichtet.');setLoading(false);return;}
      const url=new URL(window.location.href),hash=new URLSearchParams(url.hash.slice(1));
      const access=hash.get('access_token'),refresh=hash.get('refresh_token'),code=url.searchParams.get('code'),tokenHash=url.searchParams.get('token_hash');
      const failed=hash.has('error')||url.searchParams.has('error');
      // Remove recovery credentials from the address bar before rendering links.
      if(url.hash||code||tokenHash||failed)window.history.replaceState(null,'',url.pathname);
      try{
        if(failed)throw Error();
        if(access&&refresh){const {error}=await db.auth.setSession({access_token:access,refresh_token:refresh});if(error)throw error;}
        else if(code){const {error}=await db.auth.exchangeCodeForSession(code);if(error)throw error;}
        else if(tokenHash){const {error}=await db.auth.verifyOtp({token_hash:tokenHash,type:'recovery'});if(error)throw error;}
        const {data:{user},error}=await db.auth.getUser();
        if(active&&user&&!error){setReady(true);setEmail(user.email??'');}
        else if(active&&(access||code||tokenHash))setMessage('Dieser Link ist abgelaufen oder bereits verwendet. Fordern Sie bitte einen neuen an.');
      }catch{if(active)setMessage('Dieser Link ist abgelaufen oder ungültig. Fordern Sie bitte einen neuen an.');}
      finally{if(active)setLoading(false);}
    }
    void initialize();return()=>{active=false};
  },[]);
  if(loading)return <p role="status">Der Link wird geprüft …</p>;
  if(done)return <div className="admin-notice" role="status"><h2>Passwort gespeichert</h2><p>Sie können sich jetzt mit Ihrem neuen Passwort anmelden.</p><Link className="button" href="/verwaltung/anmelden">Zur Anmeldung</Link></div>;
  return <><p>{ready?`Legen Sie ein neues Passwort für ${email} fest.`:'Geben Sie die E-Mail-Adresse Ihres Verwaltungsbenutzers an. Wir senden Ihnen einen neuen Link.'}</p><form className="inquiry-form" onSubmit={async e=>{
    e.preventDefault();if(busy)return;const db=client();if(!db)return;
    const form=e.currentTarget,data=new FormData(form);setMessage('');
    if(ready){const password=String(data.get('password')??'');if(password.length<12){setMessage('Verwenden Sie mindestens 12 Zeichen.');return;}if(password!==data.get('confirm')){setMessage('Die Passwörter stimmen nicht überein.');return;}
      setBusy(true);try{const {error}=await db.auth.updateUser({password});if(error){setMessage(error.code==='same_password'?'Bitte ein anderes Passwort als bisher verwenden.':'Das Passwort konnte nicht geändert werden. Fordern Sie einen neuen Link an oder versuchen Sie es erneut.');return;}await db.auth.signOut();form.reset();setDone(true);}catch{setMessage('Die Verbindung ist fehlgeschlagen. Bitte versuchen Sie es erneut.');}finally{setBusy(false);}
    }else{setBusy(true);try{const {error}=await db.auth.resetPasswordForEmail(String(data.get('email')??'').trim(),{redirectTo:window.location.origin+'/verwaltung/passwort'});setMessage(error?'Der Link konnte gerade nicht angefordert werden. Bitte warten Sie kurz und versuchen Sie es erneut.':'Wenn ein Konto mit dieser Adresse besteht, erhalten Sie eine E-Mail. Öffnen Sie den neuesten Link im selben Browser.');}catch{setMessage('Die Verbindung ist fehlgeschlagen. Bitte versuchen Sie es erneut.');}finally{setBusy(false);}}
  }}>
    {ready?<><label>Neues Passwort<input name="password" type="password" autoComplete="new-password" minLength={12} required disabled={busy}/></label><label>Neues Passwort wiederholen<input name="confirm" type="password" autoComplete="new-password" minLength={12} required disabled={busy}/></label></>:<label>E-Mail-Adresse<input name="email" type="email" autoComplete="email" defaultValue="info@linnarz-immobilien.de" required disabled={busy}/></label>}
    <button className="button" disabled={busy} aria-busy={busy}>{busy?'Bitte warten …':ready?'Neues Passwort speichern':'Reset-Link anfordern'}</button><p className="full-width" role="status" aria-live="polite">{message}</p>
  </form><p><Link className="text-link" href="/verwaltung/anmelden">← Zur Anmeldung</Link></p></>;
}
