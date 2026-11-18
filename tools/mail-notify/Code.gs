/**
 * kiokuyeon — e-mail staff about new member inquiries / bookings / reports and homepage consultation requests.
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
const AGES = { '20s': '20代', '30s': '30代', '40s': '40代', '50s': '50代', '60s+': '60代以上' };
const CONTACT_METHODS = { line: 'LINE', kakao: 'カカオトーク', email: 'メール', phone: '電話' };
const LANGS = { ja: '日本語', ko: '韓国語', en: '英語' };
const MAX_PER_RUN = 50;
// More new items than this in one minute → one summary mail instead of one mail each (guards the
// daily Gmail quota if the public consultation form is ever flooded).
const DIGEST_OVER = 5;

// Each source: Firestore collection, the script property holding the last handled createdAt, and mail text.
const SOURCES = [
  { collection: 'inquiries', prop: 'LAST_CREATED_AT', label: '会員からの連絡', list: '#/inquiries?status=new', parse: parseInquiry_, mail: inquiryMail_ },
  { collection: 'consults', prop: 'LAST_CONSULT_AT', label: 'ホームページの相談申込', list: '#/consults?status=new', parse: parseConsult_, mail: consultMail_ },
];

/** Run once: creates the 1-minute trigger and starts from "now" (older items are not mailed). */
function setup() {
  ScriptApp.getProjectTriggers()
    .filter((tr) => tr.getHandlerFunction() === 'checkNewInquiries')
    .forEach((tr) => ScriptApp.deleteTrigger(tr));
  ScriptApp.newTrigger('checkNewInquiries').timeBased().everyMinutes(1).create();
  const now = new Date().toISOString();
  SOURCES.forEach((src) => PropertiesService.getScriptProperties().setProperty(src.prop, now));
  Logger.log('Trigger created. Recipients: ' + recipients_().join(', '));
}

/** Sends one test mail to every recipient, so you can check the address list. */
function sendTestMail() {
  const to = recipients_();
  MailApp.sendEmail({
    to: to.join(','),
    subject: '【未来結婚情報】メール通知のテスト',
    body: 'これはテストです。会員からの問い合わせ・相談の予約・通報、ホームページの相談申込が届くと、このアドレスに通知が届きます。\n\n' +
      '管理者画面：' + ADMIN_URL,
    name: '未来結婚情報 通知',
  });
  Logger.log('Test mail sent to: ' + to.join(', '));
}

/** Called by the trigger every minute (the name is kept so the installed trigger keeps working). */
function checkNewInquiries() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // a previous run is still going
  try {
    let to = null;
    SOURCES.forEach((src) => {
      const props = PropertiesService.getScriptProperties();
      const last = props.getProperty(src.prop);
      if (!last) { props.setProperty(src.prop, new Date().toISOString()); return; } // first run for this source
      const docs = newDocs_(src.collection, last).map(src.parse);
      if (!docs.length) return;
      if (!to) to = recipients_();
      if (!to.length) throw new Error('No recipients: check /admins and EXTRA_RECIPIENTS.');

      if (docs.length > DIGEST_OVER) {
        MailApp.sendEmail({ to: to.join(','), name: '未来結婚情報 通知',
          subject: '【新着 ' + docs.length + '件】' + src.label,
          body: src.label + 'が ' + docs.length + ' 件届きました。管理者画面でご確認ください。\n\n▶ 開く：' + ADMIN_URL + src.list });
        props.setProperty(src.prop, docs[docs.length - 1].createdAt);
        return;
      }
      docs.forEach((d) => {
        const m = src.mail(d);
        MailApp.sendEmail({ to: to.join(','), subject: m.subject, body: m.body, name: '未来結婚情報 通知' });
        // Advance after each mail, so a failure part-way never re-sends the ones already mailed.
        props.setProperty(src.prop, d.createdAt);
      });
    });
  } finally {
    lock.releaseLock();
  }
}

// ---------- Firestore (REST, with the owner's OAuth token) ----------

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

function newDocs_(collection, afterIso) {
  const rows = call_(FIRESTORE + ':runQuery', {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN', value: { timestampValue: afterIso } } },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
      limit: MAX_PER_RUN,
    },
  });
  return rows.filter((r) => r.document).map((r) => r.document);
}

function str_(fields, k) { return (fields[k] && (fields[k].stringValue || fields[k].timestampValue)) || ''; }

function parseInquiry_(doc) {
  const f = doc.fields || {};
  const b = (f.booking && f.booking.mapValue && f.booking.mapValue.fields) || {};
  return {
    id: doc.name.split('/').pop(),
    kind: str_(f, 'kind'), subject: str_(f, 'subject'), name: str_(f, 'name'), gender: str_(f, 'gender'),
    booking: str_(b, 'date') ? [str_(b, 'date'), str_(b, 'time'), METHODS[str_(b, 'method')] || str_(b, 'method')].filter(Boolean).join(' ') : '',
    createdAt: f.createdAt.timestampValue,
  };
}

function parseConsult_(doc) {
  const f = doc.fields || {};
  return {
    id: doc.name.split('/').pop(),
    nickname: str_(f, 'nickname'), region: str_(f, 'region'), age: str_(f, 'age'), method: str_(f, 'method'), lang: str_(f, 'lang'),
    createdAt: f.createdAt.timestampValue,
  };
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

// ---------- Mail text (no message body or contact details: those stay on the admin screen) ----------

function when_(iso) { return Utilities.formatDate(new Date(iso), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm') + '（日本時間）'; }

const FOOTER = ['', '※ 本文や連絡先はメールに載せていません。管理者画面でご確認ください。', '※ このメールは送信専用です。'];

function inquiryMail_(d) {
  const tag = d.kind === 'report' ? '【至急・通報】' : '【新着】';
  return {
    subject: tag + (KINDS[d.kind] || 'お問い合わせ') + '：' + (d.name || '会員'),
    body: [
      '会員から新しい連絡が届きました。管理者画面で内容をご確認ください。',
      '',
      '種類：' + (KINDS[d.kind] || d.kind),
      '会員：' + (d.name || '-') + (GENDERS[d.gender] ? '（' + GENDERS[d.gender] + '）' : ''),
      '件名：' + (d.subject || '-'),
    ].concat(d.booking ? ['希望日時：' + d.booking] : []).concat([
      '受付：' + when_(d.createdAt),
      '',
      '▶ 開く：' + ADMIN_URL + '#/inquiry/' + d.id,
    ]).concat(FOOTER).join('\n'),
  };
}

function consultMail_(d) {
  return {
    subject: '【相談申込】' + (d.nickname || '-') + '（' + (d.region || '-') + '・' + (AGES[d.age] || d.age || '-') + '）',
    body: [
      'ホームページから無料相談の申込が届きました。管理者画面で内容と連絡先をご確認ください。',
      '',
      'ニックネーム：' + (d.nickname || '-'),
      'お住まい：' + (d.region || '-'),
      '年代：' + (AGES[d.age] || d.age || '-'),
      '希望の連絡方法：' + (CONTACT_METHODS[d.method] || d.method || '-'),
      '使用言語：' + (LANGS[d.lang] || d.lang || '-'),
      '受付：' + when_(d.createdAt),
      '',
      '▶ 開く：' + ADMIN_URL + '#/consult/' + d.id,
    ].concat(FOOTER).join('\n'),
  };
}
