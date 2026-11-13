// Shared helpers: Firebase setup, Japanese/Korean UI text, DOM helpers, image resizing.
(function () {
  'use strict';

  // ---------- Firebase ----------
  const cfg = window.FIREBASE_CONFIG || {};
  const configured = !!(cfg.apiKey && !String(cfg.apiKey).startsWith('REPLACE'));
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const useEmulator = local && new URLSearchParams(location.search).has('emulator');
  let auth = null, db = null;
  if (configured || useEmulator) {
    firebase.initializeApp(configured ? cfg : { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-kiokuyeon' });
    auth = firebase.auth();
    db = firebase.firestore();
    if (useEmulator) {
      auth.useEmulator('http://127.0.0.1:9099');
      db.useEmulator('127.0.0.1', 8080);
    }
  }
  const ts = () => firebase.firestore.FieldValue.serverTimestamp();

  async function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await auth.signInWithPopup(provider);
    } catch (e) {
      // Some phone browsers block pop-ups; fall back to a full-page redirect.
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
        await auth.signInWithRedirect(provider);
      } else if (!(e && e.code === 'auth/popup-closed-by-user')) {
        throw e;
      }
    }
  }

  // ---------- Language ----------
  const STR = {
    brand: { ja: '未来結婚情報', ko: '미래결혼정보' },
    tagline: { ja: '日韓国際結婚相談', ko: '한일 국제결혼 상담' },
    login: { ja: 'Googleでログイン', ko: 'Google로 로그인' },
    logout: { ja: 'ログアウト', ko: '로그아웃' },
    save: { ja: '保存する', ko: '저장' },
    cancel: { ja: 'キャンセル', ko: '취소' },
    back: { ja: '戻る', ko: '돌아가기' },
    edit: { ja: '編集', ko: '수정' },
    delete: { ja: '削除', ko: '삭제' },
    search: { ja: '検索', ko: '검색' },
    loading: { ja: '読み込み中…', ko: '불러오는 중…' },
    saved: { ja: '保存しました。', ko: '저장했습니다.' },
    error: { ja: 'エラーが発生しました。時間をおいて再度お試しください。', ko: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
    denied: { ja: 'この操作の権限がありません。', ko: '이 작업을 할 권한이 없습니다.' },
    notConfigured: { ja: 'Firebaseの設定（assets/firebase-config.js）がまだ入力されていません。', ko: 'Firebase 설정（assets/firebase-config.js）이 아직 입력되지 않았습니다.' },
    female: { ja: '女性', ko: '여성' },
    male: { ja: '男性', ko: '남성' },
    age: { ja: '年齢', ko: '나이' },
    ageAuto: { ja: '年齢（自動計算）', ko: '나이（자동 계산）' },
    required: { ja: '必須', ko: '필수' },
    requiredMissing: { ja: '必須項目を入力してください：', ko: '필수 항목을 입력해 주세요: ' },
    photo: { ja: '写真', ko: '사진' },
    photoPick: { ja: '写真を選ぶ（JPEG・PNG）', ko: '사진 선택（JPEG·PNG）' },
    photoRemove: { ja: '写真を削除', ko: '사진 삭제' },
    photoBad: { ja: 'JPEGまたはPNGの画像（20MBまで）を選んでください。', ko: 'JPEG 또는 PNG 이미지（20MB 이하）를 선택해 주세요.' },
    confirmDelete: { ja: '削除すると元に戻せません。削除しますか？', ko: '삭제하면 되돌릴 수 없습니다. 삭제할까요?' },
    st_submitted: { ja: '受付済み（確認待ち）', ko: '접수 완료（확인 대기）' },
    st_reviewing: { ja: '確認中', ko: '확인 중' },
    st_returned: { ja: '修正のお願い', ko: '수정 요청' },
    st_approved: { ja: '登録完了', ko: '등록 완료' },
    st_rejected: { ja: 'お見送り', ko: '반려' },
  };
  let lang = 'ja';
  try { const v = localStorage.getItem('kiokuyeon-lang'); if (v === 'ja' || v === 'ko') lang = v; } catch (e) { /* storage unavailable */ }
  if (lang === 'ja' && !localStorageHas() && (navigator.language || '').toLowerCase().startsWith('ko')) lang = 'ko';
  function localStorageHas() { try { return localStorage.getItem('kiokuyeon-lang') !== null; } catch (e) { return false; } }
  document.documentElement.lang = lang;

  const extra = {};
  function addStrings(map) { Object.assign(extra, map); }
  function t(key) { const s = extra[key] || STR[key]; return s ? s[lang] : key; }
  function setLang(next) {
    lang = next;
    try { localStorage.setItem('kiokuyeon-lang', next); } catch (e) { /* ignore */ }
    document.documentElement.lang = next;
  }
  function langSwitch(onChange) {
    const wrap = el('div', { class: 'lang' });
    [['ja', '日本語'], ['ko', '한국어']].forEach(([code, name]) => {
      const b = el('button', { type: 'button', class: code === lang ? 'on' : '', 'aria-pressed': String(code === lang) }, name);
      b.addEventListener('click', () => { setLang(code); onChange(); });
      wrap.append(b);
    });
    return wrap;
  }

  // ---------- DOM ----------
  function el(tag, attrs, ...children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c != null && c !== false) n.append(c instanceof Node ? c : String(c));
    return n;
  }
  function toast(msg, bad) {
    const n = el('div', { class: 'toast' + (bad ? ' bad' : ''), role: 'status' }, msg);
    document.body.append(n);
    setTimeout(() => n.remove(), 3500);
  }
  function fail(e) {
    console.error(e);
    toast(e && e.code === 'permission-denied' ? t('denied') : t('error'), true);
  }

  // Age in full years, computed for today's date in Japan time.
  function ageFrom(birth) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth || '');
    if (!m) return null;
    const now = new Date(Date.now() + 9 * 3600000);
    let age = now.getUTCFullYear() - +m[1];
    if (now.getUTCMonth() + 1 < +m[2] || (now.getUTCMonth() + 1 === +m[2] && now.getUTCDate() < +m[3])) age--;
    return age >= 0 && age < 130 ? age : null;
  }
  function fmtTime(v) {
    const d = v && v.toDate ? v.toDate() : (v instanceof Date ? v : null);
    if (!d) return '';
    return d.toLocaleString(lang === 'ko' ? 'ko-KR' : 'ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  // ---------- Form rendering ----------
  function fieldInput(f, g, value, idPrefix) {
    const id = (idPrefix || 'f') + '-' + f.k;
    const v = value == null ? '' : String(value);
    let input;
    if (f.type === 'select') {
      input = el('select', { id, name: f.k }, el('option', { value: '' }, '—'),
        f.opts.map((x) => el('option', { value: x.code, selected: x.code === v }, x[lang])));
    } else if (f.type === 'textarea') {
      input = el('textarea', { id, name: f.k, maxlength: f.max, rows: 4 });
      input.value = v;
    } else {
      input = el('input', { id, name: f.k, type: f.type, value: v,
        maxlength: f.type === 'number' || f.type === 'date' ? null : f.max,
        min: f.type === 'number' ? f.min : null, max: f.type === 'number' ? f.max : null,
        inputmode: f.type === 'number' ? 'numeric' : null });
    }
    if (f.req) input.required = true;
    return el('label', { class: 'field' + (f.type === 'textarea' ? ' wide' : ''), for: id },
      el('span', {}, KF.label(f, g, lang), f.req ? el('em', {}, t('required')) : null), input);
  }
  function readFields(root, fields) {
    const out = {};
    fields.forEach((f) => {
      const n = root.querySelector('[name="' + f.k + '"]');
      if (!n) return;
      const v = n.value.trim();
      if (v === '') return;
      out[f.k] = f.type === 'number' ? Number(v) : v;
    });
    return out;
  }
  function missing(values, fields, g) {
    return fields.filter((f) => f.req && (values[f.k] == null || values[f.k] === '')).map((f) => KF.label(f, g, lang));
  }
  function display(f, g, value) {
    if (value == null || value === '') return '';
    return f.type === 'select' ? KF.optionLabel(f, value, lang) : String(value);
  }

  // ---------- Images ----------
  // Resize to at most 1000px on the longest side and re-encode as JPEG (also strips EXIF/location data).
  async function resizePhoto(file) {
    if (!file || !/^image\/(jpeg|png)$/.test(file.type) || file.size > 20 * 1024 * 1024) throw new Error('photo');
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      let max = 1000, quality = 0.82, data = '';
      for (let i = 0; i < 6; i++) {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * scale));
        c.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        data = c.toDataURL('image/jpeg', quality);
        if (data.length < 700000) return data;
        max = Math.round(max * 0.8); quality = Math.max(0.6, quality - 0.06);
      }
      throw new Error('photo');
    } finally { URL.revokeObjectURL(url); }
  }

  // Small number bubble for unread / waiting items (nothing when zero).
  function count(n, red) { return n > 0 ? el('span', { class: 'count' + (red ? ' red' : ''), 'aria-label': String(n) }, String(n)) : null; }
  // Prefix the browser tab title with the number of new items.
  const baseTitle = document.title;
  function titleCount(n) { document.title = (n > 0 ? '(' + n + ') ' : '') + baseTitle; }
  const millis = (v) => (v && v.toMillis ? v.toMillis() : 0);

  window.KC = { auth, db, ts, configured: configured || useEmulator, signIn, t, addStrings, get lang() { return lang; }, setLang, langSwitch,
    el, toast, fail, ageFrom, fmtTime, fieldInput, readFields, missing, display, resizePhoto, count, titleCount, millis };
})();
