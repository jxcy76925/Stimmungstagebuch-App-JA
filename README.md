# 🌿 Stimmungstagebuch

Ein privates Stimmungs- und Symptomtagebuch als **einzelne HTML-Datei** – ganz ohne
Build-Tools, Server oder Tracking. Alle Daten bleiben lokal im Browser (`localStorage`).

Gedacht zur Verlaufsdokumentation für die psychiatrische Behandlung
(Bipolar-/ADHS-/BPS-Kontext, inkl. Medikation Elvanse & Lamotrigin).

## Nutzung

- **Lokal:** Datei `index.html` direkt in **Google Chrome** öffnen (Doppelklick).
- **Online:** Über **GitHub Pages** ausliefern (Repo → *Settings → Pages → Branch* wählen)
  und die Seite im Browser aufrufen.

> Wichtig: Damit dauerhaft gespeichert wird, muss die Datei direkt im Browser laufen
> (`file://` oder GitHub Pages) – nicht in einer eingebetteten Vorschau.

## Zwei Eintragstypen

| Typ | Wofür | Inhalt |
|-----|-------|--------|
| **⚡ Check-In** | Momentaufnahme, mehrfach täglich | Stimmung · 15 klinische Skalen · Notiz |
| **📋 Tagesdaten** | Tageszusammenfassung | Nacht-/Mittagsschlaf · Elvanse (+ Uhrzeit) · Lamotrigin · Verhaltens-/Alltagsskalen · äußere Umstände · Notiz |

## Funktionen

- Stimmungsauswahl (7 Stufen) und 15 klinische Skalen (je 1–5)
- Verhaltens-/Alltagsskalen, äußere Umstände (Tags), Medikamenten- und Schlaferfassung
- **Verlauf** mit Diagramm und Einzeleinträgen
- **Statistik** (Durchschnitte, Schwankungen, häufige Tags)
- **Sichern**: manueller `.json`-Export des kompletten lokalen Standes
- **Laden**: manueller Import per Dateiauswahl – unterstützt **JSON** (App-Backup) **und CSV**
  (z. B. aus Google Sheets exportiert). Rein lokal, ergänzt/­stellt Einträge wieder her.
  Enthält die Datei lokal gelöschte oder geänderte Einträge (gleiche Eintrags-ID), fragt
  die App nach, ob sie **wiederhergestellt** bzw. **mit den Werten aus der Datei aktualisiert**
  werden sollen. Es wird nie nach Google Sheets zurückgeschrieben.
- **CSV-Export** für den Arzt
- **Google Sheets (optional, append-only):** jeder neue Eintrag wird zusätzlich als eine
  Zeile an ein Google Sheet angehängt – siehe unten.
- Defensive Speicherung: `navigator.storage.persist()` gegen automatisches Löschen;
  Warnungen statt stiller Datenverluste; bei beschädigten Daten wird automatisch eine
  Roh-Sicherungskopie behalten.

## Speicher-Architektur

- **Primär:** lokal im Browser (`localStorage`). Verlauf, Statistik und Graphen rechnen
  immer auf diesen lokalen Daten.
- **Manuell:** `Sichern` (JSON-Datei) / `Laden` (JSON **oder** CSV). Sicherung und
  Wiederherstellung passieren ausschließlich, wenn du sie bewusst auslöst.
- **Google Sheets** ist ein reines **append-only-Protokoll** der abgeschickten Einträge –
  *nicht* die Primärquelle, *kein* Rück-Sync, *kein* automatischer Restore.

### Google Sheets anbinden (append-only)

Eine statische Web-App kann nicht direkt in Sheets schreiben – der saubere, sichere Weg
ist ein winziges **Google Apps Script** als Web-App-Endpoint. Code & Anleitung:
[`apps-script/Code.gs`](apps-script/Code.gs).

1. Neues, leeres **Google Sheet** anlegen → *Erweiterungen → Apps Script*.
2. Inhalt von `apps-script/Code.gs` einfügen, speichern.
3. *Bereitstellen → Neue Bereitstellung → Web-App*, **Ausführen als: Ich**,
   **Zugriff: Jeder**. URL (endet auf `/exec`) kopieren.
4. In der App **„Google Sheets verbinden"** tippen und die URL einfügen.

Danach erzeugt **jeder Klick auf „Eintrag speichern" genau eine neue Zeile** im passenden
Blatt (`Check-In` bzw. `Tagesdaten`, deutsche Spaltenüberschriften werden automatisch
angelegt). Schlägt eine Sendung fehl, bleibt der Eintrag in einer lokalen **Outbox** und
wird später erneut angehängt. Bestehende Sheet-Zeilen werden **nie** gelesen-um-zu-ändern,
geändert oder gelöscht – auch lokales Löschen wirkt sich nicht auf Sheets aus.

## Daten & Datenschutz

Einträge werden lokal im Browser gespeichert. Ohne konfigurierte Google-Sheets-URL werden
**keine** Daten an einen Server gesendet. Mit verbundenem Sheet wird jeder neue Eintrag
zusätzlich an dein eigenes Google Sheet angehängt. Für eine Sicherung regelmäßig
**„Sichern"** nutzen – gelöschte Browser-Daten löschen auch die lokalen Einträge.
