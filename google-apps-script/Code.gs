/**
 * Guestbook + RSVP backend: a Google Apps Script web app writing to one Google Sheet.
 *
 * Setup:
 *  1. Create a Google Sheet. Note its ID from the URL.
 *  2. Extensions > Apps Script. Paste this file. Set SHEET_ID below.
 *  3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *  4. Copy the Web app URL into VITE_APPS_SCRIPT_URL (GitHub Secrets for Actions).
 *
 * Protocol (CORS-safe for static sites): the client sends POST with
 * Content-Type text/plain and a JSON body, so the browser skips preflight.
 * Responses are JSON. GET ?action=list returns the public guestbook entries.
 *
 * Sheets: "guestbook" (id, ts, name, message, pwHash, deleted), "rsvp" (ts, side, name, attending, count, meal, note)
 */
var SHEET_ID = 'PASTE_SHEET_ID';
var MAX_NAME = 20;
var MAX_MESSAGE = 300;
var LIST_LIMIT = 100;
var GUESTBOOK_HEADER = ['id', 'ts', 'name', 'message', 'pwHash', 'deleted'];

function sheet_(name, header) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sha256_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

// Only multi-line fields (guestbook message, RSVP note) keep newlines, other control characters become spaces
function clean_(s, max, multiline) {
  var control = multiline ? /[\u0000-\u0009\u000b-\u001f]/g : /[\u0000-\u001f]/g;
  return String(s || '').replace(control, ' ').trim().slice(0, max);
}

// A leading apostrophe stops Sheets from parsing a value that starts with = + - @ as a formula
function cell_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'list') return json_({ ok: true, entries: listGuestbook_() });
  return json_({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (body.action) {
      case 'guestbook.add': return json_(addGuestbook_(body));
      case 'guestbook.delete': return json_(deleteGuestbook_(body));
      case 'rsvp.add': return json_(addRsvp_(body));
      default: return json_({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function listGuestbook_() {
  var sh = sheet_('guestbook', GUESTBOOK_HEADER);
  var rows = sh.getDataRange().getValues().slice(1);
  var out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < LIST_LIMIT; i--) {
    var r = rows[i];
    if (r[5] === true || r[5] === 'TRUE') continue;
    out.push({ id: String(r[0]), ts: new Date(r[1]).toISOString(), name: r[2], message: r[3] });
  }
  return out;
}

function addGuestbook_(b) {
  var name = clean_(b.name, MAX_NAME);
  var message = clean_(b.message, MAX_MESSAGE, true);
  var password = String(b.password || '');
  if (!name || !message) return { ok: false, error: '이름과 메시지를 입력해 주세요.' };
  if (password.length < 4) return { ok: false, error: '비밀번호는 4자 이상이어야 합니다.' };
  var sh = sheet_('guestbook', GUESTBOOK_HEADER);
  var id = Utilities.getUuid();
  sh.appendRow([id, new Date(), cell_(name), cell_(message), sha256_(password), false]);
  return { ok: true, entry: { id: id, ts: new Date().toISOString(), name: name, message: message } };
}

function deleteGuestbook_(b) {
  var sh = sheet_('guestbook', GUESTBOOK_HEADER);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(b.id)) {
      if (data[i][4] !== sha256_(String(b.password || ''))) return { ok: false, error: '비밀번호가 일치하지 않습니다.' };
      sh.getRange(i + 1, 6).setValue(true);
      return { ok: true };
    }
  }
  return { ok: false, error: '항목을 찾을 수 없습니다.' };
}

function addRsvp_(b) {
  var side = b.side === 'bride' ? 'bride' : 'groom';
  var name = clean_(b.name, MAX_NAME);
  var attending = b.attending === true || b.attending === 'yes';
  var count = Math.max(0, Math.min(10, parseInt(b.count, 10) || 0));
  var meal = b.meal === 'yes' ? 'yes' : b.meal === 'no' ? 'no' : '';
  var note = clean_(b.note, MAX_MESSAGE, true);
  if (!name) return { ok: false, error: '성함을 입력해 주세요.' };
  var sh = sheet_('rsvp', ['ts', 'side', 'name', 'attending', 'count', 'meal', 'note']);
  sh.appendRow([new Date(), side, cell_(name), attending, count, meal, cell_(note)]);
  return { ok: true };
}
