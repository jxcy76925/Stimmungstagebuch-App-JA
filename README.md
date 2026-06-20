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
- **Automatische Datei-Sicherung** (Chrome/Edge Desktop & Chromebook): einmal eine
  `.json`-Datei wählen – danach wird jeder Eintrag automatisch dort gespeichert.
  Datei in einen Google-Drive-/Dropbox-Ordner legen → übersteht Cache-Löschung und
  Gerätewechsel. Beim Verbinden werden vorhandene Einträge duplikatfrei zusammengeführt.
- **Backup** als `.json`-Download und **Wiederherstellen** per Datei-Import (Merge ohne Duplikate)
- **CSV-Export** für den Arzt
- Defensive Speicherung: `navigator.storage.persist()` gegen automatisches Löschen;
  Warnungen statt stiller Datenverluste; bei beschädigten Daten wird automatisch eine
  Roh-Sicherungskopie behalten.

### Dauerhafte Speicherung – Empfehlung

Die Daten liegen primär im `localStorage` des Browsers (gebunden an **eine** Adresse/Origin).
Für eine zuverlässige Langzeit-Sammlung daher:

1. Immer dieselbe **GitHub-Pages-URL (https)** nutzen (stabiler, sicherer Kontext) – nicht
   mal `file://` und mal `https://`, da das getrennte Speicher sind.
2. Einmal **„Auto-Sicherung einrichten"** und die Zieldatei in einen synchronisierten
   Cloud-Ordner (z. B. Google Drive) legen. Damit ist jeder Eintrag automatisch redundant
   auf der Festplatte und – über die Cloud-Synchronisierung – auch auf anderen Geräten.

> Hinweis: Die geräteübergreifende Zusammenführung vereinigt Einträge (per ID); gelöschte
> Einträge werden bewusst nicht über Geräte hinweg entfernt, um Datenverlust zu vermeiden.

## Daten & Datenschutz

Alle Einträge werden ausschließlich lokal im Browser gespeichert. Es werden keine
Daten an Server gesendet. Für eine Sicherung bitte regelmäßig **„Sichern“** nutzen –
gelöschte Browser-Daten löschen auch die Einträge.
