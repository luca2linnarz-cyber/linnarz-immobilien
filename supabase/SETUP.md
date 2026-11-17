# Immobilienverwaltung: Einrichtung und Abnahme

## Projekt verbinden

Ein separates Supabase-Projekt in Frankfurt verwenden, Data API aktivieren, automatische Tabellenfreigabe deaktivieren und automatische RLS aktivieren. Keine echten Eigentümer- oder Interessentendaten für die Einrichtung verwenden.

Die Migration in `migrations/20261117162839_property_catalog.sql` ist vorbereitet. Erst im vorgesehenen Supabase-Projekt anwenden. Anschließend die Supabase-Sicherheitsberater ausführen und die Zugriffstests gegen das echte Projekt wiederholen.

In Vercel (Preview und später Production) setzen:

- `NEXT_PUBLIC_SUPABASE_URL`: Projekt-URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Publishable Key, niemals Secret oder service_role

Es wird kein service_role-Schlüssel benötigt.

## Administrator freischalten

Öffentliche Registrierung und anonyme Anmeldung in Supabase Auth deaktivieren. Für Luca ein bestätigtes Auth-Konto anlegen bzw. einladen. Nur die UUID dieses Kontos wird über eine privilegierte Verwaltungsverbindung in `public.catalog_admins(user_id)` eingetragen. Kein Besucher und kein normal angemeldeter Nutzer darf diese Tabelle verändern. Zugangspasswort nur im Supabase-Dashboard eingeben, niemals im Chat oder Repository.

Die Anmeldung liegt unter `/verwaltung/anmelden`. RLS und eine zusätzliche serverseitige Adminprüfung schützen Entwürfe, Uploads und Bearbeitungen. Zugang nur mit gültigem Supabase-Konto UND Adminmitgliedschaft. Die Cookie-Erneuerung erfolgt im Next-Proxy. Keine Cookies, Tokens oder Kundendaten in Logs schreiben.

## Daten und Medien

- Entwürfe sind privat. Die Veröffentlichung ist eine separate Checkbox.
- Genaue Straßenadressen und interne Notizen werden nicht öffentlich erfasst.
- Der Storage-Bucket ist privat. Bilder aus Entwürfen sind ausschließlich für Admins lesbar.
- Öffentliche Bilder werden nur für ausgewählte Medien veröffentlichter Angebote signiert (5 Minuten). Bereits erstellte Links bleiben bis zu ihrem Ablauf gültig, auch nach Rücknahme einer Veröffentlichung. Admin-Vorschauen gelten 30 Minuten.
- JPG, PNG und WebP werden vor dem Upload verkleinert und serverseitig als WebP ohne EXIF neu kodiert. SVG/PDF-Uploads sind nicht vorgesehen; Grundrisse als Bild hochladen.
- Entfernen nimmt Bilder beim Speichern aus dem Angebot; Originaldateien bleiben privat im Speicher erhalten. Physische Löschung/regelmäßige Bereinigung ist noch nicht enthalten.
- Nach Upload, Umordnen und Entfernen explizit speichern. Nach Uploadfehlern können nicht zugeordnete private Bilder zurückbleiben.
- Speichern verwendet einen Versionsvergleich und meldet konkurrierende Änderungen, statt sie still zu überschreiben.

## Noch erforderliche Abnahme am verbundenen Projekt

1. Anonyme und fremde angemeldete Nutzer können keine Entwürfe oder Entwurfsbilder lesen und nichts bearbeiten.
2. Admin anmelden, Entwurf anlegen, fünf Testbilder und einen Grundriss hochladen, Reihenfolge speichern, Vorschau prüfen.
3. Als Testangebot veröffentlichen; auf Start-, Übersichts- und Detailseite prüfen. Änderung speichern und erneut laden.
4. Veröffentlichung zurücknehmen und öffentliches Angebot sowie Bildzugriff nach Ablauf vorheriger Links prüfen.
5. Objektbezogene Testanfrage senden und Objektnummer/Titel sowie Reply-To im Postfach prüfen.
6. Session erneuern, abmelden, direkte Bearbeitungs-/Uploadaufrufe ohne Sitzung abweisen.
7. Datenschutzhinweise vor Aktivierung um Supabase Auth und Bildauslieferung ergänzen; DPA und Region prüfen.

Bereits lokal geprüft: Produktionsbuild, Typprüfung, Feldvalidierung, RLS-Migration in einer isolierten PostgreSQL-Testumgebung, Galerie-Vollbild und objektbezogenes Kontaktformular. Gehostete Anmeldung, Storage und endgültige Datenbankabnahme bleiben ohne Projektzugriff offen.
