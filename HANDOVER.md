# Handover – Stimmungstagebuch

Vollständiger Kontext für eine neue Sitzung. Quelle der Wahrheit ist immer der Code
(`index.html`, `apps-script/Code.gs`); dieses Dokument fasst Architektur, Stand,
Entscheidungen und offene Aufgaben zusammen.

> Datenschutz-Hinweis für Bearbeiter: In dieses Repo gehören **keine** persönlichen
> Gesundheitsdaten der Nutzerin. Echte Einträge liegen nur im Browser (localStorage)
> bzw. im privaten Google Sheet der Nutzerin. Das Repo kann über GitHub Pages öffentlich
> sein – also nichts Persönliches committen.

---

## 1. Was ist das
- Stimmungs-/Symptom-Tagebuch als **einzelne HTML-Datei** (CSS+JS inline, keine Build-Tools),
  Deutsch, mobil-first. Läuft lokal in Chrome (`file://`) und als statische GitHub-Pages-Seite.
- Zweck: **längsschnittliche Selbstbeobachtung** als Datengrundlage für die psychiatrische
  Behandlung. Die App **diagnostiziert nicht** – sie liefert Daten/Verläufe.
- Inhaltlicher Fokus: transdiagnostisches Tracking, das u. a. die gemeinsam betrachteten
  Differenziale **Bipolar II (inkl. gemischte Zustände), ADHS im Erwachsenenalter
  (insb. bei Frauen), Borderline** unterstützt. Begleit-Themen: Angst, Depression.

## 2. Repo, Branch, Deploy
- Repo: **`jxcy76925/Stimmungstagebuch-App-JA`** (Owner `jxcy76925`).
- Kanonischer Branch: **`main`**. (Es existiert remote noch `claude/jolly-curie-2xye7y`,
  identischer Stand, redundant – die Git-Proxy-Umgebung erlaubt kein Branch-Löschen.)
- Dateien:
  - `index.html` – die App (alles inline).
  - `apps-script/Code.gs` – Google-Apps-Script-Endpunkt (append-only).
  - `README.md`, `HANDOVER.md`.
- GitHub Pages: Source `main` / Ordner `/ (root)` →
  `https://jxcy76925.github.io/Stimmungstagebuch-App-JA/`
- Git-Konventionen: Author/Committer **`Claude <noreply@anthropic.com>`**
  (`git config user.email noreply@anthropic.com && user.name Claude`).
  Commit+Push nach `main` **nur wenn die Nutzerin es sagt**. Push via `git` (Proxy) funktioniert;
  `gh` CLI nicht verfügbar; GitHub-MCP-Schreibzugriff war in manchen Sessions 403.

## 3. Architektur / Datenfluss
- **Local-first:** `localStorage` ist die führende Datenquelle. Verlauf/Statistik werden
  lokal berechnet.
- **Google Sheets = optionales, strikt append-only Journal**, Datenfluss **nur in eine
  Richtung** (App → Sheet). Kein Zurücklesen, kein Sync, kein Update/Delete im Sheet.
- Single-File, keine Abhängigkeiten, kein Backend.

## 4. Datenmodell
- `entries` = Array in `localStorage['pdiary_v5']`.
- Zwei Eintragstypen:
  - **checkin:** `{id,date,time,type:'checkin',mood,trigger,cv:{<clinId>:1..5},note}`
  - **tagesdaten:** `{id,date,time,type:'tagesdaten',nightSleep,napSleep,elv,elvTime,lamo,bv:{<behavId>:1..5},tags:[...],note}`
- Tombstones: gelöschte IDs in `localStorage['pdiary_v5_deleted']` (verhindert „Wiederauferstehung" beim Merge).
- Weitere Keys: `pdiary_v5_sheets_url`, `pdiary_v5_sheets_outbox`, `pdiary_v5_lastbackup`,
  `pdiary_v5_corrupt_<ts>` (Roh-Sicherung, falls gespeichertes JSON nicht lesbar ist – wird
  NICHT überschrieben).
- Legacy-Migration in `migrateEntry()`: alter `type 'quick'→'checkin'`, `'full'→'tagesdaten'`;
  Feld `trigger` wird mitgenommen.

## 5. Inhalt (aktueller Stand)
- **MOODS:** 7-stufige Gesamtstimmung (nur Check-In).
- **CLIN – 20 Check-In-Skalen (1–5), gruppiert über Property `dom`:**
  - *Antrieb & Aktivierung:* `episode`, `activation`, `energy`
  - *Denken & Fokus:* `racing`, `concent`, `hyperfocus`
  - *Angst & Wahrnehmung:* `anxiety`, `dereali`
  - *Belastung & Sicherheit:* `leidensdruck`, `hopeless`, `empty`, `harm`
  - *Selbst & Stabilität:* `selfimg`, `selfeff`, `illness`, `ident`
  - *Impuls & Risiko:* `impuls`, `risk`
  - *Bezug & Bindung:* `social`, `past`
  - `harm` (Selbstgefährdung): blendet bei Stufe **4–5** die Krisen-Nummern inline ein
    (`#crisis-note`, gesteuert von `updateCrisisNote()`).
- **TRIGGERS** (Check-In, Einzelauswahl, Feld `trigger`): „Kam von selbst" /
  „Zwischenmenschlich ausgelöst" / „Anderes Ereignis" (trennt reaktiv vs. autonom).
- **BEHAV – 6 Tagesdaten-Skalen (1–5), gruppiert:**
  - *Schlaf & Erholung:* `sleepneed`
  - *Verhalten & Alltag:* `eating`, `spending`, `screen`, `haushalt`, `selfcare`
- Tagesdaten-Felder zusätzlich: `nightSleep`, `napSleep`, `elv` (ELVANSE), `elvTime`,
  `lamo` (LAMOTRIGIN), `tags` (TAGS).
- **Früher entfernt:** `rsd` (Ablehnungsempfindlichkeit – bewusst draußen), alte klinische
  `sleep`-Skala, `melancholy` (Melancholie/Nostalgie).
- **STAT_HINTS:** kurze, sachliche Lese-Hinweise pro Skala in der Statistik (verboten:
  „je höher desto besser/schlechter", „günstig", „Ressource").
- Exakte Stufen-Texte (`ds`) und Tooltips (`tp`) stehen in den Arrays in `index.html`.

## 6. Code-Map (`index.html`)
- Daten-Defs: `MOODS, CLIN, BEHAV, TRIGGERS, TAGS, ELVANSE, LAMOTRIGIN, CHART_LINES`.
- Persistenz: `load()`, `persistLocal()`, `save()`, `migrateEntry()`, `storageAvailable()`
  (korrupt-sicher; kein stilles Überschreiben).
- UI-Builder: `buildMoods`, `buildScales` (mit Domänen-Überschriften via `s.dom`),
  `setScale`/`paintScale`, `buildTags`, `buildChoice`, `buildElv`/`buildLamo`/`buildTriggers`,
  `updateCrisisNote`.
- Modus/Reset: `setMode` (checkin/tagesdaten), `resetState`, `rebuildInputs`.
- Speichern: `saveEntry()` → `save()` + `sheetsAppend(e)` (Sheets nur bei NEUEM Eintrag).
- Tabs/Verlauf/Statistik: `goTab`, `renderVerlauf`, `entryCard`, `drawChart`, `delEntry`,
  `STAT_HINTS`, `renderStats`.
- Backup/Restore: `backupData` (JSON-Download), `restoreData` (JSON **+** CSV, mit Rückfragen),
  `mergeData(incoming, incomingDeleted, opts)`, `canon()`.
- CSV: `parseCSV`, `csvToEntries`; `doExport` (kombinierte Arzt-CSV).
- Google Sheets: `CHECKIN_COLS`, `TAGESDATEN_COLS`, `sheetRowFor`, `sheetsSend`,
  `outbox*`, `sheetsAppend`, `flushOutbox`, `sheetsStatus`, `renderSheetsUI`,
  `connectSheets`, `disconnectSheets`.
- `requestPersistence` (storage.persist). `window.onload` init; `window 'online'` → `flushOutbox`.

## 7. Google Sheets (Details)
- Endpunkt = Google Apps Script Web-App (`apps-script/Code.gs`). Bereitstellen:
  **Ausführen als: Ich**, **Zugriff: Jeder**; URL endet auf `/exec`; in der App über
  „Google Sheets verbinden" setzen (gespeichert in `pdiary_v5_sheets_url`).
- `doPost`: **append-only**; liest die vorhandene Kopfzeile, ergänzt **fehlende Spalten
  nur hinten** (löscht/sortiert nie), schreibt die Zeile **nach Spaltenname** (Reihenfolge
  egal). `LockService` gegen parallele Schreibzugriffe.
- ⚠️ **Wichtig:** Da Skalen umsortiert und neue Spalten ergänzt wurden, MUSS die
  „nach Spaltenname"-Version von `Code.gs` deployed sein. Aktualisieren = Code ersetzen →
  *Bereitstellen → Bereitstellungen verwalten → ✏️ → Neue Version* (URL bleibt gleich).
  Die alte „positionsbasierte" Version würde neue Zeilen verschoben schreiben.
- CORS: Client POSTet `Content-Type: text/plain` (simple request, kein Preflight) und liest
  die JSON-Antwort.
- Zwei Blätter: `Check-In`, `Tagesdaten` (deutsche `nm`-Spaltenüberschriften; werden
  automatisch angelegt/ergänzt).
- **Outbox:** fehlgeschlagene Sendungen liegen lokal in der Queue und werden erneut
  versucht (beim Speichern-Erfolg, beim Start, bei `online`, per „Erneut senden").

## 8. Import / Restore (rein lokal, schreibt NIE nach Sheets)
- `restoreData` erkennt JSON vs CSV automatisch.
- `mergeData` vereinigt per ID; Tombstones blocken im Normalmodus.
- Manueller Import fragt **nur wenn relevant**:
  - `allowRestoreDeleted` – wenn die Datei lokal gelöschte IDs enthält („wiederherstellen?").
  - `updateExisting` – wenn ein vorhandener Eintrag von der Datei **abweicht** (via `canon()`):
    „mit den Werten aus der Datei aktualisieren?" → ersetzt lokal.
- CSV-Import mappt nach deutschen Spaltennamen (inkl. Aliasen für die Arzt-Export-Header);
  Spalte `Typ` entscheidet checkin/tagesdaten; `Eintrags-ID` wird übernommen oder neu erzeugt.

## 9. Testen (kein Test-Framework im Repo)
- `node --check` für JS-Syntax (Script aus `index.html` extrahieren).
- `node` + `vm` für Daten-Assertions (Arrays, `sheetRowFor`-Ausrichtung etc.) – `window`-Stub
  braucht `addEventListener: ()=>{}`.
- **Playwright/Chromium** (global installiert; `export NODE_PATH=$(npm root -g)`) für echte
  DOM-/Klick-Tests, Sheets via gemocktem `window.fetch`, Screenshots. `file://` funktioniert.
- Immer prüfen: 0 `pageerror`/console-Fehler.

## 10. Backlog (vereinbart, NOCH NICHT gebaut – von der Nutzerin bewusst aufgeschoben)
1. **App-Teilung in zwei Apps:**
   - *App 1 „Fragebogen"* (= `index.html`): **nur Eingabe → Sheets**. Entfernen: Verlauf,
     Statistik, Diagramm, „Laden"/Import, CSV-Export, Merge-/Tombstone-Logik. Behalten:
     localStorage + Outbox (Versand-Sicherheit), append-only. Offene Entscheidungen:
     „Sichern" raus/drin; lokaler Voll-Mirror vs. nur Outbox.
   - *App 2 „Auswertung"* (`auswertung.html`, gleiches Layout): **read-only aus Sheets**,
     Verlauf/Statistik + später Korrelationen/diagnostische Auswertung. Liest per
     Apps-Script-`doGet` (JSON) oder CSV. Schreibt nie zurück. **Diagnose-Zuordnung gehört
     hierher** (ein Symptom kann auf mehrere Diagnose-Indikatoren einzahlen).
2. **Rückblick-Profile:** Jahres-/Phasen-Durchschnitte rückwirkend (ca. ab Lebensjahr 12/13),
   z. B. um Behandlungs-/Medikationsverlauf gegen eine Vor-Behandlungs-Baseline zu prüfen.
   Eigener „Rückblick"-Datentyp, getrennt von Live-Einträgen. App-2-Thema.
3. **Persönliche Richtwerte/Anker (Kalibrierung):** Voll-Profile für „tiefste Depression",
   „stärkste Hypomanie", optional „stabiler Normalzustand". Nutzung in App 2: Referenzbänder
   im Verlauf, pro Skala Tief/Spitze, „Abstand zu Tief/Spitze"-Index. Am besten aus einem
   ruhigen/stabilen Zustand erfassen (weniger Recall-Bias) oder echte Einträge markieren.
4. Optionaler **Kompakt-/Kern-Modus** (~6–8 Kern-Items) für schnelle Check-ins (aktuell 20
   Skalen, alle freiwillig).

## 11. Design / UX-Prinzipien
- Ästhetik: **clean, soft, „girly", pastell, ruhig, flowy, aber zweckmäßig.** Aktuell:
  Header-Verlauf Mint→Lavendel→Rosé, Lavendel-Basis, grün/rosé Akzente, zarte Schatten,
  runde Pills. **Nicht „verschlimmbessern".**
- **Sichtbares deutsches Wording exakt erhalten** (Skalennamen, Sheet-Spaltenüberschriften =
  `nm`-Bezeichnungen, nicht die internen `id`s). **Keine Diagnose-Etiketten** auf dem
  Eingabeformular – stattdessen neutrale Domänen-Überschriften.
- Mobile-first, große Tap-Flächen, Single-File, läuft `file://` und GitHub Pages.

## 12. Arbeits-Absprachen / Präferenzen der Nutzerin
- Nutzerin ist **keine Entwicklerin** → bei Bedarf sehr kleinschrittig und konkret erklären
  (z. B. Apps-Script-Deploy Schritt für Schritt).
- **Nur Gewünschtes ändern.** Additive Skalen-Änderungen sind ok (integrieren sich automatisch).
  **Keine Architektur-Umbauten ohne ausdrückliche Freigabe.** Vor großen/destruktiven Schritten
  rückfragen.
- **Append-only Richtung Sheets ist heilig.** Keine bidirektionale Synchronisation.
- Commit+Push nach `main` nur auf Ansage.

## 13. Care / Sicherheit
- Die App enthält eine **Selbstgefährdungs-Skala**; bei Stufe 4–5 werden deutsche
  Krisen-Nummern eingeblendet (Telefonseelsorge 0800 111 0 111 / 0800 111 0 222, 116 117, 112).
- Eine neue Sitzung sollte einen **unterstützenden, wertschätzenden** Ton halten und bei
  belastenden Schilderungen behutsam zu **zeitnahem Fachkontakt** ermutigen – ohne die
  fachliche/technische Arbeit zu verweigern.

## 14. Verlauf (grobe Historie)
- v10-Refactor (saubere Trennung Check-In/Tagesdaten) → Datei-Auto-Backup (später wieder
  entfernt) → Google-Sheets append-only + Outbox → Import-Restore + Update-on-Load →
  Skalen `ident`/`risk` → Chart-Neugewichtung + Statistik-Hinweise → diese Inhalts-/UX-Runde
  (Bipolar-II-Fokus: `activation`/`hyperfocus`/`empty`/`harm`/`trigger`/`sleepneed`,
  Domänen, Melancholie raus, Soft-Design).
