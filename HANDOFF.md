# AgroLease — Session Handoff (read this first)

**Written:** 2026-07-16. **Updated:** 2026-07-22 (third Task 3 session — 9 real bugs found and fixed via live usage, password management + live username check added, header nav redesigned, Conduit Workspace dashboard redesigned against the real reference image — **but see the ⚠️ flag directly below, read before anything else**). **For:** whichever agent/session picks up next.

This file exists because this repo has had files scattered across two places — `main` (where the founder pushes docs/briefs directly via GitHub's web UI) and per-task feature branches — plus a couple of stale/duplicate files from re-uploads. Read this before touching anything, so you don't work from the wrong copy of something.

---

## ⚠️ READ THIS FIRST — end-of-session live re-check found 2 "fixed" bugs still failing + a layout mismatch, NEITHER investigated yet

Right at the very end of this session (2026-07-22), the founder did a real live re-check of the app (not a code review) and reported, in one message:

1. **The header back button still does not work.** This exact symptom was documented as root-caused and fixed earlier in this SAME session (`app/index.tsx`'s `hasRoutedRef` guard — see `task_app_progress.md`'s 2026-07-22 entry, item 1). The code fix is genuinely present (re-confirmed by re-reading the file after this report came in), and `tsc`/`expo export` were clean when it was written. It is being reported as still broken live, right now, anyway.
2. **Tapping the profile icon (top-left avatar) does not navigate to My Profile.** Same situation — documented and coded earlier this session (`AppShell.tsx`'s avatar `Pressable`, item 9 in `Task-03-Additions-Beyond-Spec.md`), re-confirmed present in code, reported still broken live.
3. **The Conduit Workspace dashboard's card content is right, but the arrangement/layout still doesn't match the reference photo (`IMG_1365.jpeg`) closely enough.** No specifics given yet on what's different.

**None of these three were investigated or fixed this session — explicit founder instruction was to stop and document, not chase them, since the session's usage window was ending.**

**Do NOT assume items 1/2 are broken code and jump straight to writing a different fix.** Both were independently built, doc'd, and `tsc`/`expo export`-verified as working earlier in this exact same session, with no code change to either area in between. The much more likely explanation is a **stale build/cache being tested** — an old Metro bundle, a browser tab that never hard-reloaded, or a leftover backend/Metro process from before the fix landed. **First step next session: confirm you're looking at a genuinely fresh build** (hard-reload, check Metro's build log/timestamp, restart both processes clean via `npm run dev`) **before** re-diagnosing or rewriting either fix. Only if it's still broken against a confirmed-fresh build should this be treated as a real, still-open bug.

For the dashboard arrangement (item 3), get a specific description or fresh comparison from the founder before changing any layout — don't guess a second time.

Full detail on all three: `task_folder/task_app_progress.md`'s "Task 3 — Session Update 2026-07-22 (continued again)" section, and `task_folder/Task-03-Additions-Beyond-Spec.md`'s item 12.

---

## 0. TL;DR for whoever/whatever picks this up next (read this first, then §1-7 for detail)

- **Read the ⚠️ flag at the very top of this file before anything else** — 2 previously-"fixed" bugs (back button, profile-icon tap) were reported still failing in a live re-check at the end of this session, and the dashboard layout still doesn't match the reference image closely enough. Neither was investigated — re-verify against a fresh build first, don't assume the code is wrong.
- **Task 3 (Conduit Creation + Invitation) is built, real-bug-tested across THREE full sessions of live usage, and NOT marked ✅ Complete.** Carried forward with one unchanged infra gap (the hourly expiry-sweep cron has no scheduler wired anywhere), one unresolved/unconfirmed browser-tunnel-auth issue from an earlier session, and the three end-of-session items flagged above. Full detail: `task_folder/task_app_progress.md`'s Task 3 session-update entries (2026-07-20, 2026-07-21, 2026-07-22, and 2026-07-22 "continued again").
- **`task_folder/Task-03-Additions-Beyond-Spec.md` lists everything built beyond Task 3's original brief** — 10 items now, including this session's additions: password add/change (`app/profile/password.tsx`), live Profile ID availability checking (`GET /v1/profiles/check-id`), the header-nav redesign (My Profile moved from the hamburger onto the avatar), and — most importantly — `lib/confirm.ts`, which replaces `Alert.alert` everywhere in the codebase because **`Alert.alert` is a complete no-op on `react-native-web`** (confirmed directly in its source). **Read this before starting Task 4, and never call `Alert.alert` directly anywhere in this codebase going forward** — it will compile fine and silently do nothing on web.
- **Real Supabase credentials exist in `.env` at the repo root** (gitignored, already present).
- **This Codespace's networking only requires ONE port to be public: 8081 (Metro's dev server).** `metro.config.js` proxies all `/v1/*` and `/health` requests to the backend on port 4055 internally. Run `npm run dev` (starts both together) and confirm port 8081 is Public (`gh codespace ports visibility 8081:public -c $CODESPACE_NAME` if needed).
- **THE PLAN GOING FORWARD, IMPORTANT — read carefully:**
  1. **This session's work is on branch `feature/task3-conduit-invitation`** and has been pushed to `origin`. The founder merges this into `main` themselves — **no agent should ever merge or push directly to `main`.**
  2. **Before starting any Task 4 code, the next session must:**
     a. Run `git fetch origin` and **check all branches on `origin`** (`git branch -r`) — confirm `feature/task3-conduit-invitation` has actually been merged into `main` by the founder before proceeding. If it hasn't been merged yet, **stop and ask the founder**, don't build Task 4 on top of an unmerged `main`.
     b. Once confirmed merged, run `git checkout main && git pull origin main`, then create a **new branch off updated `main`** for Task 4 (suggested name: `feature/task4-paystack-entitlement`, matching the existing convention).
     c. Work Task 4 entirely on the new branch. **Never push directly to `main`.**
     d. **Push the new branch to `origin` at any natural stopping point** — nothing survives between sessions in this Codespace except what's actually on `origin`.
  3. **Task 4's brief does not exist yet** as of this update (`task_folder/` has no `Task-04-...md`). Check `main` for it first (the founder sometimes pushes briefs directly via GitHub's web UI) before assuming it needs to be generated.
- **Testing method: `npx expo start --web` in Chrome/Edge, not Expo Go on a phone.** Unchanged from before.

---

## 1. Where things actually stand

- **Task 1 (Project Scaffolding + Full Database Schema): merged into `main`, migration run for real.** Unchanged since the last update — see `task_app_progress.md`'s Task 1 section.

- **Task 2 (Auth + Profile ID): substantively built and real-bug-tested. Deliberately NOT marked ✅ Complete — carried forward with one documented gap (no SMS provider).** Unchanged since the last update.

- **Task 3 (Conduit Creation + Invitation): built and real-bug-tested across THREE sessions now (2026-07-20 initial build, 2026-07-21 live-usage bug-fixing, 2026-07-22 a second, more thorough round of live-usage bug-fixing plus a Conduit Workspace dashboard redesign). NOT marked ✅ Complete.**
  - Brief: `task_folder/Task-03-Conduit-Creation-Invitation.md` + `task_folder/Task-03-Additions-Beyond-Spec.md` (now 12 items — read it in full before touching any Conduit/Profile/auth screen).
  - Branch: `feature/task3-conduit-invitation`, off `main`. **Pushed to `origin` — the founder merges this into `main` themselves.**
  - **This session's real bugs found and fixed (see `task_app_progress.md`'s 2026-07-22 entry for full detail):** (1) header back button silently failing due to Splash's routing effect re-firing on background token refresh; (2) Accept Invitation 400 due to a Fastify empty-JSON-body quirk in `apiPost`; (3) **`Alert.alert` being a total no-op on web** — the root cause behind three separately-reported bugs (Delete Conduit, Skip on Boundary, login error visibility) at once; (4) Delete Conduit still 500-ing for any non-draft Conduit due to an FK constraint on `notifications`, fixed with both a targeted cleanup and a defensive dependent-records check across every other table that references `conduits`; (5) login error messages now translated and actually visible (with an explicit, documented limit: Supabase intentionally can't distinguish wrong-password from wrong-email, by design, to prevent account enumeration); (6) password add/change flow added to Profile; (7) live Profile-ID availability checking added; (8) header nav redesigned (My Profile moved from hamburger to the avatar); (9) Conduit Workspace dashboard rebuilt to match the real reference image (`IMG_1365.jpeg`) — 6-card grid (Land Information, Live Commodity Price, Harvest Records, Invoice, Security Information, **Add-on** — renamed from "Additional Activation" per explicit instruction), Partner card with Trust Score + 5 icon shortcuts, Activity Timeline card.
  - **⚠️ Reported still broken in a live re-check at the very end of this session, NOT investigated (see the flag at the top of this file):** items 1 and 8 above (back button, profile-icon tap) — both had been coded and verified earlier the same session. Also: the dashboard's arrangement (item 9) doesn't yet match the reference closely enough, per the founder, though the card content itself is confirmed right.
  - **Other open items, carried forward, still unresolved:** (1) no scheduler for the hourly expiry-sweep cron — infra decision, not code; (2) a browser-side 404 pattern from an earlier session, diagnosed as a likely stale Codespaces tunnel-auth cookie, recommended fix given but not independently reconfirmed since.

- **Task 4 (Paystack Payment + Entitlement Engine Core): not started, no brief exists yet as of this update.**

- **Tasks 5–20:** not started, no briefs written yet.

## 2. What to do right now (for whoever picks this up next)

1. **Read the ⚠️ flag at the very top of this file first.** Confirm you're testing against a genuinely fresh build (hard-reload, restart `npm run dev` clean, check Metro's own build log/timestamp) before assuming the back-button or profile-icon fixes are actually broken code — both were verified working earlier in the same session they were later reported broken in, with no code change in between.
2. **Read `task_folder/task_app_progress.md`'s Task 3 session sections in full** (search for "Session Update 2026-07-20", "2026-07-21", "2026-07-22", and "2026-07-22 (continued again)") — the single source of truth for exactly what was built, fixed, and left open.
3. **Read `task_folder/Task-03-Additions-Beyond-Spec.md` in full — it now has 12 items.** Pay special attention to item 10 (`lib/confirm.ts`) — **never call `Alert.alert` directly** in any new code; use `confirmAction`/`notify` instead, or it will silently do nothing on web. Also read item 12 (the end-of-session flag) before touching the back button, profile icon, or the Conduit Workspace layout.
4. **Check `git branch -r` and confirm `feature/task3-conduit-invitation` has been merged into `main`** before doing anything else. If unmerged, stop and ask the founder.
5. **Once merged, branch off updated `main`** for Task 4. Check `main` for an existing Task 4 brief before assuming one needs to be written.
6. **Start both the backend and Metro with `npm run dev`.** Confirm port 8081 is Public (`gh codespace ports visibility 8081:public -c $CODESPACE_NAME`) — port 4055 no longer needs to be public. Confirm both respond before writing code.
7. **When testing anything that shows a confirm dialog or an error/success message, verify it's actually using `confirmAction`/`notify` from `lib/confirm.ts`, not a raw `Alert.alert`** — this was the root cause of several bugs across two sessions before it was finally found and fixed everywhere.
8. **Push the new Task 4 branch to `origin` at any natural stopping point.**

## 3. Known messes in this repo — don't get confused by these

- **`task_folder/task_app_progress (1).md` existed on `main` and was STALE** — deleted 2026-07-17. `task_folder/task_app_progress.md` (no suffix) is the one, real, maintained tracker.
- **The amendments log was renamed.** It's `docs/AgroLease-Product-Plan-Amendments.md` now (was briefly `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md`).
- **The founder edits/uploads files directly to `main` via GitHub's web UI sometimes**, outside of any agent session. Always `git fetch origin main` and check for new files there before assuming you've seen everything.
- **`Error_screenshot.png` at the repo root is a genuinely empty (0-byte) file** — not a real screenshot, don't try to read it.
- **Port 4000 got stuck as a leftover shell environment variable in an earlier session** and silently shadowed every `.env` edit — the backend runs on port **4055** instead. If a future session sees the backend refusing to pick up an env change, `echo $BACKEND_PORT` in the shell before assuming the `.env` file itself is wrong.
- **Codespace port visibility does not persist across restarts, and setting it via `gh codespace ports visibility` from inside the Codespace itself has been unreliable** — it works sometimes and silently fails to register at other times. **Workaround in place: `metro.config.js` proxies backend requests through Metro's own port (8081), so only that ONE port needs to be public.**
- **`Alert.alert` is a permanent no-op on `react-native-web`** (confirmed in its own source: `static alert() {}`) — this is not a bug that can be "fixed" upstream from this repo, it's a fundamental gap in `react-native-web`'s own implementation. Always use `confirmAction`/`notify` from `lib/confirm.ts` instead. This caused at least 3 separately-reported "bugs" across two sessions before the actual root cause was found — check this first if any button/action "does nothing" on web with no visible error.
- **Several disposable Admin-API test accounts from earlier sessions could not be fully deleted** due to transient Supabase Admin API 500s — harmless orphaned auth-only rows, not blocking anything, worth a retry in a future session.

## 4. Repo layout reminder (three separate npm projects, one repo)

- **Root (`/`)** — the actual AgroLease mobile app (Expo, SDK 54). `npm install` here only installs this project's deps. **`npm run dev` starts both this and the backend together.**
- **`/backend`** — Fastify API for the mobile app. Separate `package.json`. Runs on port **4055**, but no longer needs to be publicly forwarded — Metro's dev server proxies to it internally.
- **`/web`** — the already-live public price website (Next.js, deployed on Vercel). Unrelated to the mobile app tasks. Don't touch unless a task explicitly says to.
- **`/scraper`** — feeds `/web`'s price data. Also unrelated to mobile app tasks.

## 5. Logo — for the avoidance of doubt

The real app logo is **`/logo.png` at the repo root**. Never `web/logo.png` or `web/public/logo.png`. Leave `components/ui/AuthShell.tsx`'s logo as-is unless told otherwise again.

## 6. Real accounts in the live database (do not use these for testing — use disposable Admin-API accounts instead)

- `akintoyev612@gmail.com` — `profile_id: user0989`.
- `shiwonikuoluwabunmi@gmail.com` — `profile_id: sknoww`.
- `afterglowmindd@gmail.com` — `profile_id: user2948`, **`display_name` is stuck on a placeholder** ("afterglowmindd") — unrecoverable, can be corrected via Edit Profile or on direct request.
- `felicitysmoke612@gmail.com` — a real, genuinely Google-only account (`providers: ["google"]`, no email/password) discovered while building password management this session. Useful as a real reference for "no password set" testing — do not add a password to it or otherwise modify it without asking first, since it's not disposable test data, it's a real account from earlier testing.
- Two real draft Conduits exist from the founder's own live testing: `CON-NG-898790` ("jfjf") and `CON-NG-636701` ("my land in kaduna") — both genuinely `draft` status, awaiting a partner. Not test data to clean up; leave as-is unless told otherwise.

## 7. Branch history for reference

- `feature/task1-scaffolding-database` → PR #19 → merged into `main` (2026-07-17).
- `feature/task2-auth-profile-id` → merged into `main` (confirmed via branch #21 being cleanly based off it, no divergence).
- `feature/task3-conduit-invitation` → three sessions of work → **pending merge into `main` by the founder.**
- Next branch (name TBD, suggested `feature/task4-paystack-entitlement`) → **to be created off `main` after `feature/task3-conduit-invitation` merges** → Task 4.

---

*If anything in this file turns out to be wrong or out of date by the time you read it, fix it here too — that's the whole point of a handoff doc.*

