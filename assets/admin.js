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
    navInq: { ja: '問い合わせ・相談', ko: '문의·상담' },
    navIntros: { ja: '紹介', ko: '소개' },
    newInq: { ja: '未確認の問い合わせ・相談', ko: '미확인 문의·상담' },
    reports: { ja: '未確認の通報', ko: '미확인 신고' },
    meetNeeded: { ja: '面会の調整が必要', ko: '만남 조율 필요' },
    kind: { ja: '種類', ko: '종류' },
    subject: { ja: '件名', ko: '제목' },
    body: { ja: '内容', ko: '내용' },
    booking: { ja: '相談の希望', ko: '상담 희망' },
    received: { ja: '受信日時', ko: '받은 일시' },
    inqDetail: { ja: '問い合わせの詳細', ko: '문의 상세' },
    reply: { ja: '会員への返事（会員の画面に表示されます）', ko: '회원에게 보낼 답변（회원 화면에 표시됩니다）' },
    repliedBy: { ja: '返事', ko: '답변' },
    openMember: { ja: '会員情報を開く', ko: '회원 정보 열기' },
    openIntro: { ja: '対象の紹介を開く', ko: '해당 소개 열기' },
    noMemberYet: { ja: '（まだ会員登録されていません）', ko: '（아직 회원으로 등록되지 않았습니다）' },
    tabWaiting: { ja: '回答待ち', ko: '응답 대기' },
    tabDeclined: { ja: '不成立（見送りあり）', ko: '불성립（사양 있음）' },
    tabClosed: { ja: '終了', ko: '종료' },
    introDetail: { ja: '紹介の詳細', ko: '소개 상세' },
    sideA: { ja: '会員A', ko: '회원 A' },
    sideB: { ja: '会員B', ko: '회원 B' },
    response: { ja: '回答', ko: '응답' },
    seen: { ja: '既読', ko: '읽음' },
    unseen: { ja: '未読', ko: '안 읽음' },
    noAccount: { ja: 'アカウントなし（スタッフが本人に確認して入力）', ko: '계정 없음（직원이 본인에게 확인 후 입력）' },
    setResp: { ja: '回答を代理入力', ko: '응답 대리 입력' },
    staffNote: { ja: 'スタッフコメント（両方の会員に表示）', ko: '직원 코멘트（양쪽 회원에게 표시）' },
    outcome: { ja: '結果', ko: '결과' },
    closeIntro: { ja: '結果を記録して終了', ko: '결과를 기록하고 종료' },
    outcomeMissing: { ja: '結果を選んでください。', ko: '결과를 선택해 주세요.' },
    introduce: { ja: 'お相手を紹介する', ko: '상대 소개하기' },
    introduceTitle: { ja: 'お相手の紹介', ko: '상대 소개' },
    introduceHelp: { ja: '活動中・利用停止でない・紹介除外でない・まだ紹介していない異性会員だけが候補に出ます。相手には氏名と連絡先は表示されません。', ko: '활동 중이고, 이용 정지가 아니며, 소개 제외가 아니고, 아직 소개하지 않은 이성 회원만 후보로 나옵니다. 상대에게 이름과 연락처는 표시되지 않습니다.' },
    candidates: { ja: '候補', ko: '후보' },
    pickOne: { ja: '紹介するお相手を選んでください。', ko: '소개할 상대를 선택해 주세요.' },
    sendIntro: { ja: 'この内容で紹介する', ko: '이 내용으로 소개' },
    introSent: { ja: '紹介しました。', ko: '소개했습니다.' },
    cardPreview: { ja: '相手の会員に表示される項目：写真・年齢・地域・身長・職業・趣味・性格・語学・居住希望（紹介の魅力はスタッフコメントでお伝えください）', ko: '상대 회원에게 표시되는 항목: 사진·나이·지역·키·직업·취미·성격·어학·거주 희망（소개 포인트는 직원 코멘트로 전해 주세요）' },
    suspend: { ja: '利用停止', ko: '이용 정지' },
    unsuspend: { ja: '利用停止を解除', ko: '이용 정지 해제' },
    suspendReason: { ja: '利用停止の理由（記録に残ります）', ko: '이용 정지 사유（기록에 남습니다）' },
    reasonRequired: { ja: '理由を入力してください。', ko: '사유를 입력해 주세요.' },
    confirmUnsuspend: { ja: '利用停止を解除しますか？', ko: '이용 정지를 해제할까요?' },
    suspendedNote: { ja: 'この会員は利用停止中です。', ko: '이 회원은 이용 정지 중입니다.' },
    noIntroTitle: { ja: '紹介しない相手', ko: '소개하지 않을 상대' },
    noIntroNone: { ja: '指定はありません。', ko: '지정된 상대가 없습니다.' },
    noIntroAdd: { ja: '追加', ko: '추가' },
    remove: { ja: '解除', ko: '해제' },
    timeline: { ja: '活動履歴', ko: '활동 이력' },
    noTimeline: { ja: '履歴はまだありません。', ko: '아직 이력이 없습니다.' },
    staff: { ja: 'スタッフ', ko: '직원' },
    member: { ja: '本人', ko: '본인' },
    ev_approved: { ja: '登録申請を承認', ko: '등록 신청 승인' },
    ev_intro: { ja: '紹介：', ko: '소개: ' },
    ev_suspend: { ja: '利用停止：', ko: '이용 정지: ' },
    ev_unsuspend: { ja: '利用停止を解除', ko: '이용 정지 해제' },
    ev_noIntroAdd: { ja: '紹介除外に追加：', ko: '소개 제외 추가: ' },
    ev_noIntroRemove: { ja: '紹介除外を解除：', ko: '소개 제외 해제: ' },
    ev_introClosed: { ja: '紹介を終了：', ko: '소개 종료: ' },
    ev_resp: { ja: '紹介に回答：', ko: '소개에 응답: ' },
    ev_inquiry: { ja: '問い合わせ：', ko: '문의: ' },
    ev_reply: { ja: '問い合わせに返事：', ko: '문의에 답변: ' },
  });

  const app = document.getElementById('app');
  let user = null, isAdmin = false;
  const col = (name) => KC.db.collection(name);
  const gKey = (gender) => (gender === 'male' ? 'm' : 'f');
  const STATUS_FIELD = KF.ADMIN.find((f) => f.k === 'status');

  // Live counts for the header badges (kept up to date by Firestore listeners).
  let liveInq = [], liveIntros = [], unsub = [];
  const isMeet = (x) => x.status === 'open' && x.respA === 'yes' && x.respB === 'yes';
  const newCount = () => liveInq.length;
  const reportCount = () => liveInq.filter((q) => q.kind === 'report').length;
  const meetCount = () => liveIntros.filter(isMeet).length;
  function listen() {
    unsub.forEach((u) => u()); unsub = [];
    if (!isAdmin) return;
    const refresh = () => {
      KC.titleCount(newCount() + meetCount());
      const h = app.querySelector('header.top');
      if (h) h.replaceWith(header());
      if (['', '#/', '#'].includes(location.hash) && app.querySelector('.stats')) dashboard().catch(KC.fail);
    };
    unsub.push(col('inquiries').where('status', '==', 'new').onSnapshot((s) => { liveInq = s.docs.map((d) => d.data()); refresh(); }, (e) => console.warn(e)));
    unsub.push(col('intros').where('status', '==', 'open').onSnapshot((s) => { liveIntros = s.docs.map((d) => d.data()); refresh(); }, (e) => console.warn(e)));
  }

  function header() {
    const nav = isAdmin ? [['#/', t('navHome')], ['#/apps', t('navApps')], ['#/inquiries', t('navInq'), KC.count(newCount(), reportCount() > 0)],
      ['#/intros', t('navIntros'), KC.count(meetCount())], ['#/members?g=female', t('navWomen')], ['#/members?g=male', t('navMen')]] : [];
    return el('header', { class: 'top' }, el('div', { class: 'top-inner' },
      el('a', { class: 'brand', href: '#/' }, t('brand'), el('small', {}, t('adminTitle'))),
      el('nav', { class: 'tabs', style: 'margin:0' }, nav.map(([h, label, n]) => {
        const cur = location.hash || '#/';
        return el('a', { href: h, class: (h === '#/' ? cur === '#/' : cur.startsWith(h)) ? 'on' : '' }, label, n);
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
      if (parts[0] === 'member' && parts[1] && parts[2] === 'intro') return await introduceForm(parts[1]);
      if (parts[0] === 'inquiries') return await inquiryList();
      if (parts[0] === 'inquiry' && parts[1]) return await inquiryDetail(parts[1]);
      if (parts[0] === 'intros') return await introList();
      if (parts[0] === 'intro' && parts[1]) return await introDetail(parts[1]);
      if (parts[0] === 'member' && parts[1]) return await memberDetail(parts[1]);
      go('#/');
    } catch (e) { KC.fail(e); page(el('p', { class: 'alert' }, t('error'))); }
  }

  // ---------- Dashboard ----------
  async function dashboard() {
    const [apps, members] = await Promise.all([col('applications').get(), col('members').get()]);
    const a = apps.docs.map((d) => d.data()), m = members.docs.map((d) => d.data());
    const stat = (n, label, href, red) => el('a', { class: 'stat', href, style: red && n ? 'border-color:var(--bad);color:var(--bad)' : null }, el('b', {}, String(n)), label);
    page(el('h1', {}, t('adminTitle')), el('div', { class: 'stats' },
      stat(reportCount(), t('reports'), '#/inquiries?status=new', true),
      stat(newCount(), t('newInq'), '#/inquiries?status=new'),
      stat(meetCount(), t('meetNeeded'), '#/intros?tab=meet'),
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
    logActivity(batch, memberRef.id, 'approved');
    await batch.commit();
  }

  // Staff actions are written to members/{id}/activity; the text is rendered in the viewer's language.
  function logActivity(batch, memberId, type, detail) {
    batch.set(col('members').doc(memberId).collection('activity').doc(),
      { type, detail: detail || '', by: user.email || user.uid, at: KC.ts() });
  }
  function rows(items, heads, onOpen) {
    const body = el('tbody');
    items.forEach((it) => {
      const tr = el('tr', { class: 'link', tabindex: '0' }, it.cells.map((c) => el('td', {}, c)));
      const open = () => onOpen(it);
      tr.addEventListener('click', open); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
      body.append(tr);
    });
    return items.length ? el('div', { class: 'table-wrap' }, el('table', {}, el('thead', {}, el('tr', {}, heads.map((h) => el('th', {}, h)))), body))
      : el('p', { class: 'muted' }, t('none'));
  }
  const respBadge = (v) => badge(v || 'pending', KF.opt(KF.RESP, v || 'pending', KC.lang));

  // ---------- Inquiries / bookings / reports ----------
  async function inquiryList() {
    const filter = params().get('status') || 'new';
    const snap = await col('inquiries').orderBy('createdAt', 'desc').get();
    const list = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))
      .filter((q) => filter === 'all' || q.status === filter)
      .sort((x, y) => (y.kind === 'report' && y.status !== 'done') - (x.kind === 'report' && x.status !== 'done'));
    const tabs = KF.INQUIRY_STATUS.map((s) => [s.code, s[KC.lang]]).concat([['all', t('all')]]);
    page(el('h1', {}, t('navInq')),
      el('nav', { class: 'tabs' }, tabs.map(([k, label]) => el('a', { href: '#/inquiries?status=' + k, class: k === filter ? 'on' : '' }, label))),
      rows(list.map((q) => ({ id: q.id, cells: [
        badge(q.kind === 'report' ? 'report' : 'open', KF.opt(KF.INQUIRY_KINDS, q.kind, KC.lang)), q.name || '', t(q.gender), q.subject || (q.body || '').slice(0, 30),
        q.kind === 'booking' && q.booking ? (q.booking.date || '') + ' ' + (q.booking.time || '') : '',
        badge(q.status, KF.opt(KF.INQUIRY_STATUS, q.status, KC.lang)), KC.fmtTime(q.createdAt)] })),
      [t('kind'), t('name'), t('gender'), t('subject'), t('booking'), t('status'), t('received')], (it) => go('#/inquiry/' + it.id)));
  }

  async function memberIdForUid(uid) {
    const s = await col('members').where('sourceUid', '==', uid).limit(1).get();
    return s.empty ? null : s.docs[0].id;
  }

  async function inquiryDetail(id) {
    const ref = col('inquiries').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return page(el('p', { class: 'alert' }, t('none')));
    const q = snap.data(), b = q.booking || {};
    const memberId = await memberIdForUid(q.uid);
    const reply = el('textarea', { id: 'inq-reply', rows: 5, maxlength: 2000 });
    reply.value = q.reply || '';
    const stSel = el('select', { id: 'inq-status' }, KF.INQUIRY_STATUS.map((s) => el('option', { value: s.code, selected: s.code === (q.status === 'new' ? 'open' : q.status) }, s[KC.lang])));
    const saveBtn = el('button', { type: 'button' }, t('save'));
    saveBtn.addEventListener('click', async () => {
      const r = reply.value.trim();
      const body = { status: stSel.value, updatedAt: KC.ts() };
      if (r !== (q.reply || '')) Object.assign(body, { reply: r, repliedAt: KC.ts(), memberSeen: !r });
      saveBtn.disabled = true;
      try {
        const batch = KC.db.batch();
        batch.update(ref, body);
        if (body.reply && memberId) logActivity(batch, memberId, 'reply', q.subject ? '「' + q.subject + '」' : '');
        await batch.commit();
        KC.toast(t('saved')); go('#/inquiries?status=' + (q.status === 'new' ? 'new' : stSel.value)); }
      catch (e) { KC.fail(e); saveBtn.disabled = false; }
    });
    const dl = el('dl', { class: 'view' },
      el('dt', {}, t('kind')), el('dd', {}, badge(q.kind === 'report' ? 'report' : 'open', KF.opt(KF.INQUIRY_KINDS, q.kind, KC.lang))),
      el('dt', {}, t('name')), el('dd', {}, q.name || '', '（', t(q.gender), '） ', memberId ? el('a', { href: '#/member/' + memberId }, t('openMember')) : el('span', { class: 'muted' }, t('noMemberYet'))),
      el('dt', {}, t('received')), el('dd', {}, KC.fmtTime(q.createdAt)),
      q.kind === 'booking' ? [el('dt', {}, t('booking')), el('dd', {}, (b.date || '') + ' ' + (b.time || '') + ' · ' + KF.opt(KF.BOOKING_METHODS, b.method, KC.lang))] : null,
      q.introId ? [el('dt', {}, t('navIntros')), el('dd', {}, el('a', { href: '#/intro/' + q.introId }, t('openIntro')))] : null,
      el('dt', {}, t('subject')), el('dd', {}, q.subject || ''),
      el('dt', {}, t('body')), el('dd', {}, q.body || ''),
      q.repliedAt ? [el('dt', {}, t('repliedBy')), el('dd', {}, KC.fmtTime(q.repliedAt))] : null);
    page(el('p', {}, el('a', { href: '#/inquiries' }, '← ', t('navInq'))),
      el('section', { class: 'card' }, el('h1', {}, t('inqDetail')), dl,
        el('label', { class: 'field wide', for: 'inq-reply', style: 'margin-top:16px' }, el('span', {}, t('reply')), reply),
        el('label', { class: 'field', for: 'inq-status', style: 'max-width:260px;margin-top:12px' }, el('span', {}, t('status')), stSel),
        el('div', { class: 'actions' }, saveBtn,
          el('button', { type: 'button', class: 'danger', onclick: async () => {
            if (!confirm(t('confirmDelete'))) return;
            try { await ref.delete(); go('#/inquiries'); } catch (e) { KC.fail(e); }
          } }, t('delete')))));
  }

  // ---------- Introductions ----------
  function introTab(x) {
    if (x.status === 'closed') return 'closed';
    if (isMeet(x)) return 'meet';
    if (x.respA === 'no' || x.respB === 'no') return 'declined';
    return 'waiting';
  }
  async function memberNames() {
    const s = await col('members').get();
    const map = {};
    s.docs.forEach((d) => { map[d.id] = (d.data().profile || {}).name || ''; });
    return map;
  }
  async function introList() {
    const tab = params().get('tab') || 'waiting';
    const [snap, names] = await Promise.all([col('intros').orderBy('createdAt', 'desc').get(), memberNames()]);
    const list = snap.docs.map((d) => Object.assign({ id: d.id }, d.data())).filter((x) => tab === 'all' || introTab(x) === tab);
    list.forEach((x) => { x.a.name = names[x.a.memberId] || '-'; x.b.name = names[x.b.memberId] || '-'; });
    const tabs = [['waiting', t('tabWaiting')], ['meet', t('meetNeeded')], ['declined', t('tabDeclined')], ['closed', t('tabClosed')], ['all', t('all')]];
    page(el('h1', {}, t('navIntros')),
      el('nav', { class: 'tabs' }, tabs.map(([k, label]) => el('a', { href: '#/intros?tab=' + k, class: k === tab ? 'on' : '' }, label))),
      rows(list.map((x) => ({ id: x.id, cells: [x.a.name || '', respBadge(x.respA), x.b.name || '', respBadge(x.respB),
        x.status === 'closed' ? KF.opt(KF.INTRO_OUTCOMES, x.outcome, KC.lang) : '', KC.fmtTime(x.createdAt)] })),
      [t('sideA'), t('response'), t('sideB'), t('response'), t('outcome'), t('updated')], (it) => go('#/intro/' + it.id)));
  }

  async function introDetail(id) {
    const ref = col('intros').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return page(el('p', { class: 'alert' }, t('none')));
    const x = snap.data();
    const names = await memberNames();
    x.a.name = names[x.a.memberId] || '-'; x.b.name = names[x.b.memberId] || '-';
    const act = async (fn) => { try { await fn(); KC.toast(t('saved')); route(); } catch (e) { KC.fail(e); } };
    const sideBox = (s) => {
      const p = x[s.toLowerCase()], resp = x['resp' + s];
      const sel = el('select', { id: 'resp-' + s }, KF.RESP.filter((r) => r.code !== 'na').map((r) => el('option', { value: r.code, selected: r.code === resp }, r[KC.lang])));
      return el('section', { class: 'card' },
        el('h2', { style: 'margin-top:0' }, t('side' + s), '：', el('a', { href: '#/member/' + p.memberId }, p.name || ''), '（', t(p.gender), '）'),
        el('p', {}, t('response'), '：', respBadge(resp), ' ', x['resp' + s + 'At'] ? el('span', { class: 'muted' }, KC.fmtTime(x['resp' + s + 'At'])) : null,
          p.uid ? el('span', { class: 'muted' }, ' · ', x['seen' + s] ? t('seen') : t('unseen')) : null),
        p.uid ? null : el('p', { class: 'muted' }, t('noAccount')),
        x.status === 'open' ? el('div', { class: 'actions' },
          el('label', { class: 'field', for: 'resp-' + s, style: 'min-width:200px' }, el('span', {}, t('setResp')), sel),
          el('button', { type: 'button', class: 'secondary', style: 'align-self:flex-end', onclick: () => act(() => ref.update({ ['resp' + s]: sel.value, ['resp' + s + 'At']: KC.ts() })) }, t('save'))) : null);
    };
    const outSel = el('select', { id: 'intro-outcome' }, el('option', { value: '' }, '—'), KF.INTRO_OUTCOMES.map((o) => el('option', { value: o.code, selected: o.code === x.outcome }, o[KC.lang])));
    const close = () => {
      if (!outSel.value) return KC.toast(t('outcomeMissing'), true);
      act(async () => {
        const batch = KC.db.batch();
        batch.update(ref, { status: 'closed', outcome: outSel.value, closedAt: KC.ts() });
        const label = KF.opt(KF.INTRO_OUTCOMES, outSel.value, 'ja') + ' / ' + KF.opt(KF.INTRO_OUTCOMES, outSel.value, 'ko');
        logActivity(batch, x.a.memberId, 'introClosed', x.b.name + ' — ' + label);
        logActivity(batch, x.b.memberId, 'introClosed', x.a.name + ' — ' + label);
        await batch.commit();
      });
    };
    page(el('p', {}, el('a', { href: '#/intros' }, '← ', t('navIntros'))),
      el('section', { class: 'card' }, el('h1', {}, t('introDetail')),
        el('p', {}, badge(introTab(x) === 'meet' ? 'yes' : introTab(x) === 'declined' ? 'no' : x.status === 'closed' ? 'closed' : 'pending',
          introTab(x) === 'meet' ? t('meetNeeded') : introTab(x) === 'declined' ? t('tabDeclined') : x.status === 'closed' ? t('tabClosed') + '：' + KF.opt(KF.INTRO_OUTCOMES, x.outcome, KC.lang) : t('tabWaiting')),
          ' ', el('span', { class: 'muted' }, KC.fmtTime(x.createdAt))),
        x.staffNote ? el('div', { class: 'staffnote' }, el('b', {}, t('staffNote')), el('br'), x.staffNote) : null,
        x.status === 'open' ? el('div', { class: 'actions' },
          el('label', { class: 'field', for: 'intro-outcome', style: 'min-width:220px' }, el('span', {}, t('outcome')), outSel),
          el('button', { type: 'button', style: 'align-self:flex-end', onclick: close }, t('closeIntro'))) : null),
      sideBox('A'), sideBox('B'));
  }

  // Partner summary shown to the other member: no name, no contact details.
  async function makeCard(m, viewerUid) {
    const pr = m.profile || {}, profile = {};
    KF.INTRO_CARD_FIELDS.forEach((k) => { if (pr[k] != null && pr[k] !== '') profile[k] = pr[k]; });
    let photo = null;
    if (m.photoKey) { const p = await col('photos').doc(m.photoKey).get(); if (p.exists) photo = p.data().data; }
    return { viewerUid, gender: m.gender, age: KC.ageFrom(pr.birth), region: pr.region || '', profile, photo, createdAt: KC.ts() };
  }

  async function introduceForm(id) {
    const [meSnap, allSnap, introSnap] = await Promise.all([col('members').doc(id).get(), col('members').get(), col('intros').get()]);
    if (!meSnap.exists) return page(el('p', { class: 'alert' }, t('none')));
    const me = Object.assign({ id }, meSnap.data());
    const done = new Set();
    introSnap.docs.forEach((d) => { const x = d.data(); if (x.a.memberId === id) done.add(x.b.memberId); if (x.b.memberId === id) done.add(x.a.memberId); });
    const mine = new Set(me.noIntro || []);
    const cands = allSnap.docs.map((d) => Object.assign({ id: d.id }, d.data())).filter((m) => m.gender !== me.gender
      && (m.admin || {}).status === 'active' && !mine.has(m.id) && !(m.noIntro || []).includes(id) && !done.has(m.id))
      .sort((x, y) => (age(x.profile) ?? 999) - (age(y.profile) ?? 999));
    const pr = me.profile || {};
    const filter = el('input', { type: 'search', id: 'cand-q', placeholder: t('q') });
    const list = el('div', { class: 'table-wrap' });
    const draw = () => {
      const q = filter.value.trim().toLowerCase();
      const body = el('tbody');
      cands.filter((m) => !q || [m.profile && m.profile.name, m.profile && m.profile.region, m.profile && m.profile.jobDetails].join(' ').toLowerCase().includes(q)).forEach((m) => {
        const p = m.profile || {}, rid = 'cand-' + m.id;
        body.append(el('tr', {}, el('td', {}, el('input', { type: 'radio', name: 'cand', value: m.id, id: rid, style: 'width:auto' })),
          el('td', {}, el('label', { for: rid }, p.name || '')), el('td', {}, age(p) ?? ''), el('td', {}, p.region || ''), el('td', {}, p.height || ''),
          el('td', {}, p.jobDetails || ''), el('td', {}, m.sourceUid ? '' : t('noAccount').split('（')[0])));
      });
      list.replaceChildren(el('table', {}, el('thead', {}, el('tr', {}, ['', t('name'), t('age'), t('region'), KF.field('height')[KC.lang], KF.field('jobDetails')[KC.lang], ''].map((h) => el('th', {}, h)))), body));
    };
    filter.addEventListener('input', draw); draw();
    const note = el('textarea', { id: 'intro-note', rows: 4, maxlength: 1000 });
    const btn = el('button', { type: 'button' }, t('sendIntro'));
    btn.addEventListener('click', async () => {
      const picked = list.querySelector('input[name="cand"]:checked');
      if (!picked) return KC.toast(t('pickOne'), true);
      const other = cands.find((m) => m.id === picked.value);
      btn.disabled = true;
      try {
        const ref = col('intros').doc();
        // The intro document is readable by both members, so it carries no names (staff resolve them from members).
        const side = (m) => ({ memberId: m.id, uid: m.sourceUid || null, gender: m.gender });
        const nameOf = (m) => (m.profile || {}).name || '';
        const uidA = me.sourceUid || null, uidB = other.sourceUid || null;
        const batch = KC.db.batch();
        batch.set(ref, { a: side(me), b: side(other), uidA, uidB, uids: [uidA, uidB].filter(Boolean),
          respA: uidA ? 'pending' : 'na', respB: uidB ? 'pending' : 'na', seenA: false, seenB: false,
          staffNote: note.value.trim(), status: 'open', createdAt: KC.ts() });
        if (uidA) batch.set(col('introCards').doc(ref.id + '_a'), await makeCard(other, uidA));
        if (uidB) batch.set(col('introCards').doc(ref.id + '_b'), await makeCard(me, uidB));
        logActivity(batch, me.id, 'intro', nameOf(other));
        logActivity(batch, other.id, 'intro', nameOf(me));
        await batch.commit();
        KC.toast(t('introSent'));
        go('#/intro/' + ref.id);
      } catch (e) { KC.fail(e); btn.disabled = false; }
    });
    page(el('p', {}, el('a', { href: '#/member/' + id }, '← ', pr.name || '')),
      el('section', { class: 'card' }, el('h1', {}, t('introduceTitle'), '：', pr.name || '', '（', t(me.gender), '・', t('age'), ' ', age(pr) ?? '-', '）'),
        el('p', { class: 'muted' }, t('introduceHelp')),
        el('p', { class: 'muted' }, KF.field('prefMinAge')[KC.lang], ' ', pr.prefMinAge ?? '-', ' / ', KF.field('prefMaxAge')[KC.lang], ' ', pr.prefMaxAge ?? '-', ' / ', KF.field('prefMinHeight')[KC.lang], ' ', pr.prefMinHeight ?? '-')),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('candidates'), ' (', cands.length, ')'),
        el('label', { class: 'field', for: 'cand-q', style: 'max-width:320px;margin-bottom:12px' }, el('span', {}, t('search')), filter), list),
      el('section', { class: 'card' },
        el('label', { class: 'field wide', for: 'intro-note' }, el('span', {}, t('staffNote')), note),
        el('p', { class: 'muted' }, t('cardPreview')),
        el('div', { class: 'actions' }, btn, el('a', { class: 'button secondary', href: '#/member/' + id }, t('cancel')))));
  }

  // ---------- Suspension / no-intro pairs ----------
  async function setSuspended(id, m, on) {
    const ad = Object.assign({}, m.admin || {});
    let reason = '';
    if (on) {
      reason = (prompt(t('suspendReason')) || '').trim();
      if (!reason) return KC.toast(t('reasonRequired'), true);
    } else if (!confirm(t('confirmUnsuspend'))) return;
    try {
      const batch = KC.db.batch();
      if (on) { ad.prevStatus = ad.status === 'suspended' ? 'active' : (ad.status || 'active'); ad.status = 'suspended'; ad.suspendReason = reason; }
      else { ad.status = ad.prevStatus || 'active'; delete ad.prevStatus; delete ad.suspendReason; }
      batch.update(col('members').doc(id), { admin: ad, updatedAt: KC.ts(), updatedBy: user.email || user.uid });
      if (m.sourceUid) batch.set(col('applications').doc(m.sourceUid), { suspended: on, suspendReason: on ? reason : '' }, { merge: true });
      if (on) {
        const [ia, ib] = await Promise.all([col('intros').where('a.memberId', '==', id).get(), col('intros').where('b.memberId', '==', id).get()]);
        ia.docs.concat(ib.docs).filter((d) => d.data().status === 'open').forEach((d) =>
          batch.update(d.ref, { status: 'closed', outcome: 'suspended', closedAt: KC.ts() }));
      }
      logActivity(batch, id, on ? 'suspend' : 'unsuspend', reason);
      await batch.commit();
      KC.toast(t('saved'));
      route();
    } catch (e) { KC.fail(e); }
  }

  async function setNoIntro(me, other, on) {
    try {
      const batch = KC.db.batch();
      const op = on ? firebase.firestore.FieldValue.arrayUnion : firebase.firestore.FieldValue.arrayRemove;
      batch.update(col('members').doc(me.id), { noIntro: op(other.id) });
      batch.update(col('members').doc(other.id), { noIntro: op(me.id) });
      logActivity(batch, me.id, on ? 'noIntroAdd' : 'noIntroRemove', (other.profile || {}).name || '');
      logActivity(batch, other.id, on ? 'noIntroAdd' : 'noIntroRemove', (me.profile || {}).name || '');
      await batch.commit();
      KC.toast(t('saved'));
      route();
    } catch (e) { KC.fail(e); }
  }

  // Everything that happened to one member, newest first: staff actions, records, introductions and inquiries.
  async function timeline(id, m) {
    const ref = col('members').doc(id);
    const [acts, ia, ib, inq] = await Promise.all([
      ref.collection('activity').get(),
      col('intros').where('a.memberId', '==', id).get(),
      col('intros').where('b.memberId', '==', id).get(),
      m.sourceUid ? col('inquiries').where('uid', '==', m.sourceUid).get() : Promise.resolve({ docs: [] })]);
    const ev = [];
    const names = ia.size + ib.size ? await memberNames() : {};
    const introDocs = ia.docs.concat(ib.docs).map((d) => {
      const x = d.data(); x.id = d.id; x.a.name = names[x.a.memberId] || '-'; x.b.name = names[x.b.memberId] || '-'; return x;
    });
    acts.docs.forEach((d) => { const a = d.data(); ev.push({ at: a.at, who: 'staff', by: a.by, text: t('ev_' + a.type) + (a.detail || ''), href: null }); });
    introDocs.forEach((x) => {
      const s = x.a.memberId === id ? 'A' : 'B', other = s === 'A' ? x.b : x.a;
      if (x['resp' + s + 'At'] && x['resp' + s] !== 'na') ev.push({ at: x['resp' + s + 'At'], who: 'member', text: t('ev_resp') + other.name + ' — ' + KF.opt(KF.RESP, x['resp' + s], KC.lang), href: '#/intro/' + x.id });
    });
    inq.docs.forEach((d) => {
      const q = d.data();
      ev.push({ at: q.createdAt, who: 'member', text: t('ev_inquiry') + KF.opt(KF.INQUIRY_KINDS, q.kind, KC.lang) + (q.subject ? ' 「' + q.subject + '」' : ''), href: '#/inquiry/' + d.id });
    });
    ev.sort((x, y) => KC.millis(y.at) - KC.millis(x.at));
    const box = el('div', { class: 'timeline' });
    if (!ev.length) box.append(el('p', { class: 'muted' }, t('noTimeline')));
    ev.forEach((e) => box.append(el('div', { class: 'record ' + e.who },
      el('span', { class: 'muted' }, KC.fmtTime(e.at), ' · ', e.who === 'staff' ? t('staff') + (e.by ? '（' + e.by + '）' : '') : t('member')), el('br'),
      e.href ? el('a', { href: e.href }, e.text) : e.text)));
    return box;
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
    const suspended = ad.status === 'suspended';

    // Pairs staff decided never to introduce.
    const others = (await col('members').where('gender', '==', m.gender === 'male' ? 'female' : 'male').get()).docs.map((d) => Object.assign({ id: d.id }, d.data()));
    const me = Object.assign({ id }, m), excluded = new Set(m.noIntro || []);
    const noIntroBox = el('div');
    const exList = others.filter((o) => excluded.has(o.id));
    if (!exList.length) noIntroBox.append(el('p', { class: 'muted' }, t('noIntroNone')));
    exList.forEach((o) => noIntroBox.append(el('div', { class: 'item' }, el('a', { href: '#/member/' + o.id }, (o.profile || {}).name || ''), ' ',
      el('button', { type: 'button', class: 'secondary', style: 'min-height:32px;padding:2px 12px', onclick: () => setNoIntro(me, o, false) }, t('remove')))));
    const exSel = el('select', { id: 'nointro-sel' }, el('option', { value: '' }, '—'),
      others.filter((o) => !excluded.has(o.id)).map((o) => el('option', { value: o.id }, ((o.profile || {}).name || '') + '（' + (age(o.profile) ?? '-') + '）')));
    const exAdd = el('button', { type: 'button', class: 'secondary', style: 'align-self:flex-end', onclick: () => {
      const o = others.find((x) => x.id === exSel.value); if (o) setNoIntro(me, o, true);
    } }, t('noIntroAdd'));

    page(el('p', {}, el('a', { href: '#/members?g=' + m.gender }, '← ', m.gender === 'male' ? t('navMen') : t('navWomen'))),
      el('section', { class: 'card' },
        el('h1', {}, pr.name || '', ' ', badge(ad.status || '', memberStatusLabel(ad.status))),
        suspended ? el('p', { class: 'alert' }, t('suspendedNote'), ad.suspendReason ? '（' + ad.suspendReason + '）' : '') : null,
        el('p', { class: 'muted' }, t(m.gender), ' · ', t('age'), ' ', age(pr) ?? '-', ' · ', t('updated'), ' ', KC.fmtTime(m.updatedAt), m.updatedBy ? ' (' + m.updatedBy + ')' : '',
          m.sourceUid ? el('span', {}, ' · ', el('a', { href: '#/app/' + m.sourceUid }, t('fromApp'))) : null),
        el('div', { class: 'photo' }, await photoBox(m.photoKey)),
        el('div', { class: 'actions' }, el('a', { class: 'button', href: '#/member/' + id + '/edit' }, t('edit')),
          !suspended && ad.status === 'active' ? el('a', { class: 'button', href: '#/member/' + id + '/intro' }, t('introduce')) : null,
          m.gender === 'female' ? el('a', { class: 'button secondary', href: matchHref }, t('matchMen')) : null,
          el('button', { type: 'button', class: 'danger', onclick: () => setSuspended(id, m, !suspended) }, suspended ? t('unsuspend') : t('suspend')),
          el('button', { type: 'button', class: 'danger', onclick: () => deleteMember(id, m) }, t('delete')))),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('adminSection')), adminDl),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('timeline')), await timeline(id, m)),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('noIntroTitle')), noIntroBox,
        el('div', { class: 'actions' }, el('label', { class: 'field', for: 'nointro-sel', style: 'min-width:240px' }, el('span', {}, t('noIntroTitle')), exSel), exAdd)),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('records')), recBox),
      recForm,
      el('section', { class: 'card' }, profileView(pr, g)));
  }

  async function deleteMember(id, m) {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const ref = col('members').doc(id);
      const [recs, acts] = await Promise.all([ref.collection('records').get(), ref.collection('activity').get()]);
      await Promise.all(recs.docs.concat(acts.docs).map((d) => d.ref.delete()));
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
        const before = (m.admin || {});
        ['prevStatus', 'suspendReason'].forEach((k) => { if (before[k] != null && admin.status === 'suspended') admin[k] = before[k]; });
        const body = { profile, admin, photoKey: photo ? photoKey : null, updatedAt: KC.ts(), updatedBy: user.email || user.uid };
        // Keep the member's own account in step when staff change suspension from the edit form.
        if (id && m.sourceUid && (before.status === 'suspended') !== (admin.status === 'suspended')) {
          await col('applications').doc(m.sourceUid).set({ suspended: admin.status === 'suspended' }, { merge: true });
        }
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
      liveInq = []; liveIntros = [];
      listen();
      route();
    });
  }
})();
