# 문의·상담 예약 / 신고·정지 / 소개 알림 설계 (2026-11-13)

## 목적
직원이 회원을 맺어 주는 **상담소 방식**을 유지한 채, 다음 세 가지를 kiokuyeon(GitHub Pages + Firebase Spark 무료)에 더한다.
1. 회원의 1:1 문의·상담 예약을 놓치지 않도록 관리자에게 미확인 건수와 목록을 보여 준다.
2. 부적절한 상대에 대한 신고를 받고, 직원이 회원을 이용 정지할 수 있게 한다.
3. 직원이 소개한 상대를 회원이 앱에서 확인하고 수락/사양하며, 그 진행과 회원별 활동 이력을 볼 수 있게 한다.

## 목표가 아닌 것
- 회원끼리 서로의 목록을 둘러보거나 직접 메시지를 주고받는 기능(매칭 사이트화). 出会い系サイト規制法 문제를 피한다.
- 이메일·웹 푸시 자동 알림(유료 요금제 필요). 이번에는 화면 내 배지만.
- 소개 상대의 연락처 공개. 양쪽 수락 후 직원이 조율한다.

## 접근 방식 (검토한 것)
- **A. 회원 상호 열람형** — 매칭 사이트 구조. 법 규제·작업량 때문에 제외(사용자 결정).
- **B. 직원 중개형 + 화면 배지 (채택)** — Firestore 실시간 감시(onSnapshot)로 무료 범위에서 배지를 띄운다.
- **C. B + Cloud Functions 메일 알림** — Blaze 요금제 필요. 나중에 추가 가능하도록 데이터 구조만 맞춰 둔다.

## 데이터 구조 (Firestore)
| 컬렉션 | 내용 | 회원 권한 | 관리자 |
|---|---|---|---|
| `inquiries/{id}` | `uid, kind(question/booking/report), subject, body, booking{date,time,method}, introId, status(new/open/done), reply, repliedAt, repliedBy, memberSeen, name, gender, lang, createdAt, updatedAt` | 본인 것 읽기, 생성(신청서 있고 정지 아님), `memberSeen:true`만 수정 | 전체 |
| `applications/{uid}` | 기존 + `suspended`(bool), `suspendReason` | 읽기만(이 두 필드는 수정 불가) | 전체 |
| `members/{id}` | 기존 + `admin.status`에 `suspended` 추가, `noIntro`(memberId 배열) | 없음 | 전체 |
| `members/{id}/activity/{id}` | 직원 행동 자동 기록 `type, text, by, at` | 없음 | 전체 |
| `intros/{id}` | `a{memberId,uid,name,gender}, b{…}, uids[], respA/respB(pending/yes/no/na), respAAt, respBAt, seenA, seenB, staffNote, status(open/closed), outcome, createdAt, createdBy` | `uids`에 포함되면 읽기, 자기 쪽 resp/seen만 수정(pending일 때 yes/no) | 전체 |
| `introCards/{introId}_{a|b}` | 그 쪽 회원에게 보여 줄 상대 요약: `viewerUid, age, region, height, job, employment, hobbies, langLevel, residenceAfter, message, photo` | `viewerUid`가 본인이면 읽기 | 전체 |

- 회원은 `members`를 읽을 수 없으므로, 소개 시 상대 요약을 `introCards`에 복사해 둔다(이름·연락처 제외).
- 계정 없는 회원(관리자 직접 등록)은 `uid=null`, 응답은 `na`로 두고 직원이 대신 입력한다.

## 화면
**회원(index.html)** — 승인 전에도 문의·예약 가능, 소개는 승인 후.
- 상단 탭: 내 등록 / 문의·상담 (답변 미확인 배지) / 소개 (응답 대기 배지).
- 문의: 종류(1:1 문의 / 상담 예약 / 신고) → 상담 예약은 희망일·시간·방법(방문/전화/화상). 보낸 목록과 직원 답변 표시.
- 소개: 상대 카드(사진·나이·지역·직업 등) + 직원 코멘트 → 「会ってみたい / 만나 보고 싶음」「今回は見送る / 사양함」, 「신고」 버튼.
- 정지된 회원: 안내 문구만 표시, 기능 사용 불가.

**관리자(admin.html)**
- 상단 메뉴 배지: 문의·상담(미확인, 신고는 빨간색), 소개(양쪽 수락=만남 조율 필요). 탭 제목에도 `(N)`.
- 문의·상담 목록(미확인/처리 중/완료/전체, 신고 맨 위) → 상세에서 답변·상태 변경.
- 회원 상세: 「소개하기」(반대 성별·활동 중·정지 아님·소개 제외 아님·이미 소개 안 됨 후보에서 선택, 직원 코멘트), 「이용 정지 / 정지 해제」(사유 필수, 진행 중 소개 자동 종료), 「소개 제외」 지정, **활동 이력**(직원 기록 + 소개·응답·문의를 시간순 병합).
- 소개 목록: 응답 대기 / 만남 조율 필요 / 불성립 / 종료, 직원이 결과 입력 후 종료.

## 직원 결정 사항(제 판단, 변경 가능)
- 신고는 문의의 한 종류로 처리해 한 목록에서 관리.
- 활동 이력은 따로 쌓지 않고, 직원 행동만 `activity`에 남기고 나머지는 원본(소개·문의)에서 모아서 보여 준다.
- 소개 카드에 이름은 넣지 않는다(직원 코멘트로 보완).
- 한국·일본 모두 UTC+9이므로 예약 시간은 시간대 표기 없이 받는다.

## 검증
에뮬레이터에서 회원 2명(여·남)+관리자로: 문의→배지→답변→회원 배지, 소개→양쪽 수락→만남 조율 표시, 신고, 정지 시 회원 기능 차단, 규칙상 타인 데이터 접근 거부.
