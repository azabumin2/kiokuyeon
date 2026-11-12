// Member self-registration: a man or woman signs in with Google and submits their own profile.
// Staff review it in the admin screen (admin.html).
(function () {
  'use strict';
  const { el, t } = KC;
  KC.addStrings({
    heroTitle: { ja: '会員登録のご案内', ko: '회원 등록 안내' },
    heroText: { ja: 'Googleアカウントでログインし、ご本人のプロフィールをご登録ください。担当スタッフが内容を確認のうえご連絡いたします。', ko: 'Google 계정으로 로그인한 뒤 본인 프로필을 등록해 주세요. 담당자가 내용을 확인한 후 연락드립니다.' },
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
    signedInAs: { ja: 'ログイン中：', ko: '로그인: ' },
  });

  const app = document.getElementById('app');
  let user = null, appDoc = null, photo = null;

  function header() {
    return el('header', { class: 'top' }, el('div', { class: 'top-inner' },
      el('a', { class: 'brand', href: './' }, t('brand'), el('small', {}, t('tagline'))),
      el('span', { class: 'spacer' }),
      KC.langSwitch(render),
      user ? el('button', { type: 'button', class: 'secondary', onclick: () => KC.auth.signOut() }, t('logout')) : null));
  }
  function page(...children) {
    app.replaceChildren(header(), el('main', { class: 'narrow' }, ...children),
      el('footer', {}, '© ', t('brand'), ' · ', el('a', { href: 'admin.html' }, t('adminLink'))));
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
    if (!KC.configured) return page(el('p', { class: 'alert' }, t('notConfigured')));
    if (!user) {
      return page(el('section', { class: 'card hero' },
        el('h1', {}, t('heroTitle')), el('p', {}, t('heroText')),
        el('button', { type: 'button', onclick: () => KC.signIn().catch(KC.fail) }, t('login')),
        el('p', { class: 'muted', style: 'margin-top:1.4em;font-size:.88rem' }, t('privacyNote'))));
    }
    if (!appDoc) return chooseGender();
    return statusView();
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
    page(
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
        await load();
        KC.toast(t('saved'));
        render();
        window.scrollTo(0, 0);
      } catch (err) { KC.fail(err); submitBtn.disabled = false; }
    });
    page(f);
    window.scrollTo(0, 0);
  }

  render();
  if (KC.auth) {
    KC.auth.getRedirectResult().catch(KC.fail);
    KC.auth.onAuthStateChanged(async (u) => {
      user = u; appDoc = null; photo = null;
      if (u) {
        page(el('p', { class: 'muted' }, t('loading')));
        try { await load(); } catch (e) { KC.fail(e); }
      }
      render();
    });
  }
})();
