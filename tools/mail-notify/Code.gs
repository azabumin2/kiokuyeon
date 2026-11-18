/**
 * kiokuyeon — e-mail staff when a member sends an inquiry, consultation booking or report.
 *
 * Runs in Google Apps Script under the Firebase project owner's Google account (no Blaze plan needed).
 * A time trigger calls checkNewInquiries() every minute. It reads Firestore with the owner's own
 * permission (security rules don't apply to the owner), so nothing on the public site changes.
 *
 * Recipients = the script owner + the "email" field of each Firestore /admins document,
 * plus any addresses in the script property EXTRA_RECIPIENTS (comma separated).
 *
 * Setup: run setup() once from the editor and approve the permissions. See README.md.
 */

const PROJECT_ID = 'kiokuyeon';
const ADMIN_URL = 'https://kiokuyeon.com/admin.html';
const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents';
const KINDS = { question: '1対1のお問い合わせ', booking: '相談の予約', report: '通報（不適切な連絡など）' };
const GENDERS = { female: '女性', male: '男性' };
const METHODS = { visit: '来店', phone: '電話', video: 'ビデオ通話' };
const MAX_PER_RUN = 50;

/** Run once: creates the 1-minute trigger and starts from "now" (older inquiries are not mailed). */
function setup() {
  ScriptApp.getProjectTriggers()
    .filter((tr) => tr.getHandlerFunction() === 'checkNewInquiries')
    .forEach((tr) => ScriptApp.deleteTrigger(tr));
  ScriptApp.newTrigger('checkNewInquiries').timeBased().everyMinutes(1).create();
  PropertiesService.getScriptProperties().setProperty('LAST_CREATED_AT', new Date().toISOString());
  Logger.log('Trigger created. Recipients: ' + recipients_().join(', '));
}

/** Sends one test mail to every recipient, so you can check the address list. */
function sendTestMail() {
  const to = recipients_();
  MailApp.sendEmail({
    to: to.join(','),
    subject: '【未来結婚情報】メール通知のテスト',
    body: 'これはテストです。会員から問い合わせ・相談の予約・通報が届くと、このアドレスに通知が届きます。\n\n' +
      '管理者画面：' + ADMIN_URL + '#/inquiries?status=new',
    name: '未来結婚情報 通知',
  });
  Logger.log('Test mail sent to: ' + to.join(', '));
}

/** Called by the trigger. Mails every inquiry created after the last one already handled. */
function checkNewInquiries() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // a previous run is still going
  try {
    const props = PropertiesService.getScriptProperties();
    const last = props.getProperty('LAST_CREATED_AT');
    if (!last) { props.setProperty('LAST_CREATED_AT', new Date().toISOString()); return; }

    const docs = newInquiries_(last);
    if (!docs.length) return;
    const to = recipients_();
    if (!to.length) throw new Error('No recipients: check /admins and EXTRA_RECIPIENTS.');

    docs.forEach((d) => {
      MailApp.sendEmail({ to: to.join(','), subject: subject_(d), body: body_(d), name: '未来結婚情報 通知' });
      // Advance after each mail, so a failure part-way never re-sends the ones already mailed.
      props.setProperty('LAST_CREATED_AT', d.createdAt);
    });
  } finally {
    lock.releaseLock();
  }
}

// ---------- Firestore / Firebase Auth (REST, with the owner's OAuth token) ----------

function call_(url, payload) {
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Goog-User-Project': PROJECT_ID },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error(url + ' → HTTP ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 500));
  return JSON.parse(res.getContentText());
}

function newInquiries_(afterIso) {
  const rows = call_(FIRESTORE + ':runQuery', {
    structuredQuery: {
      from: [{ collectionId: 'inquiries' }],
      where: { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN', value: { timestampValue: afterIso } } },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
      limit: MAX_PER_RUN,
    },
  });
  return rows.filter((r) => r.document).map((r) => {
    const f = r.document.fields || {};
    const s = (k) => (f[k] && (f[k].stringValue || f[k].timestampValue)) || '';
    const b = (f.booking && f.booking.mapValue && f.booking.mapValue.fields) || {};
    const bs = (k) => (b[k] && b[k].stringValue) || '';
    return {
      id: r.document.name.split('/').pop(),
      kind: s('kind'), subject: s('subject'), name: s('name'), gender: s('gender'),
      booking: bs('date') ? [bs('date'), bs('time'), METHODS[bs('method')] || bs('method')].filter(Boolean).join(' ') : '',
      createdAt: f.createdAt.timestampValue,
    };
  });
}

// The script owner, plus the "email" field of each /admins document (add it when you add an admin).
function recipients_() {
  const list = call_(FIRESTORE + ':runQuery', { structuredQuery: { from: [{ collectionId: 'admins' }] } });
  const emails = list.filter((r) => r.document && r.document.fields && r.document.fields.email)
    .map((r) => r.document.fields.email.stringValue).filter(Boolean);
  emails.unshift(Session.getEffectiveUser().getEmail());
  const extra = (PropertiesService.getScriptProperties().getProperty('EXTRA_RECIPIENTS') || '')
    .split(',').map((x) => x.trim()).filter(Boolean);
  return Array.from(new Set(emails.concat(extra)));
}

// ---------- Mail text (only kind, name and subject: the message itself stays on the admin screen) ----------

function subject_(d) {
  const tag = d.kind === 'report' ? '【至急・通報】' : '【新着】';
  return tag + (KINDS[d.kind] || 'お問い合わせ') + '：' + (d.name || '会員');
}

function body_(d) {
  const when = Utilities.formatDate(new Date(d.createdAt), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  return [
    '会員から新しい連絡が届きました。管理者画面で内容をご確認ください。',
    '',
    '種類：' + (KINDS[d.kind] || d.kind),
    '会員：' + (d.name || '-') + (GENDERS[d.gender] ? '（' + GENDERS[d.gender] + '）' : ''),
    '件名：' + (d.subject || '-'),
  ].concat(d.booking ? ['希望日時：' + d.booking] : []).concat([
    '受付：' + when + '（日本時間）',
    '',
    '▶ 開く：' + ADMIN_URL + '#/inquiry/' + d.id,
    '',
    '※ 本文や連絡先はメールに載せていません。管理者画面でご確認ください。',
    '※ このメールは送信専用です。',
  ]).join('\n');
}
