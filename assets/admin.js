// Admin screen: staff review self-registrations and manage male/female members.
// Access is limited to accounts registered in the Firestore "admins" collection (enforced by firestore.rules).
(function () {
  'use strict';
  const { el, t } = KC;
  KC.addStrings({
    adminTitle: { ja: '管理者画面', ko: '관리자 화면' },
    adminLogin: { ja: 'スタッフ専用ページです。登録済みのGoogleアカウントでログインしてください。', ko: '직원 전용 페이지입니다. 등록된 Google 계정으로 로그인해 주세요.' },
    notAdmin: { ja: 'このアカウントには管理者権限がありません。管理者に次のUIDを伝えて登録を依頼してください。', ko: '이 계정에는 관리자 권한이 없습니다. 관리자에게 아래 UID를 전달해 등록을 요청하세요.' },
    navHome: { ja: 'ホーム', ko: '홈' },
    navApps: { ja: '登録申請', ko: '등록 신청' },
    navWomen: { ja: '女性会員', ko: '여성 회원' },
    navMen: { ja: '男性会員', ko: '남성 회원' },
    pending: { ja: '確認待ちの申請', ko: '확인 대기 신청' },
    returnedCount: { ja: '修正依頼中', ko: '수정 요청 중' },
    activeWomen: { ja: '活動中の女性会員', ko: '활동 중 여성 회원' },
    activeMen: { ja: '活動中の男性会員', ko: '활동 중 남성 회원' },
    all: { ja: 'すべて', ko: '전체' },
    name: { ja: '氏名', ko: '성명' },
    gender: { ja: '区分', ko: '구분' },
    region: { ja: '地域', ko: '지역' },
    status: { ja: '状態', ko: '상태' },
    updated: { ja: '更新日時', ko: '수정 일시' },
    none: { ja: '該当するデータはありません。', ko: '해당 데이터가 없습니다.' },
    appDetail: { ja: '登録申請の詳細', ko: '등록 신청 상세' },
    toReviewing: { ja: '確認中にする', ko: '확인 중으로 변경' },
    returnReq: { ja: '修正を依頼する', ko: '수정 요청' },
    returnNote: { ja: '会員へのお願い（会員の画面に表示されます）', ko: '회원에게 전할 요청（회원 화면에 표시됩니다）' },
    approve: { ja: '承認して会員登録', ko: '승인하고 회원 등록' },
    reject: { ja: 'お見送り', ko: '반려' },
    approvedTo: { ja: '会員情報を開く', ko: '회원 정보 열기' },
    confirmApprove: { ja: 'この申請を承認し、会員として登録しますか？', ko: '이 신청을 승인하고 회원으로 등록할까요?' },
    confirmReject: { ja: 'この申請をお見送りにしますか？', ko: '이 신청을 반려할까요?' },
    noteRequired: { ja: '修正内容を入力してください。', ko: '수정 요청 내용을 입력해 주세요.' },
    newMember: { ja: '会員を直接登録', ko: '회원 직접 등록' },
    memberDetail: { ja: '会員詳細', ko: '회원 상세' },
    memberEdit: { ja: '会員情報の編集', ko: '회원 정보 수정' },
    adminSection: { ja: '管理情報（スタッフのみ）', ko: '관리 정보（직원 전용）' },
    fromApp: { ja: '本人の登録申請から作成', ko: '본인 등록 신청에서 생성' },
    matchMen: { ja: 'この希望条件で男性を検索', ko: '이 희망 조건으로 남성 검색' },
    records: { ja: '相談・交際記録', ko: '상담·교제 기록' },
    addRecord: { ja: '記録を追加', ko: '기록 추가' },
    recordType: { ja: '記録の種類', ko: '기록 종류' },
    noRecords: { ja: '記録はまだありません。', ko: '아직 기록이 없습니다.' },
    by: { ja: '記録者', ko: '기록자' },
    q: { ja: 'キーワード（氏名・地域・職業）', ko: '키워드（성명·지역·직업）' },
    ageMin: { ja: '年齢（以上）', ko: '나이（이상）' },
    ageMax: { ja: '年齢（以下）', ko: '나이（이하）' },
    heightMin: { ja: '身長（cm以上）', ko: '키（cm 이상）' },
    incomeMin: { ja: '年収（以上）', ko: '연소득（이상）' },
    count: { ja: '件', ko: '건' },
    clear: { ja: '条件をクリア', ko: '조건 지우기' },
  });

  const app = document.getElementById('app');
  let user = null, isAdmin = false;
  const col = (name) => KC.db.collection(name);
  const gKey = (gender) => (gender === 'male' ? 'm' : 'f');
  const STATUS_FIELD = KF.ADMIN.find((f) => f.k === 'status');

  function header() {
    const nav = isAdmin ? [['#/', t('navHome')], ['#/apps', t('navApps')], ['#/members?g=female', t('navWomen')], ['#/members?g=male', t('navMen')]] : [];
    return el('header', { class: 'top' }, el('div', { class: 'top-inner' },
      el('a', { class: 'brand', href: '#/' }, t('brand'), el('small', {}, t('adminTitle'))),
      el('nav', { class: 'tabs', style: 'margin:0' }, nav.map(([h, label]) => {
        const cur = location.hash || '#/';
        return el('a', { href: h, class: (h === '#/' ? cur === '#/' : cur.startsWith(h)) ? 'on' : '' }, label);
      })),
      el('span', { class: 'spacer' }),
      KC.langSwitch(route),
      user ? el('button', { type: 'button', class: 'secondary', onclick: () => KC.auth.signOut() }, t('logout')) : null));
  }
  function page(...children) { app.replaceChildren(header(), el('main', {}, ...children)); }
  function badge(status, label) { return el('span', { class: 'badge ' + status }, label); }
  function appStatusLabel(s) { return t('st_' + s); }
  function memberStatusLabel(s) { return KF.optionLabel(STATUS_FIELD, s, KC.lang); }
  function params() { return new URLSearchParams((location.hash.split('?')[1]) || ''); }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function age(p) { return KC.ageFrom((p || {}).birth); }

  // ---------- Router ----------
  async function route() {
    if (!KC.configured) return page(el('p', { class: 'alert' }, t('notConfigured')));
    if (!user) {
      return page(el('section', { class: 'card hero' }, el('h1', {}, t('adminTitle')), el('p', {}, t('adminLogin')),
        el('button', { type: 'button', onclick: () => KC.signIn().catch(KC.fail) }, t('login'))));
    }
    if (!isAdmin) {
      return page(el('section', { class: 'card' }, el('h1', {}, t('adminTitle')), el('p', { class: 'alert' }, t('notAdmin')),
        el('p', {}, 'UID: ', el('code', {}, user.uid)), el('p', {}, user.email || '')));
    }
    const path = (location.hash.replace(/^#/, '').split('?')[0]) || '/';
    const parts = path.split('/').filter(Boolean);
    page(el('p', { class: 'muted' }, t('loading')));
    try {
      if (parts.length === 0) return await dashboard();
      if (parts[0] === 'apps') return await appList();
      if (parts[0] === 'app' && parts[1]) return await appDetail(parts[1]);
      if (parts[0] === 'members') return await memberList();
      if (parts[0] === 'member' && parts[1] === 'new') return await memberForm(null);
      if (parts[0] === 'member' && parts[1] && parts[2] === 'edit') return await memberForm(parts[1]);
      if (parts[0] === 'member' && parts[1]) return await memberDetail(parts[1]);
      go('#/');
    } catch (e) { KC.fail(e); page(el('p', { class: 'alert' }, t('error'))); }
  }

  // ---------- Dashboard ----------
  async function dashboard() {
    const [apps, members] = await Promise.all([col('applications').get(), col('members').get()]);
    const a = apps.docs.map((d) => d.data()), m = members.docs.map((d) => d.data());
    const stat = (n, label, href) => el('a', { class: 'stat', href }, el('b', {}, String(n)), label);
    page(el('h1', {}, t('adminTitle')), el('div', { class: 'stats' },
      stat(a.filter((x) => ['submitted', 'reviewing'].includes(x.status)).length, t('pending'), '#/apps?status=open'),
      stat(a.filter((x) => x.status === 'returned').length, t('returnedCount'), '#/apps?status=returned'),
      stat(m.filter((x) => x.gender === 'female' && (x.admin || {}).status === 'active').length, t('activeWomen'), '#/members?g=female'),
      stat(m.filter((x) => x.gender === 'male' && (x.admin || {}).status === 'active').length, t('activeMen'), '#/members?g=male')));
  }

  // ---------- Applications ----------
  async function appList() {
    const filter = params().get('status') || 'open';
    const snap = await col('applications').orderBy('updatedAt', 'desc').get();
    const rows = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))
      .filter((x) => filter === 'all' || (filter === 'open' ? ['submitted', 'reviewing'].includes(x.status) : x.status === filter));
    const tabs = [['open', t('pending')], ['returned', t('st_returned')], ['approved', t('st_approved')], ['rejected', t('st_rejected')], ['all', t('all')]];
    const body = el('tbody');
    rows.forEach((r) => {
      const tr = el('tr', { class: 'link', tabindex: '0' },
        el('td', {}, (r.profile || {}).name || ''), el('td', {}, t(r.gender)), el('td', {}, age(r.profile) ?? ''),
        el('td', {}, (r.profile || {}).region || ''), el('td', {}, badge(r.status, appStatusLabel(r.status))), el('td', {}, KC.fmtTime(r.updatedAt)));
      const open = () => go('#/app/' + r.id);
      tr.addEventListener('click', open); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
      body.append(tr);
    });
    page(el('h1', {}, t('navApps')),
      el('nav', { class: 'tabs' }, tabs.map(([k, label]) => el('a', { href: '#/apps?status=' + k, class: k === filter ? 'on' : '' }, label))),
      rows.length ? el('div', { class: 'table-wrap' }, el('table', {},
        el('thead', {}, el('tr', {}, [t('name'), t('gender'), t('age'), t('region'), t('status'), t('updated')].map((h) => el('th', {}, h)))), body))
        : el('p', { class: 'muted' }, t('none')));
  }

  function profileView(profile, g) {
    const box = el('div');
    KF.SECTIONS.forEach((s) => {
      const dl = el('dl', { class: 'view' });
      KF.forGender(s.fields, g).forEach((f) => {
        const v = KC.display(f, g, (profile || {})[f.k]);
        if (f.k === 'birth' && v) dl.append(el('dt', {}, KF.label(f, g, KC.lang)), el('dd', {}, v + '（' + t('age') + ' ' + (KC.ageFrom(v) ?? '-') + '）'));
        else if (v) dl.append(el('dt', {}, KF.label(f, g, KC.lang)), el('dd', {}, v));
      });
      if (dl.childElementCount) box.append(el('h2', {}, s[KC.lang]), dl);
    });
    return box;
  }
  async function photoBox(key) {
    if (!key) return el('div', { class: 'ph' }, t('photo'));
    const p = await col('photos').doc(key).get();
    return p.exists ? el('img', { src: p.data().data, alt: t('photo') }) : el('div', { class: 'ph' }, t('photo'));
  }

  async function appDetail(uid) {
    const ref = col('applications').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return page(el('p', { class: 'alert' }, t('none')));
    const a = snap.data(), g = gKey(a.gender);
    const note = el('textarea', { rows: 3, maxlength: 1000, id: 'review-note' });
    note.value = a.reviewNote || '';
    const stamp = () => ({ reviewedAt: KC.ts(), reviewedBy: user.email || user.uid });
    const act = async (fn) => { try { await fn(); KC.toast(t('saved')); route(); } catch (e) { KC.fail(e); } };
    const actions = el('div', { class: 'actions' });
    if (a.status !== 'approved') {
      actions.append(
        el('button', { type: 'button', onclick: () => { if (confirm(t('confirmApprove'))) act(() => approve(uid, a)); } }, t('approve')),
        a.status === 'submitted' ? el('button', { type: 'button', class: 'secondary', onclick: () => act(() => ref.update(Object.assign({ status: 'reviewing' }, stamp()))) }, t('toReviewing')) : null,
        el('button', { type: 'button', class: 'secondary', onclick: () => {
          if (!note.value.trim()) return KC.toast(t('noteRequired'), true);
          act(() => ref.update(Object.assign({ status: 'returned', reviewNote: note.value.trim() }, stamp())));
        } }, t('returnReq')),
        a.status !== 'rejected' ? el('button', { type: 'button', class: 'danger', onclick: () => { if (confirm(t('confirmReject'))) act(() => ref.update(Object.assign({ status: 'rejected' }, stamp()))); } }, t('reject')) : null);
    } else if (a.memberId) {
      actions.append(el('a', { class: 'button', href: '#/member/' + a.memberId }, t('approvedTo')));
    }
    actions.append(el('button', { type: 'button', class: 'danger', onclick: () => {
      if (!confirm(t('confirmDelete'))) return;
      act(async () => { await ref.delete(); if (!a.memberId) await col('photos').doc(uid).delete(); go('#/apps'); });
    } }, t('delete')));
    page(el('p', {}, el('a', { href: '#/apps' }, '← ', t('navApps'))),
      el('section', { class: 'card' },
        el('h1', {}, t('appDetail'), '：', (a.profile || {}).name || ''),
        el('p', {}, t(a.gender), ' ', badge(a.status, appStatusLabel(a.status)), ' ', el('span', { class: 'muted' }, t('updated'), ' ', KC.fmtTime(a.updatedAt))),
        el('div', { class: 'photo' }, await photoBox(a.hasPhoto ? uid : null)),
        a.status !== 'approved' ? el('label', { class: 'field wide', for: 'review-note', style: 'margin-top:16px' }, el('span', {}, t('returnNote')), note) : null,
        actions),
      el('section', { class: 'card' }, profileView(a.profile, g)));
  }

  async function approve(uid, a) {
    const memberRef = col('members').doc();
    const batch = KC.db.batch();
    batch.set(memberRef, { gender: a.gender, profile: a.profile || {}, admin: { status: 'active' }, sourceUid: uid,
      photoKey: a.hasPhoto ? uid : null, createdAt: KC.ts(), updatedAt: KC.ts(), updatedBy: user.email || user.uid });
    batch.update(col('applications').doc(uid), { status: 'approved', memberId: memberRef.id, reviewNote: '', reviewedAt: KC.ts(), reviewedBy: user.email || user.uid });
    await batch.commit();
  }

  // ---------- Members ----------
  async function memberList() {
    const p = params();
    const gender = p.get('g') === 'male' ? 'male' : 'female';
    const g = gKey(gender);
    const snap = await col('members').get();
    const num = (k) => (p.get(k) ? Number(p.get(k)) : null);
    const q = (p.get('q') || '').toLowerCase(), st = p.get('st') || 'active';
    const ageMin = num('ageMin'), ageMax = num('ageMax'), hMin = num('hMin'), iMin = num('iMin');
    const rows = snap.docs.map((d) => Object.assign({ id: d.id }, d.data())).filter((m) => {
      const pr = m.profile || {}, a = age(pr);
      if (m.gender !== gender) return false;
      if (st !== 'all' && (m.admin || {}).status !== st) return false;
      if (q && ![pr.name, pr.region, pr.jobDetails, pr.latinSurname, pr.latinGivenName].join(' ').toLowerCase().includes(q)) return false;
      if (ageMin != null && (a == null || a < ageMin)) return false;
      if (ageMax != null && (a == null || a > ageMax)) return false;
      if (hMin != null && !(pr.height >= hMin)) return false;
      if (iMin != null && !(pr.income >= iMin)) return false;
      return true;
    }).sort((x, y) => ((y.updatedAt && y.updatedAt.toMillis()) || 0) - ((x.updatedAt && x.updatedAt.toMillis()) || 0));

    const fq = el('form', { class: 'card filters' });
    const inp = (name, label, type) => el('label', { class: 'field' }, el('span', {}, label), el('input', { name, type: type || 'number', value: p.get(name) || '' }));
    const stSel = el('select', { name: 'st' }, el('option', { value: 'all', selected: st === 'all' }, t('all')),
      STATUS_FIELD.opts.map((o) => el('option', { value: o.code, selected: o.code === st }, o[KC.lang])));
    const incomeLabel = KF.label(KF.SECTIONS[2].fields.find((f) => f.k === 'income'), g, KC.lang).replace(/^[^（(]+/, t('incomeMin'));
    fq.append(inp('q', t('q'), 'search'), el('label', { class: 'field' }, el('span', {}, t('status')), stSel),
      inp('ageMin', t('ageMin')), inp('ageMax', t('ageMax')), inp('hMin', t('heightMin')), inp('iMin', incomeLabel),
      el('div', { class: 'actions', style: 'margin:0' }, el('button', { type: 'submit' }, t('search')),
        el('a', { class: 'button secondary', href: '#/members?g=' + gender }, t('clear'))));
    fq.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = new URLSearchParams({ g: gender });
      new FormData(fq).forEach((v, k) => { if (String(v).trim()) n.set(k, String(v).trim()); });
      go('#/members?' + n.toString());
    });

    const body = el('tbody');
    rows.forEach((m) => {
      const pr = m.profile || {}, ad = m.admin || {};
      const tr = el('tr', { class: 'link', tabindex: '0' },
        el('td', {}, pr.name || ''), el('td', {}, age(pr) ?? ''), el('td', {}, pr.region || ''), el('td', {}, pr.height || ''),
        el('td', {}, pr.income != null ? pr.income.toLocaleString() : ''), el('td', {}, pr.jobDetails || ''),
        el('td', {}, badge(ad.status || '', memberStatusLabel(ad.status))), el('td', {}, ad.assigned || ''), el('td', {}, KC.fmtTime(m.updatedAt)));
      const open = () => go('#/member/' + m.id);
      tr.addEventListener('click', open); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
      body.append(tr);
    });
    const incomeHead = KF.label(KF.SECTIONS[2].fields.find((f) => f.k === 'income'), g, KC.lang);
    page(el('h1', {}, gender === 'male' ? t('navMen') : t('navWomen')),
      el('nav', { class: 'tabs' }, el('a', { href: '#/members?g=female', class: gender === 'female' ? 'on' : '' }, t('navWomen')),
        el('a', { href: '#/members?g=male', class: gender === 'male' ? 'on' : '' }, t('navMen')),
        el('a', { href: '#/member/new?g=' + gender }, '+ ', t('newMember'))),
      fq, el('p', { class: 'muted' }, rows.length, ' ', t('count')),
      rows.length ? el('div', { class: 'table-wrap' }, el('table', {},
        el('thead', {}, el('tr', {}, [t('name'), t('age'), t('region'), KF.label(KF.SECTIONS[2].fields[0], g, KC.lang), incomeHead,
          KF.label(KF.SECTIONS[2].fields.find((f) => f.k === 'jobDetails'), g, KC.lang), t('status'), KF.label(KF.ADMIN[1], g, KC.lang), t('updated')].map((h) => el('th', {}, h)))), body))
        : el('p', { class: 'muted' }, t('none')));
  }

  async function memberDetail(id) {
    const ref = col('members').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return page(el('p', { class: 'alert' }, t('none')));
    const m = snap.data(), g = gKey(m.gender), pr = m.profile || {}, ad = m.admin || {};
    const adminDl = el('dl', { class: 'view' });
    KF.forGender(KF.ADMIN, g).forEach((f) => { const v = KC.display(f, g, ad[f.k]); if (v) adminDl.append(el('dt', {}, KF.label(f, g, KC.lang)), el('dd', {}, v)); });

    const recs = await ref.collection('records').orderBy('createdAt', 'desc').get();
    const recBox = el('div');
    if (!recs.size) recBox.append(el('p', { class: 'muted' }, t('noRecords')));
    recs.forEach((d) => {
      const r = d.data(), type = KF.RECORD_TYPES[r.type];
      if (!type) return;
      const dl = el('dl', { class: 'view' });
      type.fields.forEach((f) => { const v = KC.display(f, g, (r.data || {})[f.k]); if (v) dl.append(el('dt', {}, f[KC.lang]), el('dd', {}, v)); });
      recBox.append(el('div', { class: 'record' }, el('b', {}, type[KC.lang]), ' ', el('span', { class: 'muted' }, KC.fmtTime(r.createdAt), ' · ', t('by'), ' ', r.by || ''), dl));
    });

    const typeSel = el('select', { id: 'rec-type' }, Object.entries(KF.RECORD_TYPES).map(([k, v]) => el('option', { value: k }, v[KC.lang])));
    const recFields = el('div', { class: 'form-grid' });
    const drawRec = () => recFields.replaceChildren(...KF.RECORD_TYPES[typeSel.value].fields.map((f) => KC.fieldInput(f, g, '', 'r')));
    typeSel.addEventListener('change', drawRec); drawRec();
    const recForm = el('form', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('addRecord')),
      el('label', { class: 'field', for: 'rec-type', style: 'max-width:260px;margin-bottom:12px' }, el('span', {}, t('recordType')), typeSel), recFields,
      el('div', { class: 'actions' }, el('button', { type: 'submit' }, t('save'))));
    recForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = KC.readFields(recFields, KF.RECORD_TYPES[typeSel.value].fields);
      if (!Object.keys(data).length) return;
      try { await ref.collection('records').add({ type: typeSel.value, data, by: user.email || user.uid, createdAt: KC.ts() }); KC.toast(t('saved')); route(); }
      catch (err) { KC.fail(err); }
    });

    const matchHref = '#/members?' + new URLSearchParams(Object.fromEntries(Object.entries({ g: 'male',
      ageMin: pr.prefMinAge, ageMax: pr.prefMaxAge, hMin: pr.prefMinHeight }).filter(([, v]) => v != null && v !== ''))).toString();
    page(el('p', {}, el('a', { href: '#/members?g=' + m.gender }, '← ', m.gender === 'male' ? t('navMen') : t('navWomen'))),
      el('section', { class: 'card' },
        el('h1', {}, pr.name || '', ' ', badge(ad.status || '', memberStatusLabel(ad.status))),
        el('p', { class: 'muted' }, t(m.gender), ' · ', t('age'), ' ', age(pr) ?? '-', ' · ', t('updated'), ' ', KC.fmtTime(m.updatedAt), m.updatedBy ? ' (' + m.updatedBy + ')' : '',
          m.sourceUid ? el('span', {}, ' · ', el('a', { href: '#/app/' + m.sourceUid }, t('fromApp'))) : null),
        el('div', { class: 'photo' }, await photoBox(m.photoKey)),
        el('div', { class: 'actions' }, el('a', { class: 'button', href: '#/member/' + id + '/edit' }, t('edit')),
          m.gender === 'female' ? el('a', { class: 'button secondary', href: matchHref }, t('matchMen')) : null,
          el('button', { type: 'button', class: 'danger', onclick: () => deleteMember(id, m) }, t('delete')))),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('adminSection')), adminDl),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('records')), recBox),
      recForm,
      el('section', { class: 'card' }, profileView(pr, g)));
  }

  async function deleteMember(id, m) {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const ref = col('members').doc(id);
      const recs = await ref.collection('records').get();
      await Promise.all(recs.docs.map((d) => d.ref.delete()));
      if (m.photoKey) await col('photos').doc(m.photoKey).delete();
      await ref.delete();
      KC.toast(t('saved'));
      go('#/members?g=' + m.gender);
    } catch (e) { KC.fail(e); }
  }

  async function memberForm(id) {
    const ref = id ? col('members').doc(id) : col('members').doc();
    let m = { gender: params().get('g') === 'male' ? 'male' : 'female', profile: {}, admin: { status: 'active' }, photoKey: null };
    if (id) { const s = await ref.get(); if (!s.exists) return page(el('p', { class: 'alert' }, t('none'))); m = s.data(); }
    const g = gKey(m.gender);
    const photoKey = m.photoKey || 'm_' + ref.id;
    let photo = null, photoChanged = false;
    if (m.photoKey) { const p = await col('photos').doc(m.photoKey).get(); if (p.exists) photo = p.data().data; }

    const f = el('form', { class: 'card', novalidate: true });
    f.append(el('h1', {}, id ? t('memberEdit') : t('newMember'), ' — ', t(m.gender)));
    const photoWrap = el('div', { class: 'photo' });
    const fileInput = el('input', { type: 'file', accept: 'image/jpeg,image/png', id: 'photo-file', style: 'max-width:260px' });
    const drawPhoto = () => photoWrap.replaceChildren(photo ? el('img', { src: photo, alt: t('photo') }) : el('div', { class: 'ph' }, t('photo')),
      el('div', {}, el('label', { for: 'photo-file' }, t('photoPick')), fileInput,
        photo ? el('div', {}, el('button', { type: 'button', class: 'danger', style: 'margin-top:8px', onclick: () => { photo = null; photoChanged = true; fileInput.value = ''; drawPhoto(); } }, t('photoRemove'))) : null));
    fileInput.addEventListener('change', async () => {
      try { photo = await KC.resizePhoto(fileInput.files[0]); photoChanged = true; drawPhoto(); }
      catch (e) { KC.toast(t('photoBad'), true); fileInput.value = ''; }
    });
    drawPhoto();
    f.append(photoWrap);

    const adminGrid = el('div', { class: 'form-grid' }, KF.forGender(KF.ADMIN, g).map((fd) => KC.fieldInput(fd, g, (m.admin || {})[fd.k], 'a')));
    f.append(el('h2', {}, t('adminSection')), adminGrid);
    // Staff may register members without every self-registration field; only the name is required here.
    const profileFields = KF.SECTIONS.flatMap((s) => KF.forGender(s.fields, g)).map((fd) => Object.assign({}, fd, { req: fd.k === 'name' }));
    const profileWrap = el('div');
    KF.SECTIONS.forEach((s) => profileWrap.append(el('h2', {}, s[KC.lang]),
      el('div', { class: 'form-grid' }, profileFields.filter((fd) => KF.forGender(s.fields, g).some((x) => x.k === fd.k)).map((fd) => KC.fieldInput(fd, g, (m.profile || {})[fd.k], 'p')))));
    f.append(profileWrap);
    const saveBtn = el('button', { type: 'submit' }, t('save'));
    f.append(el('div', { class: 'actions' }, saveBtn, el('a', { class: 'button secondary', href: id ? '#/member/' + id : '#/members?g=' + m.gender }, t('cancel'))));

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const profile = KC.readFields(profileWrap, profileFields);
      const miss = KC.missing(profile, profileFields, g);
      if (miss.length) return KC.toast(t('requiredMissing') + miss.join('、'), true);
      const admin = KC.readFields(adminGrid, KF.forGender(KF.ADMIN, g));
      saveBtn.disabled = true;
      try {
        if (photoChanged) {
          if (photo) await col('photos').doc(photoKey).set({ data: photo, updatedAt: KC.ts() });
          else await col('photos').doc(photoKey).delete();
        }
        const body = { profile, admin, photoKey: photo ? photoKey : null, updatedAt: KC.ts(), updatedBy: user.email || user.uid };
        if (id) await ref.update(body);
        else await ref.set(Object.assign({ gender: m.gender, sourceUid: null, createdAt: KC.ts() }, body));
        KC.toast(t('saved'));
        go('#/member/' + ref.id);
      } catch (err) { KC.fail(err); saveBtn.disabled = false; }
    });
    page(f);
  }

  window.addEventListener('hashchange', route);
  route();
  if (KC.auth) {
    KC.auth.getRedirectResult().catch(KC.fail);
    KC.auth.onAuthStateChanged(async (u) => {
      user = u; isAdmin = false;
      if (u) {
        try { isAdmin = (await col('admins').doc(u.uid).get()).exists; } catch (e) { isAdmin = false; }
      }
      route();
    });
  }
})();
