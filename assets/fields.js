// Field definitions shared by the member registration screen and the admin screen.
// Each value is stored as a stable code; labels are shown in Japanese or Korean.
(function () {
  'use strict';
  const o = (code, ja, ko) => ({ code, ja, ko });
  const YESNO_CHECK = [o('unchecked', '未確認', '미확인'), o('checking', '確認中', '확인 중'), o('ok', '確認済み', '확인 완료'), o('recheck', '要再確認', '재확인 필요'), o('na', '対象外', '해당 없음')];
  const HABIT = [o('no', 'しない', '안 함'), o('sometimes', 'ときどき', '가끔'), o('daily', '日常的', '자주')];
  const PARENT = [o('alive', '健在', '생존'), o('deceased', '死別', '사별'), o('unknown', '不明', '모름'), o('noanswer', '回答しない', '응답 안 함')];

  // g: 'f' = women only, 'm' = men only. lab: per-gender label override.
  const SECTIONS = [
    { id: 'basic', ja: '基本情報', ko: '기본 정보', fields: [
      { k: 'name', ja: '氏名', ko: '성명', type: 'text', max: 100, req: true },
      { k: 'latinSurname', ja: '英文氏名（姓）', ko: '영문 성명（성）', type: 'text', max: 80 },
      { k: 'latinGivenName', ja: '英文氏名（名）', ko: '영문 성명（이름）', type: 'text', max: 80 },
      { k: 'birth', ja: '生年月日', ko: '생년월일', type: 'date', req: true },
      { k: 'region', ja: 'お住まいの地域（都道府県・市区町村）', ko: '거주 지역（시·도, 시·군·구）', type: 'text', max: 80, req: true },
    ]},
    { id: 'contact', ja: '連絡先', ko: '연락처', fields: [
      { k: 'email', ja: 'メールアドレス', ko: '이메일', type: 'email', max: 254, req: true },
      { k: 'phone', ja: '電話番号', ko: '전화번호', type: 'tel', max: 40 },
      { k: 'line', ja: 'LINE ID', ko: 'LINE ID', type: 'text', max: 100 },
      { k: 'kakao', ja: 'カカオトークID', ko: '카카오톡 ID', type: 'text', max: 100, g: 'm' },
      { k: 'contactChannel', ja: '希望する連絡手段', ko: '희망 연락 방법', type: 'select', opts: [o('line', 'LINE', 'LINE'), o('kakao', 'カカオトーク', '카카오톡'), o('email', 'メール', '이메일'), o('phone', '電話', '전화'), o('other', 'その他', '기타')] },
    ]},
    { id: 'profile', ja: 'プロフィール', ko: '프로필', fields: [
      { k: 'height', ja: '身長（cm）', ko: '키（cm）', type: 'number', min: 100, max: 250 },
      { k: 'weightKg', ja: '体重（kg）', ko: '체중（kg）', type: 'number', min: 20, max: 300 },
      { k: 'bloodType', ja: '血液型', ko: '혈액형', type: 'select', opts: [o('A', 'A', 'A'), o('B', 'B', 'B'), o('AB', 'AB', 'AB'), o('O', 'O', 'O'), o('unknown', '不明', '모름')] },
      { k: 'highestEducation', ja: '最終学歴', ko: '최종 학력', type: 'text', max: 80 },
      { k: 'employmentStatus', ja: '就業状況', ko: '취업 상황', type: 'select', opts: [o('employed', '会社員・公務員', '회사원·공무원'), o('self', '自営業', '자영업'), o('parttime', 'パート・アルバイト', '파트타임·아르바이트'), o('none', '就業していない', '무직'), o('other', 'その他', '기타')] },
      { k: 'jobDetails', ja: '職種・仕事内容', ko: '직종·업무 내용', type: 'text', max: 180 },
      { k: 'income', type: 'number', min: 0, max: 1000000,
        lab: { f: { ja: '年収（万円）', ko: '연소득（만 엔）' }, m: { ja: '年収（万ウォン）', ko: '연소득（만 원）' } } },
      { k: 'marital', ja: '婚姻歴', ko: '혼인 이력', type: 'select', opts: [o('none', 'なし', '없음'), o('divorced', '離婚', '이혼'), o('bereaved', '死別', '사별')] },
      { k: 'children', ja: '子ども', ko: '자녀', type: 'select', opts: [o('none', 'なし', '없음'), o('yes', 'あり', '있음')] },
      { k: 'smoking', ja: '喫煙', ko: '흡연', type: 'select', opts: HABIT },
      { k: 'drinking', ja: '飲酒', ko: '음주', type: 'select', opts: HABIT },
      { k: 'selfPersonality', ja: 'ご本人の性格', ko: '본인 성격', type: 'text', max: 160 },
      { k: 'hobbies', ja: '趣味', ko: '취미', type: 'text', max: 180 },
    ]},
    { id: 'family', ja: '家族', ko: '가족', fields: [
      { k: 'fatherStatus', ja: '父親の状況', ko: '아버지', type: 'select', opts: PARENT },
      { k: 'motherStatus', ja: '母親の状況', ko: '어머니', type: 'select', opts: PARENT },
      { k: 'siblings', ja: 'きょうだい構成（例：姉1人、弟1人）', ko: '형제 관계（예: 누나 1명, 남동생 1명）', type: 'text', max: 120 },
    ]},
    { id: 'marriage', ja: '結婚についての希望', ko: '결혼 희망 사항', fields: [
      { k: 'timing', ja: '希望する結婚時期', ko: '희망 결혼 시기', type: 'text', max: 80 },
      { k: 'outlook', ja: '国際結婚についての考え', ko: '국제결혼에 대한 생각', type: 'textarea', max: 400 },
      { k: 'partnerPersonality', ja: '希望する相手の性格・価値観', ko: '희망하는 상대의 성격·가치관', type: 'text', max: 160 },
      { k: 'prefMinAge', ja: '希望する相手の年齢（下限）', ko: '희망 상대 나이（하한）', type: 'number', min: 18, max: 99 },
      { k: 'prefMaxAge', ja: '希望する相手の年齢（上限）', ko: '희망 상대 나이（상한）', type: 'number', min: 18, max: 99 },
      { k: 'prefMinHeight', ja: '希望する相手の身長（cm以上）', ko: '희망 상대 키（cm 이상）', type: 'number', min: 100, max: 250 },
      { k: 'residenceAfter', ja: '結婚後の居住希望', ko: '결혼 후 희망 거주지', type: 'select', opts: [o('jp', '日本', '일본'), o('kr', '韓国', '한국'), o('other', 'その他', '기타'), o('discuss', '相談して決めたい', '상의해서 결정')] },
      { k: 'relocationPlan', ja: '結婚後の移住', ko: '결혼 후 이주', type: 'select', opts: [o('yes', '移住を希望', '이주 희망'), o('depends', '条件次第', '조건에 따라'), o('no', '移住の予定なし', '이주 예정 없음'), o('undecided', '未定', '미정')] },
      { k: 'accommodation', ja: '生活習慣・宗教行事で配慮してほしいこと（任意）', ko: '생활 습관·종교 행사 관련 배려 사항（선택）', type: 'text', max: 120 },
    ]},
    { id: 'language', ja: '言語', ko: '언어', fields: [
      { k: 'langLevel', type: 'select', lab: { f: { ja: '韓国語のレベル', ko: '한국어 수준' }, m: { ja: '日本語のレベル', ko: '일본어 수준' } },
        opts: [o('none', '未学習', '배운 적 없음'), o('basic', '初級', '초급'), o('middle', '中級', '중급'), o('advanced', '上級', '고급')] },
      { k: 'translation', ja: '翻訳アプリの利用', ko: '번역 앱 사용', type: 'select', opts: [o('need', '必要', '필요'), o('sometimes', '必要に応じて', '필요에 따라'), o('no', '不要', '불필요')] },
    ]},
    { id: 'pr', ja: '自己紹介', ko: '자기소개', fields: [
      { k: 'message', ja: '自己PR・スタッフへの伝言', ko: '자기 PR·담당자에게 전할 말', type: 'textarea', max: 1000 },
    ]},
  ];

  // Admin-only fields stored on the managed member record.
  const ADMIN = [
    { k: 'status', ja: '会員ステータス', ko: '회원 상태', type: 'select', opts: [o('active', '活動中', '활동 중'), o('paused', '休会', '휴회'), o('closed', '退会', '탈퇴'), o('suspended', '利用停止', '이용 정지')] },
    { k: 'assigned', ja: '担当者', ko: '담당자', type: 'text', max: 60 },
    { k: 'identity', ja: '本人確認', ko: '본인 확인', type: 'select', opts: YESNO_CHECK },
    { k: 'single', ja: '独身・婚姻関係書類', ko: '독신·혼인관계 서류', type: 'select', opts: YESNO_CHECK },
    { k: 'work', ja: '職業・在職証明', ko: '직업·재직 증명', type: 'select', opts: YESNO_CHECK, g: 'm' },
    { k: 'incomeCheck', ja: '所得証明', ko: '소득 증명', type: 'select', opts: YESNO_CHECK, g: 'm' },
    { k: 'interviewCheck', ja: '面談', ko: '면담', type: 'select', opts: YESNO_CHECK },
    { k: 'interviewOutcome', ja: '面談評価', ko: '면담 평가', type: 'select', opts: [o('continue', '継続可', '진행 가능'), o('more', '追加確認', '추가 확인'), o('hold', '保留', '보류')] },
    { k: 'adminMemo', ja: '管理メモ（会員には表示されません）', ko: '관리 메모（회원에게 표시되지 않음）', type: 'textarea', max: 2000 },
  ];

  const RECORD_TYPES = {
    support: { ja: '相談・フォロー', ko: '상담·팔로우', fields: [
      { k: 'channel', ja: '相談経路', ko: '상담 경로', type: 'select', opts: [o('line', 'LINE', 'LINE'), o('phone', '電話', '전화'), o('face', '対面', '대면'), o('online', 'オンライン', '온라인'), o('other', 'その他', '기타')] },
      { k: 'followup', ja: 'フォロー状況', ko: '팔로우 상황', type: 'select', opts: [o('continue', '継続フォロー', '계속 팔로우'), o('soon', '早めの連絡を希望', '빠른 연락 희망'), o('none', '現時点で追加支援なし', '현재 추가 지원 없음')] },
      { k: 'need', ja: '本人が希望する支援・フィードバック', ko: '본인이 희망하는 지원·피드백', type: 'textarea', max: 600 },
      { k: 'next', ja: '次の対応', ko: '다음 조치', type: 'text', max: 180 },
    ]},
    match: { ja: '交際・マッチング', ko: '교제·매칭', fields: [
      { k: 'partner', ja: 'お相手（会員名・番号）', ko: '상대（회원명·번호）', type: 'text', max: 100 },
      { k: 'stage', ja: '進捗', ko: '진행 상황', type: 'select', opts: [o('review', 'マッチング審査中', '매칭 심사 중'), o('online', 'オンラインデート中', '온라인 데이트 중'), o('meetKr', '対面中（韓国）', '대면 중（한국）'), o('meetJp', '対面中（日本）', '대면 중（일본）'), o('dating', '交際中', '교제 중'), o('ended', '終了', '종료')] },
      { k: 'satisfaction', ja: '満足度（5が最高）', ko: '만족도（5가 최고）', type: 'select', opts: ['1', '2', '3', '4', '5'].map((n) => o(n, n, n)) },
      { k: 'feedback', ja: '本人の感想・希望', ko: '본인 소감·희망', type: 'textarea', max: 600 },
      { k: 'next', ja: '次の対応', ko: '다음 조치', type: 'text', max: 180 },
    ]},
  };

  // Inquiries from members to staff.
  const INQUIRY_KINDS = [o('question', '1対1のお問い合わせ', '1:1 문의'), o('booking', '相談の予約', '상담 예약'), o('report', '通報（不適切な連絡など）', '신고（부적절한 연락 등）')];
  const BOOKING_METHODS = [o('visit', '来店', '방문'), o('phone', '電話', '전화'), o('video', 'ビデオ通話', '화상 통화')];
  const INQUIRY_STATUS = [o('new', '未確認', '미확인'), o('open', '対応中', '처리 중'), o('done', '完了', '완료')];
  // Introduction responses and outcomes.
  const RESP = [o('pending', '回答待ち', '응답 대기'), o('yes', '会ってみたい', '만나 보고 싶음'), o('no', '見送り', '사양'), o('na', 'スタッフが確認', '직원 확인')];
  const INTRO_OUTCOMES = [o('meeting', 'お見合い・面会へ', '맞선·만남 진행'), o('dating', '交際へ', '교제로 진행'), o('declined', '不成立', '불성립'), o('suspended', '利用停止により終了', '이용 정지로 종료'), o('other', 'その他', '기타')];
  // Profile fields copied to the partner's introduction card (never name, contact details,
  // or the free-text message, which members also use for private notes to staff).
  const INTRO_CARD_FIELDS = ['height', 'employmentStatus', 'jobDetails', 'hobbies', 'selfPersonality', 'langLevel', 'residenceAfter'];

  function forGender(fields, g) { return fields.filter((f) => !f.g || f.g === g); }
  function label(f, g, lang) {
    if (f.lab) return (f.lab[g] || f.lab.f)[lang];
    return f[lang];
  }
  function optionLabel(f, code, lang) {
    const hit = (f.opts || []).find((x) => x.code === code);
    return hit ? hit[lang] : (code == null ? '' : String(code));
  }
  function field(k) { for (const s of SECTIONS) { const f = s.fields.find((x) => x.k === k); if (f) return f; } return null; }
  function opt(list, code, lang) { const hit = list.find((x) => x.code === code); return hit ? hit[lang] : (code || ''); }
  window.KF = { SECTIONS, ADMIN, RECORD_TYPES, INQUIRY_KINDS, BOOKING_METHODS, INQUIRY_STATUS, RESP, INTRO_OUTCOMES, INTRO_CARD_FIELDS,
    forGender, label, optionLabel, field, opt };
})();
