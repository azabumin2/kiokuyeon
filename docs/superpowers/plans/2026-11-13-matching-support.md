# Inquiries / Reports & Suspension / Introductions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add member inquiries/consultation bookings, reports + staff suspension + no-intro pairs, and staff-mediated introductions with on-screen badges and a per-member activity timeline.

**Architecture:** Static GitHub Pages SPA (vanilla JS, `KC`/`KF` globals) on Firebase Auth + Firestore (Spark). New collections `inquiries`, `intros`, `introCards`, `members/{id}/activity`; access enforced in `firestore.rules`. Badges use Firestore `onSnapshot` listeners.

**Tech Stack:** Firebase compat SDK 10.13.0, Firestore rules v2, Firebase emulator (auth 9099 / firestore 8080) for verification.

**Spec:** `docs/superpowers/specs/2026-11-13-matching-support-design.md`

## Global Constraints
- No new libraries, no build step; every UI string has `ja` and `ko`.
- Members never read `members/*`; partner data reaches them only via `introCards` (no name, no contact fields).
- No composite indexes: member-side queries use a single `where` and sort on the client.
- Bump asset query `?v=20261113a` → `?v=20261113b` in both HTML files.
- Emulator must run from an ASCII path (copy of the project in scratchpad).

## Review Focus
- Suspended member tries to write (inquiry / intro response) directly via SDK → rules deny.
- Member A tries to read B's introCard or another member's inquiry → denied.
- Member tries to answer an intro twice or set the other side's response → denied.
- Intro with a partner who has no account (`uid:null`) → member side still works; staff sets `na` side manually.
- Member opens app before approval → inquiries work, intro tab shows "available after approval".

---

### Task 1: Firestore rules for the new collections
**Files:** Modify `firestore.rules`
- [ ] Add `inquiries` (owner read where `resource.data.uid == auth.uid`; create when application exists and `suspended != true`, keys ⊆ `uid,kind,subject,body,booking,introId,status,memberSeen,name,gender,lang,createdAt,updatedAt`, `status=='new'`, `kind in [question,booking,report]`, `body` ≤ 2000; owner update only `memberSeen` → true; admin all).
- [ ] Add `intros` (read if `auth.uid in resource.data.uids` or admin; owner update: side A when `uidA==auth.uid`, affectedKeys ⊆ `respA,respAAt,seenA`, `resource.respA=='pending'` or only seen change, new `respA in [pending,yes,no]` ... symmetric for B; status must be `open`; app not suspended).
- [ ] Add `introCards` (read if `viewerUid==auth.uid` or admin; write admin).
- [ ] Add `members/{id}/activity` admin only. Owner application update whitelist unchanged (so `suspended` is not member-writable).
- [ ] Verify: `firebase_validate_security_rules` passes.

### Task 2: Shared helpers
**Files:** Modify `assets/common.js`, `assets/fields.js`, `assets/style.css`
- [ ] `KF.ADMIN` status opts add `o('suspended','利用停止','이용 정지')`; `KF.INQUIRY_KINDS`, `KF.BOOKING_METHODS`, `KF.INQUIRY_STATUS`, `KF.INTRO_CARD_FIELDS = ['height','employmentStatus','jobDetails','hobbies','langLevel','residenceAfter','message']`.
- [ ] `KC.count(n)` → `<span class="count">n</span>` or null; CSS `.count`, `.count.red`, `.badge.suspended/new/open/done/yes/no/pending/na`, `.introcard`.

### Task 3: Member screen
**Files:** Modify `assets/member.js`
- [ ] Tabs (`#mine`, `#ask`, `#intros`) with live counts from `onSnapshot`(inquiries where uid; intros where uids array-contains uid).
- [ ] Inquiry form (kind, subject, body, booking date/time/method) + list with reply; opening the tab sets `memberSeen:true` on replied items.
- [ ] Intro list: card from `introCards/{id}_{side}`, staff note, yes/no buttons (confirm), report button (prefills inquiry kind=report, introId). Sets `seenX:true` on view.
- [ ] Suspended: only notice. Not approved: intro tab shows notice.

### Task 4: Admin screen
**Files:** Modify `assets/admin.js`
- [ ] Global listeners after admin check: inquiries `status=='new'` (count, reports red) and intros `status=='open'` (count where both yes) → nav badges + `document.title` prefix.
- [ ] Routes `#/inquiries?status=`, `#/inquiry/{id}` (reply, status), `#/intros?tab=`, `#/intro/{id}` (record response for `na` side, outcome, close).
- [ ] Member detail: Introduce (candidate select, staff note → batch: intro + two cards + activity on both), Suspend/Unsuspend (reason, batch: member status, application `suspended`, close open intros, activity), No-intro toggle (both members' `noIntro`, activity), timeline (activity + records + intros + inquiries by `sourceUid`, sorted desc).
- [ ] Dashboard stats for new inquiries & meet-needed intros.

### Task 5: Verify, deploy, publish
- [ ] Emulator run from ASCII copy: scripted scenario in Review Focus + spec Verification; mobile width no horizontal scroll.
- [ ] Deploy rules to `kiokuyeon`; bump `?v=`; README section; commit & push; check live page loads.
