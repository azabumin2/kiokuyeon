// Kiokuyeon homepage: menu, language memory, settings from Firestore (site/settings), videos, consultation form.
// No Firebase SDK here — plain Firestore REST calls. Security rules: anyone may read site/*, and create
// consults/* with a fixed set of fields (see firestore.rules).
(function () {
  'use strict';
  const PROJECT = 'kiokuyeon';
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const params = new URLSearchParams(location.search);
  const FS = local && params.has('emulator') ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
  const DOCS = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
  const lang = document.body.dataset.lang || 'ja';

  // ---------- language memory & menu
  try { localStorage.setItem('kiokuyeon-lang', lang); } catch (e) { /* storage unavailable */ }
  document.querySelectorAll('.langs a[data-lang]').forEach((a) => a.addEventListener('click', () => {
    try { localStorage.setItem('kiokuyeon-lang', a.dataset.lang); } catch (e) { /* ignore */ }
  }));
  const menuBtn = document.querySelector('.menu-btn');
  const gnav = document.getElementById('gnav');
  if (menuBtn && gnav) {
    menuBtn.addEventListener('click', () => {
      const open = gnav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  // ---------- Firestore REST value → plain JS
  function fromFs(v) {
    if (!v || typeof v !== 'object') return null;
    if ('stringValue' in v) return v.stringValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('nullValue' in v) return null;
    if ('timestampValue' in v) return v.timestampValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFs);
    if ('mapValue' in v) return fields(v.mapValue.fields || {});
    return null;
  }
  function fields(f) { const o = {}; for (const k in f) o[k] = fromFs(f[k]); return o; }

  async function loadSettings() {
    if (local && params.get('fs') === 'offline') return {};
    try {
      const r = await fetch(`${DOCS}/site/settings`, { cache: 'no-store' });
      if (!r.ok) return {};
      const d = await r.json();
      return fields(d.fields || {});
    } catch (e) { return {}; }
  }

  // Today in Korea (YYYY-MM-DD), so the insurance card disappears on the right day.
  function todayKST() {
    return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  }
  const loc = (m) => (m && typeof m === 'object' ? (m[lang] || '') : '');
  const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? u : '');

  function applySettings(s) {
    // Free consultation badge: only when explicitly true.
    document.querySelectorAll('[data-setting="freeConsult"]').forEach((n) => { n.hidden = s.freeConsult !== true; });
    // LINE (Japanese pages) and KakaoTalk (Korean pages): hidden unless a valid https link is set.
    [['lineUrl', s.lineUrl], ['kakaoUrl', s.kakaoUrl]].forEach(([k, v]) => {
      document.querySelectorAll(`[data-setting="${k}"]`).forEach((a) => {
        const u = safeUrl(v);
        a.hidden = !u;
        if (u) a.href = u;
      });
    });
    // Fees text.
    document.querySelectorAll('[data-setting="fees"]').forEach((p) => {
      const v = loc(s.fees);
      p.textContent = v || p.dataset.empty;
    });
    // Staff languages / hours.
    document.querySelectorAll('[data-setting="staffInfo"]').forEach((box) => {
      const v = loc(s.staffInfo);
      box.hidden = !v;
      const p = box.querySelector('[data-text]');
      if (p) p.textContent = v;
    });
    // Japan office status.
    document.querySelectorAll('[data-setting="japanOffice"]').forEach((box) => {
      const jo = s.japanOffice || {};
      const st = ['none', 'preparing', 'open'].includes(jo.status) ? jo.status : 'none';
      box.querySelectorAll('[data-jp]').forEach((p) => { p.hidden = p.dataset.jp !== st; });
      const a = box.querySelector('[data-jp-addr]');
      if (a) a.textContent = loc(jo.address);
      if (st === 'open' && !loc(jo.address)) box.querySelector('[data-jp="open"]').hidden = true;
    });
    // Insurance card: values from settings when present; hidden after the period ends.
    document.querySelectorAll('[data-setting="insurance"]').forEach((card) => {
      const ins = s.insurance || {};
      if (ins.amount) card.querySelector('[data-ins="amount"]').textContent = Number(ins.amount).toLocaleString('ko-KR');
      if (ins.from) card.querySelector('[data-ins="from"]').textContent = ins.from;
      if (ins.to) card.querySelector('[data-ins="to"]').textContent = ins.to;
      const to = ins.to || card.dataset.to;
      card.hidden = !to || to < todayKST();
      const sec = card.closest('section.insurance'); // operator page: drop the whole section with the card
      if (sec) sec.hidden = card.hidden;
    });
    renderVideos(Array.isArray(s.videos) ? s.videos.filter((v) => v && v.permission === true && /^[A-Za-z0-9_-]{11}$/.test(v.youtubeId || '')) : []);
  }

  // ---------- videos: thumbnail first, YouTube (nocookie) player only after a click
  function renderVideos(list) {
    document.querySelectorAll('[data-videos]').forEach((box) => {
      const empty = box.parentElement.querySelector('[data-videos-empty]');
      const items = list.slice(0, Number(box.dataset.limit) || 4);
      box.hidden = !items.length;
      if (empty) empty.hidden = !!items.length;
      box.replaceChildren(...items.map((v) => {
        const title = loc(v.title) || '';
        const card = document.createElement('div');
        card.className = 'v';
        const frame = document.createElement('div');
        frame.className = 'v-frame';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', `${box.dataset.play}: ${title}`);
        const img = document.createElement('img');
        img.src = `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
        img.alt = title;
        img.loading = 'lazy';
        const play = document.createElement('span');
        play.className = 'play';
        play.textContent = '▶ ' + box.dataset.play;
        btn.append(img, play);
        btn.addEventListener('click', () => {
          const f = document.createElement('iframe');
          f.src = `https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`;
          f.title = title;
          f.allow = 'autoplay; encrypted-media; picture-in-picture';
          f.allowFullscreen = true;
          frame.replaceChildren(f);
        });
        frame.append(btn);
        const body = document.createElement('div');
        body.className = 'v-body';
        if (v.country) {
          const c = document.createElement('span');
          c.className = 'v-country';
          c.textContent = `${box.dataset.country}: ${v.country}`;
          body.append(c);
        }
        const h = document.createElement('h3');
        h.textContent = title;
        body.append(h);
        const note = loc(v.note);
        if (note) { const p = document.createElement('p'); p.textContent = note; body.append(p); }
        card.append(frame, body);
        return card;
      }));
    });
  }

  // ---------- consultation form
  const form = document.querySelector('form.consult');
  if (form) {
    const msgs = document.querySelector('[data-msg-sent]').dataset;
    const out = form.querySelector('.result');
    const show = (text, bad) => { out.hidden = false; out.textContent = text; out.classList.toggle('bad', !!bad); };
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const v = (k) => String(fd.get(k) || '').trim();
      if (v('website')) { form.reset(); return show(msgs.msgSent); } // bots fill the hidden field
      const data = { nickname: v('nickname'), region: v('region'), age: v('age'), method: v('method'), contact: v('contact'), body: v('body') };
      if (Object.values(data).some((x) => !x) || !fd.get('consent') || data.contact.length < 3) return show(msgs.msgMissing, true);
      let last = 0;
      try { last = Number(localStorage.getItem('kiokuyeon-consult-at')) || 0; } catch (e) { /* ignore */ }
      if (Date.now() - last < 60000) return show(msgs.msgWait, true);
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const name = `projects/${PROJECT}/databases/(default)/documents/consults/${id}`;
      const f = {};
      Object.entries(data).forEach(([k, x]) => { f[k] = { stringValue: x }; });
      f.consent = { booleanValue: true };
      f.lang = { stringValue: lang };
      f.status = { stringValue: 'new' };
      try {
        const r = await fetch(`${DOCS}:commit`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ writes: [{ update: { name, fields: f }, currentDocument: { exists: false },
            updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }] }] }),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        try { localStorage.setItem('kiokuyeon-consult-at', String(Date.now())); } catch (e) { /* ignore */ }
        form.reset();
        show(msgs.msgSent);
      } catch (e) {
        console.warn(e);
        show(msgs.msgError, true);
      }
      btn.disabled = false;
    });
  }

  loadSettings().then(applySettings);
})();
