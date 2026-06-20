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
- **Backup** als `.json`-Download und **Wiederherstellen** per Datei-Import (Merge ohne Duplikate)
- **CSV-Export** für den Arzt
- Defensive Speicherung: Warnungen statt stiller Datenverluste; bei beschädigten Daten
  wird automatisch eine Roh-Sicherungskopie behalten.

## Daten & Datenschutz

Alle Einträge werden ausschließlich lokal im Browser gespeichert. Es werden keine
Daten an Server gesendet. Für eine Sicherung bitte regelmäßig **„Sichern“** nutzen –
gelöschte Browser-Daten löschen auch die Einträge.
