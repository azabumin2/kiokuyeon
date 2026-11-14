# kiokuyeon — 未来結婚情報 会員登録・管理サイト

GitHub Pages(화면) + Firebase(Google 로그인·Firestore 데이터 저장)로 동작하는 한일 국제결혼 회원 등록·관리 사이트입니다. 서버를 따로 운영하지 않아도 휴대폰·PC, 한국·일본 어디서나 접속할 수 있습니다. 화면은 일본어/한국어를 전환할 수 있습니다.

| 화면 | 주소 | 사용하는 사람 |
|---|---|---|
| 회원 등록 | `https://kiokuyeon.com/` (`index.html`) | 일반 남성·여성 회원. **Google 로그인 또는 이메일+비밀번호**(네이버·Yahoo·Outlook 등 어떤 메일이든 가능, 가입 시 메일 인증 필수)·Microsoft 로그인(설정 후) 후 본인 프로필·사진 등록, 진행 상황 확인, 수정 요청 시 재제출. **문의·상담 예약·신고** 보내기와 답변 확인, 직원이 **소개한 상대** 확인 후 「만나 보고 싶음/사양」 응답 |
| 관리자 화면 | `https://kiokuyeon.com/admin.html` | 직원. 등록 신청 검토(승인·수정 요청·반려), 남녀 회원 목록·검색·상세·편집, 상담·교제 기록, 사진 관리. **미확인 문의·상담 배지**(신고는 빨간색), **소개하기**와 응답 현황(양쪽 수락 시 「만남 조율 필요」), **이용 정지·소개 제외**, 회원별 **활동 이력** |

알림은 화면 배지 방식입니다(관리자·회원 화면을 열어 두면 실시간 반영, 브라우저 탭 제목에 건수 표시). 이메일·푸시 알림은 Firebase 유료 요금제(Blaze) 또는 별도 메일 서비스가 필요해 이번에는 넣지 않았습니다.

## 데이터와 권한 (firestore.rules)

| 컬렉션 | 내용 | 접근 |
|---|---|---|
| `applications/{uid}` | 회원 본인이 제출한 등록 신청 | 본인(읽기, 확인 대기·수정 요청 상태일 때만 수정) / 관리자 |
| `photos/{key}` | 회원 사진(1,000px 이하 JPEG로 축소, 위치정보 제거) | 본인 / 관리자 |
| `members/{id}` | 관리자가 관리하는 정식 회원 정보 + 관리 정보 | 관리자만 |
| `members/{id}/records` | 상담·팔로우, 교제·매칭 기록 | 관리자만 |
| `admins/{uid}` | 관리자 목록 | Firebase 콘솔에서만 추가·삭제 |
| `members/{id}/activity` | 직원 행동 이력(승인·소개·정지·소개 제외·답변) | 관리자만 |
| `inquiries/{id}` | 회원의 1:1 문의·상담 예약·신고와 직원 답변 | 본인(읽기·보내기, 정지 시 불가) / 관리자 |
| `intros/{id}` | 직원이 만든 소개와 양쪽 응답(이름 없음) | 소개된 두 회원(자기 응답 1회만) / 관리자 |
| `introCards/{id}_{a\|b}` | 각 회원에게 보여 줄 상대 요약(사진·나이·지역 등, 이름·연락처·자기PR 제외) | 해당 회원 / 관리자 |

회원끼리는 서로의 정보를 볼 수 없습니다(소개된 상대의 요약만 예외). 관리자 화면의 데이터는 `admins`에 등록된 계정만 읽을 수 있으며, 이는 화면이 아니라 Firebase 서버의 보안 규칙으로 강제됩니다.

## 처음 설정 (한 번만)

### 1. Firebase 프로젝트 만들기
1. https://console.firebase.google.com → 프로젝트 추가 (예: `kiokuyeon`). 요금제는 무료(Spark)로 시작할 수 있습니다.
2. **Authentication** → 시작하기 → 로그인 방법 → **Google**과 **이메일/비밀번호**(「メール/パスワード」, 이메일 링크는 끔) 사용 설정.
3. **Firestore Database** → 데이터베이스 만들기 → 위치 `asia-northeast1 (Tokyo)` → 프로덕션 모드.
4. Firestore → **규칙** 탭에 이 저장소의 `firestore.rules` 내용을 붙여 넣고 **게시**.
5. 프로젝트 설정 → 내 앱 → 웹 앱 추가(`</>`) → 표시되는 `firebaseConfig` 값을 `assets/firebase-config.js`에 입력.
6. Authentication → 설정 → **승인된 도메인**에 `azabumin2.github.io`, `kiokuyeon.com`, `www.kiokuyeon.com` 추가 (2026-11-14 추가 완료).

`firebase-config.js`의 값은 프로젝트 식별용이라 공개되어도 괜찮습니다. 데이터 보호는 보안 규칙이 담당합니다.

### 1-2. Microsoft(Outlook) 로그인 켜기 (선택)
1. https://portal.azure.com → **Microsoft Entra ID** → **앱 등록** → 새 등록
   - 지원되는 계정 유형: **모든 조직 디렉터리의 계정 및 개인 Microsoft 계정**
   - 리디렉션 URI(웹): `https://kiokuyeon.firebaseapp.com/__/auth/handler`
2. 등록한 앱의 **애플리케이션(클라이언트) ID**를 복사하고, **인증서 및 비밀** → 새 클라이언트 암호를 만들어 **값**을 복사합니다(만료일이 있으니 기록해 두기).
3. Firebase 콘솔 → Authentication → 로그인 방법 → **Microsoft** 사용 설정 → ID와 암호 값을 붙여 넣고 저장.
4. `assets/firebase-config.js`의 `window.AUTH_OPTIONS = { microsoft: false }`를 `true`로 바꾸고 `?v=` 값을 갱신해 푸시하면 회원 화면에 버튼이 나타납니다.

같은 이메일 주소를 Google·이메일·Microsoft 중 여러 방법으로 따로 가입할 수는 없습니다(처음 쓴 방법으로 로그인). 관리자 화면은 지금처럼 Google 로그인만 씁니다.

### 2. 첫 관리자 등록
1. 사이트의 `admin.html`을 열고 직원용 Google 계정으로 로그인 → 「권한 없음」 화면에 **UID**가 표시됩니다.
2. Firebase 콘솔 → Firestore → 컬렉션 시작 → 컬렉션 ID `admins`, 문서 ID에 그 **UID**, 필드 `name`(string)에 이름 입력 → 저장.
3. `admin.html`을 새로고침하면 관리자 화면이 열립니다. 다른 직원도 같은 방법으로 추가합니다.

### 3. GitHub Pages 공개
저장소 Settings → Pages → Source: **Deploy from a branch**, Branch: `main` / `(root)` → Save.
공개 주소는 **https://kiokuyeon.com/** 입니다(저장소의 `CNAME` 파일). 예전 주소 `https://azabumin2.github.io/kiokuyeon/`로 들어오면 자동으로 새 주소로 넘어갑니다.

## お名前.com 도메인 연결 (2026-11-14 완료)

현재 설정: 네임서버 `01〜04.dnsv.jp`(お名前.com DNS레코드設定). 렌탈 서버는 해지 신청함(세트 신청 때문에 도메인이 1엔·「永久無料」였으므로 2027-11 갱신 때 요금 확인 필요). .com 도메인은 등록자 메일 인증(ドメイン情報認証)을 하지 않으면 「利用制限中」(clientHold)이 됩니다.

1. お名前.com Navi → ドメイン → **DNS設定/転送設定** → kiokuyeon.com → DNSレコード設定에서 다음을 추가 (TTL 3600)

   | ホスト名 | TYPE | VALUE |
   |---|---|---|
   | (空欄) | A | 185.199.108.153 |
   | (空欄) | A | 185.199.109.153 |
   | (空欄) | A | 185.199.110.153 |
   | (空欄) | A | 185.199.111.153 |
   | www | CNAME | azabumin2.github.io |
   | (空欄) | TXT | v=spf1 include:_spf.firebasemail.com ~all |
   | (空欄) | TXT | firebase=kiokuyeon |
   | firebase1._domainkey | CNAME | mail-kiokuyeon-com.dkim1._domainkey.firebasemail.com |
   | firebase2._domainkey | CNAME | mail-kiokuyeon-com.dkim2._domainkey.firebasemail.com |

   아래 4줄(TXT·`_domainkey`)은 Firebase 인증 메일(확인 메일·비밀번호 재설정)을 `未来結婚情報 <noreply@kiokuyeon.com>`으로 보내기 위한 것입니다(2026-11-14 설정, Authentication → テンプレート). 지우면 메일 발신이 실패할 수 있습니다.

2. GitHub 저장소 Settings → Pages → **Custom domain**에 `kiokuyeon.com` 입력 → Save → DNS 확인 후 **Enforce HTTPS** 체크.
3. Firebase Authentication의 승인된 도메인에 `kiokuyeon.com`, `www.kiokuyeon.com` 추가.

DNS 반영에는 수십 분~최대 하루 정도 걸릴 수 있습니다.

## 운영 시 주의
- 저장소는 공개(Public)입니다. 소스 코드만 올리고, 회원 데이터·CSV·엑셀 파일은 절대 커밋하지 마세요. 회원 데이터는 Firebase에만 저장됩니다.
- Firestore 무료 범위: 하루 읽기 5만 건·쓰기 2만 건, 저장 1GiB. 회원 수천 명 규모까지는 무료 범위에서 운영할 수 있습니다.
- 관리자에서 빠진 직원은 Firebase 콘솔에서 `admins/{UID}` 문서를 삭제하면 즉시 접근이 차단됩니다.
- 회원 탈퇴·삭제 요청 시: 관리자 화면에서 회원 정보와 등록 신청을 각각 [삭제]합니다.

## 기존 Java 버전과의 관계
`mirai-member-app`(Java + PostgreSQL)의 회원 관리 핵심 기능을 옮긴 버전입니다. 본사 CSV 취합과 Excel 출력은 다음 단계에서 추가할 예정입니다.

## 로컬 테스트 (개발용)
```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-kiokuyeon
python -m http.server 5055
```
브라우저에서 `http://localhost:5055/?emulator` (관리자 화면은 `admin.html?emulator`)를 엽니다.
