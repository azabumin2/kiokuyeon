// Member self-registration: a man or woman signs in (Google, Microsoft or e-mail + password) and submits their own profile.
// Staff review it in the admin screen (admin.html).
(function () {
  'use strict';
  const { el, t } = KC;
  KC.addStrings({
    heroTitle: { ja: '会員登録のご案内', ko: '회원 등록 안내' },
    heroText: { ja: 'ログインして、ご本人のプロフィールをご登録ください。担当スタッフが内容を確認のうえご連絡いたします。', ko: '로그인한 뒤 본인 프로필을 등록해 주세요. 담당자가 내용을 확인한 후 연락드립니다.' },
    orEmail: { ja: 'または メールアドレスで', ko: '또는 이메일 주소로' },
    emailNote: { ja: 'Yahoo!メール・Outlook・NAVERメールなど、お使いのメールアドレスで登録できます。', ko: '네이버 메일·다음 메일·Yahoo!·Outlook 등 사용 중인 이메일 주소로 가입할 수 있습니다.' },
    emailLogin: { ja: 'メールアドレスでログイン', ko: '이메일로 로그인' },
    emailSignUp: { ja: 'メールアドレスで新規登録', ko: '이메일로 새로 가입' },
    emailAddr: { ja: 'メールアドレス', ko: '이메일 주소' },
    pw: { ja: 'パスワード', ko: '비밀번호' },
    pwNew: { ja: 'パスワード（8文字以上）', ko: '비밀번호（8자 이상）' },
    pwAgain: { ja: 'パスワード（確認用）', ko: '비밀번호（확인）' },
    pwMismatch: { ja: '確認用のパスワードが一致しません。', ko: '확인용 비밀번호가 일치하지 않습니다.' },
    pwForgot: { ja: 'パスワードを忘れた方', ko: '비밀번호를 잊으셨나요?' },
    pwForgotHint: { ja: 'メールアドレスを入力してから押してください。', ko: '이메일 주소를 입력한 뒤 눌러 주세요.' },
    pwResetSent: { ja: '登録があれば、パスワード再設定のメールを送りました。メールをご確認ください。', ko: '등록된 주소라면 비밀번호 재설정 메일을 보냈습니다. 메일을 확인해 주세요.' },
    toSignUp: { ja: '初めての方：メールアドレスで新規登録', ko: '처음이신가요? 이메일로 새로 가입' },
    toLogin: { ja: '登録済みの方：ログインへ戻る', ko: '이미 가입하셨나요? 로그인으로' },
    verifyTitle: { ja: 'メールアドレスの確認', ko: '이메일 주소 확인' },
    verifyText1: { ja: '確認メールを ', ko: '확인 메일을 ' },
    verifyText2: { ja: ' に送りました。メール内のリンクを開いてから、下の「確認しました」を押してください。', ko: ' 으로 보냈습니다. 메일 안의 링크를 연 뒤 아래 「확인했습니다」를 눌러 주세요.' },
    verifySpam: { ja: 'メールが届かない場合は、迷惑メールフォルダもご確認ください。', ko: '메일이 오지 않으면 스팸함도 확인해 주세요.' },
    verifyDone: { ja: '確認しました', ko: '확인했습니다' },
    verifyResend: { ja: '確認メールを再送する', ko: '확인 메일 다시 보내기' },
    verifySent: { ja: '確認メールを再送しました。', ko: '확인 메일을 다시 보냈습니다.' },
    verifyNotYet: { ja: 'まだ確認が済んでいません。メールのリンクを開いてください。', ko: '아직 확인되지 않았습니다. 메일의 링크를 열어 주세요.' },
    privacyNote: { ja: 'ご登録内容はご本人と当社スタッフだけが閲覧できます。ほかの会員に公開されることはありません。', ko: '등록하신 내용은 본인과 당사 직원만 볼 수 있으며, 다른 회원에게 공개되지 않습니다.' },
    chooseGender: { ja: 'ご登録区分を選んでください', ko: '등록 구분을 선택해 주세요' },
    femaleReg: { ja: '女性会員として登録', ko: '여성 회원으로 등록' },
    maleReg: { ja: '男性会員として登録', ko: '남성 회원으로 등록' },
    formTitle: { ja: 'プロフィール登録', ko: '프로필 등록' },
    formIntro: { ja: '「必須」以外の項目は任意です。分かる範囲でご記入ください。', ko: '「필수」 이외의 항목은 선택입니다. 아는 범위에서 입력해 주세요.' },
    consent: { ja: '入力した個人情報を、結婚相談サービスの提供（スタッフによる確認・ご連絡・お相手のご紹介）のために利用することに同意します。', ko: '입력한 개인정보를 결혼 상담 서비스 제공（직원의 확인·연락·상대 소개）을 위해 이용하는 데 동의합니다.' },
    privacyTitle: { ja: '個人情報の取扱い', ko: '개인정보 처리' },
    consentMissing: { ja: '個人情報の取扱いへの同意が必要です。', ko: '개인정보 처리에 대한 동의가 필요합니다.' },
    submit: { ja: 'この内容で登録する', ko: '이 내용으로 등록' },
    resubmit: { ja: '修正して再提出する', ko: '수정해서 다시 제출' },
    myStatus: { ja: '登録状況', ko: '등록 현황' },
    submittedAt: { ja: '最終更新', ko: '최종 수정' },
    staffNote: { ja: 'スタッフからのお願い', ko: '담당자 요청 사항' },
    editMine: { ja: '登録内容を修正する', ko: '등록 내용 수정' },
    lockedNote: { ja: '登録内容の変更をご希望の場合は担当スタッフにご連絡ください。', ko: '등록 내용 변경을 원하시면 담당자에게 연락해 주세요.' },
    thanks: { ja: 'ご登録ありがとうございました。担当スタッフからのご連絡をお待ちください。', ko: '등록해 주셔서 감사합니다. 담당자의 연락을 기다려 주세요.' },
    adminLink: { ja: 'スタッフ用ページ', ko: '직원용 페이지' },
    siteHome: { ja: 'ホームページ', ko: '홈페이지' },
    signedInAs: { ja: 'ログイン中：', ko: '로그인: ' },
    tabMine: { ja: '登録内容', ko: '내 등록' },
    tabAsk: { ja: 'お問い合わせ・相談', ko: '문의·상담' },
    tabIntros: { ja: 'ご紹介', ko: '소개' },
    askTitle: { ja: 'スタッフへのお問い合わせ・相談の予約', ko: '담당자 문의·상담 예약' },
    askIntro: { ja: 'ご質問、相談のご予約、困ったことの通報はこちらから。スタッフが確認してこの画面でお返事します。', ko: '질문, 상담 예약, 곤란한 일 신고는 여기에서 보내 주세요. 담당자가 확인한 뒤 이 화면에서 답변드립니다.' },
    newAsk: { ja: '新しく送る', ko: '새로 보내기' },
    kind: { ja: '種類', ko: '종류' },
    subject: { ja: '件名', ko: '제목' },
    body: { ja: '内容', ko: '내용' },
    bookDate: { ja: '希望日', ko: '희망 날짜' },
    bookTime: { ja: '希望時間', ko: '희망 시간' },
    bookMethod: { ja: '相談方法', ko: '상담 방법' },
    send: { ja: '送信する', ko: '보내기' },
    sent: { ja: '送信しました。スタッフからの返事をお待ちください。', ko: '보냈습니다. 담당자의 답변을 기다려 주세요.' },
    bodyMissing: { ja: '内容を入力してください。', ko: '내용을 입력해 주세요.' },
    bookingMissing: { ja: '希望日と相談方法を選んでください。', ko: '희망 날짜와 상담 방법을 선택해 주세요.' },
    myAsks: { ja: 'これまでのお問い合わせ', ko: '지금까지 보낸 문의' },
    noAsks: { ja: 'まだお問い合わせはありません。', ko: '아직 보낸 문의가 없습니다.' },
    staffReply: { ja: 'スタッフからの返事', ko: '담당자 답변' },
    waitingReply: { ja: 'スタッフが確認しています。', ko: '담당자가 확인하고 있습니다.' },
    reportAbout: { ja: 'このご紹介について通報', ko: '이 소개에 대해 신고' },
    introsTitle: { ja: 'スタッフからのご紹介', ko: '담당자가 소개한 분' },
    introsIntro: { ja: 'お相手の連絡先は表示されません。お二人とも「会ってみたい」を選ばれたら、スタッフが日程などを調整します。', ko: '상대의 연락처는 표시되지 않습니다. 두 분 모두 「만나 보고 싶음」을 선택하시면 담당자가 일정 등을 조율합니다.' },
    noIntros: { ja: '現在ご紹介はありません。', ko: '현재 소개가 없습니다.' },
    introsAfterApproval: { ja: '登録完了後にご紹介を受けられます。', ko: '등록이 완료된 뒤에 소개를 받으실 수 있습니다.' },
    staffComment: { ja: 'スタッフより', ko: '담당자 코멘트' },
    myAnswer: { ja: 'あなたの回答', ko: '나의 응답' },
    sayYes: { ja: '会ってみたい', ko: '만나 보고 싶음' },
    sayNo: { ja: '今回は見送る', ko: '이번에는 사양' },
    confirmYes: { ja: '「会ってみたい」と回答しますか？回答後は変更できません。', ko: '「만나 보고 싶음」으로 응답할까요? 응답 후에는 바꿀 수 없습니다.' },
    confirmNo: { ja: '今回は見送りますか？回答後は変更できません。', ko: '이번에는 사양할까요? 응답 후에는 바꿀 수 없습니다.' },
    answered: { ja: '回答しました。', ko: '응답했습니다.' },
    introClosed: { ja: 'このご紹介は終了しました', ko: '이 소개는 종료되었습니다' },
    introAt: { ja: 'ご紹介日', ko: '소개일' },
    partner: { ja: 'お相手', ko: '상대' },
    suspendedTitle: { ja: 'ご利用を停止しています', ko: '이용이 정지되었습니다' },
    suspendedText: { ja: '現在このアカウントはご利用いただけません。詳しくは担当スタッフまでお問い合わせください。', ko: '현재 이 계정은 이용하실 수 없습니다. 자세한 내용은 담당자에게 문의해 주세요.' },
  });

  const app = document.getElementById('app');
  let user = null, appDoc = null, photo = null;
  let inquiries = [], intros = [], unsub = [], formOpen = false;
  const cards = {};
  const side = (x) => (x.uidA === user.uid ? 'A' : 'B');
  const tab = () => (['#ask', '#intros'].includes(location.hash) ? location.hash.slice(1) : 'mine');
  const unreadReplies = () => inquiries.filter((x) => x.reply && !x.memberSeen).length;
  const waitingIntros = () => intros.filter((x) => x.status === 'open' && x['resp' + side(x)] === 'pending').length;

  function header() {
    return el('header', { class: 'top' }, el('div', { class: 'top-inner' },
      el('a', { class: 'brand', href: './' }, t('brand'), el('small', {}, t('tagline'))),
      el('span', { class: 'spacer' }),
      KC.langSwitch(render),
      user ? el('button', { type: 'button', class: 'secondary', onclick: () => KC.auth.signOut() }, t('logout')) : null));
  }
  function page(...children) {
    app.replaceChildren(header(), el('main', { class: 'narrow' }, ...children),
      el('footer', {}, '© ', t('brand'), ' · ', el('a', { href: '/' + (KC.lang === 'ko' ? 'ko' : 'ja') + '/' }, t('siteHome')), ' · ', el('a', { href: '/admin.html' }, t('adminLink'))));
  }

  async function load() {
    const [a, p] = await Promise.all([
      KC.db.collection('applications').doc(user.uid).get(),
      KC.db.collection('photos').doc(user.uid).get(),
    ]);
    appDoc = a.exists ? a.data() : null;
    photo = p.exists ? p.data().data : null;
  }

  function render() {
    formOpen = false;
    KC.titleCount(0);
    if (!KC.configured) return page(el('p', { class: 'alert' }, t('notConfigured')));
    if (!user) return loginView();
    if (KC.needsVerification(user)) return verifyView();
    if (!appDoc) return chooseGender();
    if (appDoc.suspended) {
      return page(el('section', { class: 'card' }, el('h1', {}, t('suspendedTitle')), el('p', { class: 'alert' }, t('suspendedText'))));
    }
    KC.titleCount(unreadReplies() + waitingIntros());
    const cur = tab();
    if (cur === 'ask') return askView();
    if (cur === 'intros') return introsView();
    return statusView();
  }

  // Tabs shown above every signed-in page, with the number of unread replies / unanswered introductions.
  function tabs() {
    const cur = tab();
    const item = (hash, label, n) => el('a', { href: hash, class: (hash === '#' + cur || (hash === '#mine' && cur === 'mine')) ? 'on' : '' }, label, KC.count(n));
    return el('nav', { class: 'tabs' }, item('#mine', t('tabMine'), 0), item('#ask', t('tabAsk'), unreadReplies()),
      item('#intros', t('tabIntros'), waitingIntros()));
  }

  // Live updates for the member's own inquiries and introductions.
  function listen() {
    unsub.forEach((u) => u()); unsub = [];
    if (!user || !appDoc || appDoc.suspended || KC.needsVerification(user)) return;
    const refresh = () => { if (!formOpen) render(); };
    unsub.push(KC.db.collection('inquiries').where('uid', '==', user.uid).onSnapshot((s) => {
      inquiries = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort((a, b) => KC.millis(b.createdAt) - KC.millis(a.createdAt));
      refresh();
    }, (e) => console.warn(e)));
    unsub.push(KC.db.collection('intros').where('uids', 'array-contains', user.uid).onSnapshot((s) => {
      intros = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort((a, b) => KC.millis(b.createdAt) - KC.millis(a.createdAt));
      refresh();
    }, (e) => console.warn(e)));
  }

  // ---------- Inquiries / consultation bookings / reports ----------
  function askView() {
    const list = el('div');
    if (!inquiries.length) list.append(el('p', { class: 'muted' }, t('noAsks')));
    inquiries.forEach((q) => {
      const b = q.booking || {};
      list.append(el('div', { class: 'item' },
        el('div', {}, el('span', { class: 'badge ' + (q.kind === 'report' ? 'report' : q.status) }, KF.opt(KF.INQUIRY_KINDS, q.kind, KC.lang)), ' ',
          el('b', {}, q.subject || ''), ' ', el('span', { class: 'muted' }, KC.fmtTime(q.createdAt))),
        q.kind === 'booking' ? el('div', { class: 'muted' }, t('bookDate'), ' ', b.date || '', ' ', b.time || '', ' · ', KF.opt(KF.BOOKING_METHODS, b.method, KC.lang)) : null,
        el('p', { class: 'body' }, q.body),
        q.reply ? el('div', { class: 'reply' }, el('b', {}, t('staffReply')), ' ', el('span', { class: 'muted' }, KC.fmtTime(q.repliedAt)), el('br'), q.reply)
          : el('p', { class: 'muted' }, t('waitingReply'))));
    });
    page(tabs(),
      el('section', { class: 'card' }, el('h1', {}, t('askTitle')), el('p', { class: 'muted' }, t('askIntro')),
        el('button', { type: 'button', onclick: () => askForm('question') }, t('newAsk'))),
      el('section', { class: 'card' }, el('h2', { style: 'margin-top:0' }, t('myAsks')), list));
    // Opening this tab marks staff replies as read.
    inquiries.filter((q) => q.reply && !q.memberSeen).forEach((q) => KC.db.collection('inquiries').doc(q.id).update({ memberSeen: true }).catch((e) => console.warn(e)));
  }

  function askForm(kind, introId) {
    formOpen = true;
    const kindSel = el('select', { id: 'q-kind' }, KF.INQUIRY_KINDS.map((k) => el('option', { value: k.code, selected: k.code === kind }, k[KC.lang])));
    const subject = el('input', { id: 'q-subject', maxlength: 200, value: introId ? t('reportAbout') : '' });
    const body = el('textarea', { id: 'q-body', rows: 6, maxlength: 2000 });
    const date = el('input', { id: 'q-date', type: 'date' });
    const time = el('input', { id: 'q-time', type: 'time', step: 900 });
    const method = el('select', { id: 'q-method' }, el('option', { value: '' }, '—'), KF.BOOKING_METHODS.map((m) => el('option', { value: m.code }, m[KC.lang])));
    const booking = el('div', { class: 'form-grid wide' },
      el('label', { class: 'field', for: 'q-date' }, el('span', {}, t('bookDate'), el('em', {}, t('required'))), date),
      el('label', { class: 'field', for: 'q-time' }, el('span', {}, t('bookTime')), time),
      el('label', { class: 'field', for: 'q-method' }, el('span', {}, t('bookMethod'), el('em', {}, t('required'))), method));
    const showBooking = () => { booking.style.display = kindSel.value === 'booking' ? '' : 'none'; };
    kindSel.addEventListener('change', showBooking); showBooking();
    const btn = el('button', { type: 'submit' }, t('send'));
    const f = el('form', { class: 'card', novalidate: true },
      el('h1', {}, t('newAsk')),
      el('div', { class: 'form-grid' },
        el('label', { class: 'field', for: 'q-kind' }, el('span', {}, t('kind')), kindSel),
        el('label', { class: 'field', for: 'q-subject' }, el('span', {}, t('subject')), subject),
        booking,
        el('label', { class: 'field wide', for: 'q-body' }, el('span', {}, t('body'), el('em', {}, t('required'))), body)),
      el('div', { class: 'actions' }, btn, el('button', { type: 'button', class: 'secondary', onclick: render }, t('cancel'))));
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!body.value.trim()) return KC.toast(t('bodyMissing'), true);
      const doc = { uid: user.uid, kind: kindSel.value, subject: subject.value.trim(), body: body.value.trim(), status: 'new', memberSeen: true,
        name: (appDoc.profile || {}).name || '', gender: appDoc.gender, lang: KC.lang, createdAt: KC.ts(), updatedAt: KC.ts() };
      if (kindSel.value === 'booking') {
        if (!date.value || !method.value) return KC.toast(t('bookingMissing'), true);
        doc.booking = { date: date.value, time: time.value, method: method.value };
      }
      if (introId && kindSel.value === 'report') doc.introId = introId;
      btn.disabled = true;
      try { await KC.db.collection('inquiries').add(doc); KC.toast(t('sent')); location.hash = '#ask'; render(); }
      catch (err) { KC.fail(err); btn.disabled = false; }
    });
    page(tabs(), f);
    window.scrollTo(0, 0);
  }

  // ---------- Introductions ----------
  async function card(x) {
    const key = x.id + '_' + side(x).toLowerCase();
    if (!(key in cards)) {
      const s = await KC.db.collection('introCards').doc(key).get();
      cards[key] = s.exists ? s.data() : null;
    }
    return cards[key];
  }

  async function introsView() {
    const box = el('div');
    page(tabs(), el('section', { class: 'card' }, el('h1', {}, t('introsTitle')), el('p', { class: 'muted' }, t('introsIntro'))), box);
    if (appDoc.status !== 'approved' && !intros.length) return box.append(el('p', { class: 'notice' }, t('introsAfterApproval')));
    if (!intros.length) return box.append(el('p', { class: 'muted' }, t('noIntros')));
    for (const x of intros) {
      const s = side(x), mine = x['resp' + s], c = await card(x);
      const g = c && c.gender === 'male' ? 'm' : 'f';
      const dl = el('dl', { class: 'view' });
      if (c) {
        dl.append(el('dt', {}, t('age')), el('dd', {}, c.age != null ? String(c.age) : '-'), el('dt', {}, KF.field('region')[KC.lang]), el('dd', {}, c.region || '-'));
        KF.INTRO_CARD_FIELDS.forEach((k) => { const f = KF.field(k), v = KC.display(f, g, (c.profile || {})[k]); if (v) dl.append(el('dt', {}, KF.label(f, g, KC.lang)), el('dd', {}, v)); });
      }
      const answer = (v) => async () => {
        if (!confirm(t(v === 'yes' ? 'confirmYes' : 'confirmNo'))) return;
        try { await KC.db.collection('intros').doc(x.id).update({ ['resp' + s]: v, ['resp' + s + 'At']: KC.ts(), ['seen' + s]: true }); KC.toast(t('answered')); }
        catch (e) { KC.fail(e); }
      };
      box.append(el('section', { class: 'card' },
        el('p', { class: 'muted', style: 'margin-top:0' }, t('introAt'), ' ', KC.fmtTime(x.createdAt), x.status === 'closed' ? ' · ' + t('introClosed') : ''),
        el('div', { class: 'introcard' },
          c && c.photo ? el('img', { src: c.photo, alt: t('partner') }) : el('div', { class: 'ph' }, t('photo')),
          el('div', {}, el('h2', { style: 'margin-top:0' }, t('partner'), c ? '（' + t(c.gender) + '）' : ''), dl)),
        x.staffNote ? el('div', { class: 'staffnote' }, el('b', {}, t('staffComment')), el('br'), x.staffNote) : null,
        el('p', {}, t('myAnswer'), '：', el('span', { class: 'badge ' + mine }, KF.opt(KF.RESP, mine, KC.lang))),
        el('div', { class: 'actions' },
          x.status === 'open' && mine === 'pending' ? [el('button', { type: 'button', onclick: answer('yes') }, t('sayYes')),
            el('button', { type: 'button', class: 'secondary', onclick: answer('no') }, t('sayNo'))] : null,
          el('button', { type: 'button', class: 'danger', onclick: () => askForm('report', x.id) }, t('reportAbout')))));
    }
    // Viewing marks new introductions as seen.
    intros.filter((x) => x.status === 'open' && !x['seen' + side(x)]).forEach((x) => KC.db.collection('intros').doc(x.id).update({ ['seen' + side(x)]: true }).catch((e) => console.warn(e)));
  }

  // Sign-in screen: Google, Microsoft (when set up) or any e-mail address with a password.
  let loginMode = 'login';
  function loginView() {
    const busy = (btn, fn) => async () => { btn.disabled = true; try { await fn(); } catch (e) { KC.authFail(e); } btn.disabled = false; };
    const google = el('button', { type: 'button', class: 'wide' }, t('login'));
    google.addEventListener('click', busy(google, () => KC.signIn('google')));
    const ms = KC.authOptions.microsoft ? el('button', { type: 'button', class: 'wide secondary' }, t('loginMicrosoft')) : null;
    if (ms) ms.addEventListener('click', busy(ms, () => KC.signIn('microsoft')));

    const signup = loginMode === 'signup';
    const email = el('input', { type: 'email', id: 'login-email', autocomplete: 'email', required: true });
    const pw = el('input', { type: 'password', id: 'login-pw', autocomplete: signup ? 'new-password' : 'current-password', minlength: 8, required: true });
    const pw2 = signup ? el('input', { type: 'password', id: 'login-pw2', autocomplete: 'new-password', minlength: 8, required: true }) : null;
    const submit = el('button', { type: 'submit', class: 'wide' }, signup ? t('emailSignUp') : t('emailLogin'));
    const f = el('form', { class: 'login-form', novalidate: true },
      el('label', { class: 'field', for: 'login-email' }, el('span', {}, t('emailAddr')), email),
      el('label', { class: 'field', for: 'login-pw' }, el('span', {}, signup ? t('pwNew') : t('pw')), pw),
      pw2 ? el('label', { class: 'field', for: 'login-pw2' }, el('span', {}, t('pwAgain')), pw2) : null,
      submit);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const addr = email.value.trim();
      if (!addr) return KC.toast(t('authBadEmail'), true);
      if (pw.value.length < 8) return KC.toast(t('authWeakPw'), true);
      if (signup && pw.value !== pw2.value) return KC.toast(t('pwMismatch'), true);
      busy(submit, () => (signup ? KC.emailSignUp(addr, pw.value) : KC.emailSignIn(addr, pw.value)))();
    });
    const forgot = el('button', { type: 'button', class: 'linklike' }, t('pwForgot'));
    forgot.addEventListener('click', async () => {
      const addr = email.value.trim();
      if (!addr) { email.focus(); return KC.toast(t('pwForgotHint'), true); }
      try { await KC.resetPassword(addr); KC.toast(t('pwResetSent')); }
      catch (e) { if (e && e.code === 'auth/user-not-found') KC.toast(t('pwResetSent')); else KC.authFail(e); }
    });
    const switchMode = el('button', { type: 'button', class: 'linklike' }, signup ? t('toLogin') : t('toSignUp'));
    switchMode.addEventListener('click', () => { loginMode = signup ? 'login' : 'signup'; render(); });

    page(el('section', { class: 'card hero' },
      el('h1', {}, t('heroTitle')), el('p', {}, t('heroText')),
      el('div', { class: 'login-box' },
        google, ms,
        el('div', { class: 'or' }, el('span', {}, t('orEmail'))),
        el('p', { class: 'muted small' }, t('emailNote')),
        el('h2', {}, signup ? t('emailSignUp') : t('emailLogin')),
        f,
        el('div', { class: 'login-links' }, switchMode, signup ? null : forgot)),
      el('p', { class: 'muted', style: 'margin-top:1.4em;font-size:.88rem' }, t('privacyNote'))));
  }

  // E-mail accounts must open the confirmation link before registering.
  function verifyView() {
    const done = el('button', { type: 'button' }, t('verifyDone'));
    done.addEventListener('click', async () => {
      done.disabled = true;
      try {
        await user.reload();
        user = KC.auth.currentUser;
        if (KC.needsVerification(user)) { KC.toast(t('verifyNotYet'), true); done.disabled = false; return; }
        await user.getIdToken(true); // refresh so the security rules see the confirmed address
        await load(); render(); listen();
      } catch (e) { KC.authFail(e); done.disabled = false; }
    });
    const again = el('button', { type: 'button', class: 'secondary' }, t('verifyResend'));
    again.addEventListener('click', async () => {
      again.disabled = true;
      try { await KC.resendVerification(); KC.toast(t('verifySent')); } catch (e) { KC.authFail(e); }
      setTimeout(() => { again.disabled = false; }, 30000);
    });
    page(el('section', { class: 'card' },
      el('h1', {}, t('verifyTitle')),
      el('p', {}, t('verifyText1'), el('b', {}, user.email || ''), t('verifyText2')),
      el('p', { class: 'muted small' }, t('verifySpam')),
      el('div', { class: 'actions' }, done, again)));
  }

  function chooseGender() {
    page(el('section', { class: 'card' },
      el('h1', {}, t('chooseGender')),
      el('p', { class: 'muted' }, t('signedInAs'), user.email || ''),
      el('div', { class: 'choice' },
        el('button', { type: 'button', onclick: () => form('female') }, t('femaleReg')),
        el('button', { type: 'button', class: 'secondary', onclick: () => form('male') }, t('maleReg')))));
  }

  function statusView() {
    const g = appDoc.gender === 'male' ? 'm' : 'f';
    const editable = ['submitted', 'returned'].includes(appDoc.status);
    const dl = el('dl', { class: 'view' });
    KF.SECTIONS.forEach((s) => KF.forGender(s.fields, g).forEach((f) => {
      const v = KC.display(f, g, (appDoc.profile || {})[f.k]);
      if (v) dl.append(el('dt', {}, KF.label(f, g, KC.lang)), el('dd', {}, v));
    }));
    page(tabs(),
      el('section', { class: 'card' },
        el('h1', {}, t('myStatus')),
        el('p', {}, el('span', { class: 'badge ' + appDoc.status }, t('st_' + appDoc.status)), ' ',
          el('span', { class: 'muted' }, t('submittedAt'), ' ', KC.fmtTime(appDoc.updatedAt))),
        appDoc.status === 'returned' && appDoc.reviewNote ? el('div', { class: 'alert' }, el('b', {}, t('staffNote')), el('br'), appDoc.reviewNote) : null,
        ['submitted', 'reviewing'].includes(appDoc.status) ? el('p', { class: 'notice' }, t('thanks')) : null,
        editable ? el('div', { class: 'actions' }, el('button', { type: 'button', onclick: () => form(appDoc.gender) }, t('editMine')))
          : el('p', { class: 'muted' }, t('lockedNote'))),
      el('section', { class: 'card' },
        el('div', { class: 'photo' }, photo ? el('img', { src: photo, alt: t('photo') }) : el('div', { class: 'ph' }, t('photo'))),
        el('div', { style: 'margin-top:16px' }, dl)));
  }

  function form(gender) {
    formOpen = true;
    const g = gender === 'male' ? 'm' : 'f';
    const profile = Object.assign({ email: user.email || '' }, appDoc ? appDoc.profile : {});
    let newPhoto = photo, photoChanged = false;
    const f = el('form', { class: 'card', novalidate: true });
    f.append(el('h1', {}, t('formTitle'), ' — ', t(gender)), el('p', { class: 'muted' }, t('formIntro')));

    const img = el('div', { class: 'photo' });
    const fileInput = el('input', { type: 'file', accept: 'image/jpeg,image/png', id: 'photo-file', class: 'sr' , style: 'max-width:260px' });
    function drawPhoto() {
      img.replaceChildren(newPhoto ? el('img', { src: newPhoto, alt: t('photo') }) : el('div', { class: 'ph' }, t('photo')),
        el('div', {}, el('label', { for: 'photo-file' }, t('photoPick')), fileInput,
          newPhoto ? el('div', {}, el('button', { type: 'button', class: 'danger', style: 'margin-top:8px', onclick: () => { newPhoto = null; photoChanged = true; fileInput.value = ''; drawPhoto(); } }, t('photoRemove'))) : null));
    }
    fileInput.addEventListener('change', async () => {
      try { newPhoto = await KC.resizePhoto(fileInput.files[0]); photoChanged = true; drawPhoto(); }
      catch (e) { KC.toast(t('photoBad'), true); fileInput.value = ''; }
    });
    drawPhoto();
    f.append(el('h2', {}, t('photo')), img);

    KF.SECTIONS.forEach((s) => {
      const grid = el('div', { class: 'form-grid' });
      KF.forGender(s.fields, g).forEach((fd) => {
        grid.append(KC.fieldInput(fd, g, profile[fd.k]));
        if (fd.k === 'birth') {
          const ageBox = el('input', { id: 'age-auto', readonly: true, value: KC.ageFrom(profile.birth) ?? '' });
          grid.append(el('label', { class: 'field', for: 'age-auto' }, el('span', {}, t('ageAuto')), ageBox));
        }
      });
      f.append(el('h2', {}, s[KC.lang]), grid);
    });
    f.addEventListener('input', (e) => {
      if (e.target.name === 'birth') f.querySelector('#age-auto').value = KC.ageFrom(e.target.value) ?? '';
    });

    const consent = el('input', { type: 'checkbox', id: 'consent', checked: !!(appDoc && appDoc.consent) });
    f.append(el('h2', {}, t('privacyTitle')), el('label', { class: 'check', for: 'consent' }, consent, el('span', {}, t('consent'))));
    const submitBtn = el('button', { type: 'submit' }, appDoc ? t('resubmit') : t('submit'));
    f.append(el('div', { class: 'actions' }, submitBtn,
      el('button', { type: 'button', class: 'secondary', onclick: render }, t('cancel'))));

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = KF.SECTIONS.flatMap((s) => KF.forGender(s.fields, g));
      const values = KC.readFields(f, fields);
      const miss = KC.missing(values, fields, g);
      if (miss.length) return KC.toast(t('requiredMissing') + miss.join('、'), true);
      if (!consent.checked) return KC.toast(t('consentMissing'), true);
      submitBtn.disabled = true;
      try {
        const photoRef = KC.db.collection('photos').doc(user.uid);
        if (photoChanged) {
          if (newPhoto) await photoRef.set({ data: newPhoto, updatedAt: KC.ts() });
          else await photoRef.delete();
        }
        const ref = KC.db.collection('applications').doc(user.uid);
        const body = { profile: values, status: 'submitted', consent: true, lang: KC.lang, hasPhoto: !!newPhoto, updatedAt: KC.ts() };
        if (appDoc) await ref.update(body);
        else await ref.set(Object.assign({ gender, createdAt: KC.ts() }, body));
        const first = !appDoc;
        await load();
        KC.toast(t('saved'));
        if (location.hash !== '#mine') history.replaceState(null, '', '#mine');
        render();
        if (first) listen();
        window.scrollTo(0, 0);
      } catch (err) { KC.fail(err); submitBtn.disabled = false; }
    });
    page(f);
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', () => { if (user && appDoc) render(); });
  render();
  if (KC.auth) {
    KC.auth.getRedirectResult().catch(KC.fail);
    KC.auth.onAuthStateChanged(async (u) => {
      user = u; appDoc = null; photo = null; inquiries = []; intros = [];
      Object.keys(cards).forEach((k) => delete cards[k]);
      if (u && !KC.needsVerification(u)) {
        page(el('p', { class: 'muted' }, t('loading')));
        try { await load(); } catch (e) { KC.fail(e); }
      }
      render();
      listen();
    });
  }
})();
