/**
 * Stimmungstagebuch – Google Apps Script Web-App (APPEND-ONLY)
 * ===========================================================
 *
 * Dieses Script ist das Bindeglied zwischen der statischen Web-App und Google Sheets.
 * Die App sendet bei jedem "Eintrag speichern" per HTTP-POST eine Zeile; dieses Script
 * hängt sie an das passende Blatt an.
 *
 * SICHERHEITSREGEL (bewusst so gebaut):
 *   - Es wird AUSSCHLIESSLICH angehängt (appendRow).
 *   - Es werden NIEMALS bestehende Zeilen gelesen-um-zu-ändern, geändert oder gelöscht.
 *   - Kein Update, kein Delete, kein Upsert, kein Abgleich mit vorhandenem Inhalt.
 *   - Dieselbe ID darf mehrfach ankommen und wird trotzdem erneut angehängt.
 *
 * EINRICHTUNG
 *   1. Lege in deinem Google-Konto ein neues, leeres Google Sheet an.
 *   2. Erweiterungen -> Apps Script. Den vorhandenen Code durch diesen ersetzen, speichern.
 *   3. Bereitstellen -> Neue Bereitstellung -> Typ "Web-App".
 *        - Ausführen als: Ich
 *        - Zugriff: Jeder (auch anonym)  [nötig, damit die Browser-App posten darf]
 *   4. Bereitstellen, Zugriff autorisieren, die Web-App-URL (endet auf /exec) kopieren.
 *   5. In der App "Google Sheets verbinden" tippen und die URL einfügen.
 *
 * Die beiden Blätter "Check-In" und "Tagesdaten" inkl. deutscher Spaltenüberschriften
 * werden beim ersten Eintrag automatisch angelegt (Überschriften kommen aus der App).
 * Kommen später NEUE Spalten dazu (z.B. neue klinische Skala), werden sie HINTEN an die
 * Kopfzeile ergänzt; bestehende Spalten, Reihenfolge und Datenzeilen bleiben unverändert.
 * Die Werte werden nach Spaltenname zugeordnet, damit nie etwas verrutscht.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheet;                 // "Check-In" oder "Tagesdaten"
    var headers   = data.headers || [];
    var values    = data.values  || [];

    if (sheetName !== 'Check-In' && sheetName !== 'Tagesdaten') {
      return json({ ok: false, error: 'unbekanntes Blatt: ' + sheetName });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Schreibzugriffe gegen gleichzeitige Sendungen serialisieren.
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var sh = ss.getSheetByName(sheetName);
      if (!sh) { sh = ss.insertSheet(sheetName); }

      // Eingehende Header -> Wert (nach Spaltenname).
      var incoming = {};
      for (var i = 0; i < headers.length; i++) {
        incoming[String(headers[i])] = (i < values.length) ? values[i] : '';
      }

      // Bestehende Kopfzeile lesen (bestehende Spalten/Reihenfolge bleiben unangetastet).
      var lastCol = sh.getLastColumn();
      var existing = (sh.getLastRow() === 0 || lastCol === 0)
        ? []
        : sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h){ return String(h); });

      if (existing.length === 0) {
        // Neues/leeres Blatt: Kopfzeile aus den eingehenden Headern anlegen.
        sh.appendRow(headers);
        existing = headers.map(function(h){ return String(h); });
      } else {
        // Fehlende Spalten NUR HINTEN ergänzen – nichts löschen, nichts umsortieren.
        var toAdd = [];
        for (var j = 0; j < headers.length; j++) {
          if (existing.indexOf(String(headers[j])) === -1) toAdd.push(String(headers[j]));
        }
        if (toAdd.length) {
          sh.getRange(1, existing.length + 1, 1, toAdd.length).setValues([toAdd]);
          existing = existing.concat(toAdd);
        }
      }

      // Zeile in der REIHENFOLGE der vorhandenen Kopfzeile bauen (Zuordnung nach Spaltenname,
      // damit nie etwas verrutscht). Unbekannte/fehlende Felder bleiben leer.
      var out = [];
      for (var c = 0; c < existing.length; c++) {
        var name = existing[c];
        out.push(incoming.hasOwnProperty(name) ? incoming[name] : '');
      }
      sh.appendRow(out);                        // <-- der einzige Daten-Schreibvorgang: nur ANHÄNGEN
      var row = sh.getLastRow();
    } finally {
      lock.releaseLock();
    }

    return json({ ok: true, sheet: sheetName, row: row });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Kleiner Health-Check im Browser aufrufbar.
function doGet() {
  return json({ ok: true, status: 'Stimmungstagebuch endpoint bereit (append-only)' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
