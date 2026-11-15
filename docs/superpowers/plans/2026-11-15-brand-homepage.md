# Kiokuyeon Brand Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** kiokuyeon.com에 3개 언어(ko/ja/en) 브랜드 홈페이지를 만들고, 회원 등록을 `/join/`으로 옮기며, 관리자 화면에 사이트 설정·상담 신청 관리를 추가한다.

**Architecture:** Python 생성 스크립트(`site-src/build.py`)가 공통 템플릿과 언어별 문장 사전으로 정적 HTML을 만들어 저장소에 커밋한다. 공개 페이지는 Firebase SDK 없이 Firestore REST로 `site/settings`를 읽고 `consults`에 상담을 쓴다. 관리자 기능은 기존 `admin.js`에 추가한다.

**Tech Stack:** HTML/CSS/순수 JS, Python 3(표준 라이브러리 + Pillow는 이미지 변환에만), Firebase Firestore(REST + compat SDK 10.13.0 in admin), GitHub Pages, openai-image 스킬, PyMuPDF(서류 이미지).

**Spec:** `docs/superpowers/specs/2026-11-15-brand-homepage-design.md`

## Global Constraints

- 색: `#FAF7F2` `#EAE2D8` `#D8A6A0` `#263C50` 본문 `#333333`. 강한 빨강·깜빡임·소리 자동재생 금지.
- 글꼴: ja Meiryo 시스템 스택, ko Noto Sans KR, en Inter, 제목 Noto Serif JP/KR (Google Fonts).
- 이미지는 전부 openai-image 스킬로 생성. SVG·CSS로 그림·로고를 그리지 않는다. 인물 사진에는 「イメージ写真 / 이미지 사진 / Image photo」 표기.
- 금지 표현: 「必ず成婚」「政府が保証」「すべての損害を補償」 및 각 언어 대응 표현. 가짜 후기·숫자·계정·QR·일본 지점 표기 금지.
- 설정값이 비어 있으면 해당 요소를 숨긴다(임시 값 표시 금지).
- 생년월일·주민번호 비공개.
- 회원 영역(`/join/`, `admin.html`) 밖에서는 Firebase Auth SDK를 로드하지 않는다.
- 사실 값: 상호 미래결혼정보 서울 / 대표 김동윤 / 사업자 434-04-03213 / 등록 서울-종로-국제-26-0001호(2026-11-02) / 서울특별시 종로구 새문안로5가길 11, 501호(내수동) / 보증보험 50,000,000원 2026-08-26~2027-08-25.
- 자산 URL 캐시 버스팅 `?v=20261115a`.

## Review Focus

1. 설정 문서 읽기 실패(오프라인·규칙 오류) → 페이지는 기본값으로 정상 표시되어야 한다. (Task 3 test)
2. 설정이 빈 상태(첫 공개) → 영상·LINE·카카오·무료 표시·보험 카드가 숨겨지고 「準備中」만 보인다. (Task 3 test)
3. 상담 폼에 과도한 길이·추가 필드·잘못된 status를 보내면 규칙이 거부한다. (Task 2 test)
4. YouTube 주소 형식(`watch?v=`, `youtu.be/`, `shorts/`, `embed/`)이 모두 ID로 추출되고 이상한 값은 거부된다. (Task 5 test)
5. 보험 종료일이 지났으면 공개 카드가 숨겨지고, 60일 이내면 관리자 경고가 뜬다. (Task 3·5 test)

---

### Task 1: 회원 등록 화면을 `/join/`으로 이동

**Files:**
- Create: `join/index.html` (현재 `index.html` 복사, 자산 경로를 `../assets/…`로, `<link rel="canonical" href="https://kiokuyeon.com/join/">`)
- Modify: `assets/member.js` 하단 링크 `admin.html` → 상대경로가 `/join/`에서도 맞도록 `/admin.html`; 헤더 브랜드 링크 `./` → `/`
- Modify: `admin.html`·`assets/admin.js`의 회원 화면 링크가 있으면 `/join/`

**Interfaces:** Produces: 회원 화면 URL `/join/` (Task 3 헤더 버튼이 사용).

- [ ] Step 1: 파일 생성·수정
- [ ] Step 2: 에뮬레이터(`python -m http.server 5500` + emulators) `http://localhost:5500/join/?emulator`에서 로그인 화면·이메일 가입·확인 화면이 뜨는지 확인. Expected: 콘솔 오류 없음
- [ ] Step 3: Commit `Move member registration to /join/`

### Task 2: 보안 규칙 — `site/settings`, `consults`

**Files:**
- Modify: `firestore.rules`
- Create: `tools/test_rules_site.mjs` (Node 표준 fetch로 에뮬레이터 REST 호출)

**Rules:**
- `match /site/{doc}`: `allow read: if true; allow write: if isAdmin();`
- `match /consults/{id}`: `allow create: if` 키가 `['nickname','region','age','method','contact','body','consent','lang','status','createdAt']`만, `nickname` 1–40자, `region` 1–60자, `age in ['20s','30s','40s','50s','60s+']`, `method in ['line','kakao','email','phone']`, `contact` 3–120자, `body` 1–2000자, `consent == true`, `lang in ['ja','ko','en']`, `status == 'new'`, `createdAt == request.time`. `allow read, update, delete: if isAdmin();`

- [ ] Step 1: 테스트 작성 — 비로그인 create 정상 1건 OK; `body` 2001자 거부; 추가 필드 `x` 거부; `status:'done'` 거부; `consent:false` 거부; 비로그인 read 거부; `site/settings` 비로그인 read 허용·write 거부
- [ ] Step 2: 에뮬레이터에서 실행 `node tools/test_rules_site.mjs` → 규칙 추가 전 FAIL
- [ ] Step 3: 규칙 추가
- [ ] Step 4: 재실행 → 7개 모두 PASS
- [ ] Step 5: `npx firebase-tools deploy --only firestore:rules --project kiokuyeon`, Commit `Rules for site settings and consultation requests`

### Task 3: 사이트 생성기·공통 자산·10페이지 × 3언어

**Files:**
- Create: `site-src/build.py` — `build(out_dir: Path) -> list[Path]`; 페이지 목록 `PAGES = ['index','about','service','flow','stories','column','faq','company','contact','privacy']`; 언어 `LANGS = ['ja','ko','en']`. 각 페이지에 `<html lang>`, `<title>`, description, OGP, `hreflang` 3개 + `x-default`(→ `/`), 헤더(로고·메뉴·언어 전환·회원 페이지 `/join/`), 푸터(운영자 정보 요약·개인정보 처리방침), 하단 고정 상담 버튼(휴대폰).
- Create: `site-src/text_ja.py`, `text_ko.py`, `text_en.py` — `T: dict[str, str]` 동일 키 집합(빌드 시 키 불일치면 오류).
- Create: `site-src/templates.py` — 페이지별 본문 함수 `page_<name>(t: dict) -> str`.
- Create: `site/site.css`, `site/site.js`
- Generate: `ja/*.html`, `ko/*.html`, `en/*.html`, 루트 `index.html`(언어 이동 + noscript 링크)
- Create: `tools/check_site.py` — 생성물 검사

**site.js Interfaces (Produces):**
- `loadSettings(): Promise<Settings>` — `GET https://firestore.googleapis.com/v1/projects/kiokuyeon/databases/(default)/documents/site/settings` → 일반 객체로 변환; 실패 시 `{}`.
- `applySettings(s: Settings, lang: 'ja'|'ko'|'en'): void` — `[data-setting]` 요소 채움/숨김. 규칙: `freeConsult===true`일 때만 무료 배지; `lineUrl`은 ja에서만, `kakaoUrl`은 ko에서만; `videos` 비면 `[data-videos]` 대신 `[data-videos-empty]`; `insurance.to < 오늘(KST)`이면 보험 카드 숨김; `japanOffice.status`별 문구.
- `submitConsult(form: HTMLFormElement, lang): Promise<void>` — REST `POST .../documents/consults` (createdAt은 `fieldTransforms` 대신 commit API의 `REQUEST_TIME` 사용), 허니팟 `website` 입력이 채워지면 조용히 성공 처리, `localStorage` 마지막 제출 60초 이내면 안내 후 중단.
- 영상: 썸네일(`https://i.ytimg.com/vi/{id}/hqdefault.jpg`) 클릭 시 `youtube-nocookie.com/embed/{id}?autoplay=1` iframe으로 교체. `country` 표시.
- 언어 전환: 같은 파일명으로 `/{lang}/{page}.html`, 선택을 `localStorage['kiokuyeon-lang']`에 저장(회원 화면과 같은 키, `en`도 허용되지만 회원 화면은 ja/ko만 사용).

- [ ] Step 1: `tools/check_site.py` 작성 — 검사: 31개 파일 존재; 각 페이지 hreflang ja/ko/en/x-default; `<title>` 비어 있지 않음; 금지 표현(`必ず成婚`, `政府が保証`, `반드시 성혼`, `guaranteed marriage`) 없음; 생년월일 `970410`·`1997` 없음; `firebase-auth` 스크립트 없음; 이미지 `<img>`에 alt 있음
- [ ] Step 2: `python tools/check_site.py` → FAIL(파일 없음)
- [ ] Step 3: 생성기·문장·CSS·JS 구현, `python site-src/build.py`
- [ ] Step 4: `python tools/check_site.py` → PASS
- [ ] Step 5: 브라우저 확인(에뮬레이터 settings 문서): (a) 설정 비었을 때 Review Focus 2 상태, (b) settings에 lineUrl·videos·freeConsult 넣으면 표시, (c) 네트워크 차단(잘못된 프로젝트 URL로 강제) 시 페이지 정상, (d) 보험 `to`를 어제로 → 카드 숨김, (e) 375px 가로 스크롤 없음, (f) 상담 폼 제출 → 에뮬레이터에 문서 생성, 60초 내 재제출 차단
- [ ] Step 6: Commit `Add trilingual brand homepage`

### Task 4: 이미지 제작 (openai-image)

**Files:** Create `site/img/` — `logo.png`(투명, 가로형 워드마크 「기억・연」+「Kiokuyeon」, 두 점을 잇는 가는 선), `hero.webp`(1600×900, 카페에서 웃는 한일 커플), `walk.webp`(나란히 걷는 뒷모습), `cook.webp`(함께 요리), `consult.webp`(상담 테이블·노트·손), `seoul.webp`(종로 거리 풍경), `ogp.jpg`(1200×630, 로고+배경)

- [ ] Step 1: 각 이미지 `--quality medium`으로 생성 → Read로 확인(글자 깨짐·부자연스러운 손 등) → 필요 시 최대 2회 재생성 → 확정본 `high`
- [ ] Step 2: Pillow로 WebP(품질 80, 긴 변 1600px 이하) 변환, 원본 PNG는 저장소에 넣지 않음(`site-src/img-src/`는 `.gitignore`)
- [ ] Step 3: 템플릿에 경로 반영, `python site-src/build.py && python tools/check_site.py` PASS, Commit `Add generated brand images`

### Task 5: 관리자 — 사이트 설정·상담 신청·보험 경고

**Files:**
- Modify: `assets/admin.js` — 라우트 `#/settings`, `#/consults?status=new|contacted|done|all`, `#/consult/{id}`; 상단 메뉴 「サイト設定」「相談申込」 + 신규 건수 배지(`consults where status=='new'` onSnapshot, 기존 `listen()`에 추가); 대시보드에 보험 경고(`insurance.to`까지 60일 이하 또는 지남)
- Create: `assets/site-settings.js` — `parseYouTubeId(url: string): string|null`(11자 `[A-Za-z0-9_-]`), `daysUntil(dateStr: 'YYYY-MM-DD', today: Date): number`
- Create: `tools/test_site_settings.mjs`

- [ ] Step 1: 테스트 — `parseYouTubeId` 입력 `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, `https://youtu.be/dQw4w9WgXcQ?t=3`, `https://youtube.com/shorts/dQw4w9WgXcQ`, `https://www.youtube.com/embed/dQw4w9WgXcQ` → `'dQw4w9WgXcQ'`; `'hello'`, `'https://evil.com/watch?v=dQw4w9WgXcQ'` → `null`. `daysUntil('2027-08-25', new Date('2027-06-26T00:00:00+09:00')) === 60`, 지난 날짜는 음수
- [ ] Step 2: `node tools/test_site_settings.mjs` → FAIL
- [ ] Step 3: 구현(설정 폼: 무료 여부 3택, 요금 ja/ko/en, LINE·카카오 URL(https만), 대응 정보 ja/ko/en, 일본 사무소 상태·주소, 영상 목록 추가/삭제/순서·제목 ja/ko/en·대상 국가·게재 허가 체크 필수, 보험 금액·기간, 일본 안내명 병기). 상담 목록·상세·상태 변경·메모(`note` 필드, 관리자만)
- [ ] Step 4: 테스트 PASS + 에뮬레이터에서 설정 저장 → 홈페이지 반영, 상담 제출 → 배지 증가 → 상태 변경 → 배지 감소 확인
- [ ] Step 5: Commit `Admin: site settings, consultation requests, insurance warning`

### Task 6: 등록증·보험증권 가림 이미지(검토용, 게시는 사용자 확인 후)

**Files:** Create `tools/mask_docs.py` — PDF 1페이지를 PyMuPDF로 150dpi 렌더, 생년월일·주민번호 줄과 보험 대리점 개인 이름을 흰 사각형으로 가림(텍스트 검색 좌표 기반, 실패 시 고정 좌표), 출력은 스크래치 폴더(저장소 밖).

- [ ] Step 1: 실행 후 이미지를 Read로 열어 가림 확인
- [ ] Step 2: 사용자에게 보여 주고 게시 여부를 묻는다(승인 시 `site/img/doc-*.webp`로 넣고 `company.html`에 표시, 아니면 표만)

### Task 7: 마무리·공개

- [ ] Step 1: README에 홈페이지 구조·`python site-src/build.py` 사용법·설정 항목·공개 전 확인 목록 추가, 자산 `?v=20261115a`
- [ ] Step 2: 전체 확인 — `check_site.py` PASS, 규칙 테스트 PASS, `/`·`/ja/`·`/ko/`·`/en/`·`/join/`·`/admin.html` 로컬에서 콘솔 오류 없음
- [ ] Step 3: Push → Pages 빌드 완료 확인 → 실사이트 `https://kiokuyeon.com/`, `/ja/contact.html`, `/join/` 열람 확인(상담 폼은 실서버에 시험 제출하지 않음)
- [ ] Step 4: 사용자에게 공개 전 확인 목록(설계서 6장)과 관리자 「サイト設定」 사용법 안내
