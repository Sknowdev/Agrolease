# AgroLease — Session Handoff (read this first)

**Written:** 2026-07-16. **Updated:** 2026-07-20 (end of Task 2 session — moving to Task 3 on a new branch). **For:** whichever agent/session picks up Task 3 next.

This file exists because this repo has had files scattered across two places — `main` (where the founder pushes docs/briefs directly via GitHub's web UI) and per-task feature branches — plus a couple of stale/duplicate files from re-uploads. Read this before touching anything, so you don't work from the wrong copy of something.

---

## 0. TL;DR for whoever/whatever picks this up next (read this first, then §1-7 for detail)

- **Task 2 (Auth + Profile ID) is done being actively worked, but is deliberately NOT marked ✅ Complete.** It's being carried forward with one documented, dashboard-only gap (no SMS provider — phone auth doesn't work). Everything else was built, real-bug-tested against the live Supabase project through extensive actual usage (not just code review), and fixed. Full detail: `task_folder/task_app_progress.md`'s "Task 2 — Session Update 2026-07-20" section and its "(final)" follow-up at the very bottom of that file.
- **`task_folder/Task-02-Additions-Beyond-Spec.md` lists everything built that Task 2's original brief never asked for** (hamburger menu, avatar placeholder, Profile-screen Profile ID editing, Recent Activity screen, refresh-in-menu, `useFocusEffect` fix, back button, error banners, tappable stat cards) — **read this before starting Task 3** so nothing gets accidentally re-specified or rebuilt.
- **Real Supabase credentials exist in `.env` at the repo root** (gitignored, already present).
- **Migrations `0004` and `0005` have been run for real against the live Supabase project.** Every Task 1/2 table genuinely exists. Google OAuth and the Site URL are also fully configured now. The only unresolved dashboard gap left is SMS (phone auth) — a founder product decision (launch without it vs. block on it), not something to fix in code.
- **THE PLAN GOING FORWARD, IMPORTANT — read carefully:**
  1. **This session's work is on branch `feature/task2-auth-profile-id` ("branch #20")** and has been pushed to `origin`. The founder will merge this branch into `main` themselves — **no agent should ever merge or push directly to `main`.**
  2. **Before starting any Task 3 code, the next session must:**
     a. Run `git fetch origin` and **check all branches on `origin`** (`git branch -r`), not just `main` — confirm branch #20 has actually been merged into `main` by the founder (look for the merge commit, or confirm Task 2's files/commits are present on `origin/main`) before proceeding. If it hasn't been merged yet, **stop and ask the founder**, don't build Task 3 on top of an unmerged `main`.
     b. Once confirmed merged, run `git checkout main && git pull origin main`, then create a **new branch off updated `main`** for Task 3 — this is **branch #21**. Suggested name: `feature/task3-conduit-invitation` (matches the existing `feature/taskN-...` naming convention — check `git branch -r` for the exact pattern used by branches 19/20 first).
     c. Work Task 3 entirely on branch #21. **Never push directly to `main`.**
     d. **When Task 3's work is done (or at any natural stopping point), push branch #21 to `origin`** (`git push -u origin <branch-21-name>`). This is essential — a fresh Codespace/session will have zero access to any local-only commits, since nothing survives between sessions except what's actually on `origin`. Don't leave work sitting local-only at the end of a session.
  3. **Task 3's brief already exists**, pushed directly to `main` by the founder: `task_folder/Task-03-Conduit-Creation-Invitation.md`. It is **not yet on this branch** (`feature/task2-auth-profile-id`) — it'll arrive automatically once you branch #21 off updated `main` per step (b) above. Read it in full, plus `docs/AgroLease-Product-Plan-Amendments.md` (especially Amendments 7-9, which already shaped Task 2 and likely affect Task 3's Conduit/Security design too) before writing any code.
- **Testing method: `npx expo start --web` in Chrome, not Expo Go on a phone.** Multiple real attempts to reach a physical iPhone via Expo Go hit dead ends this project (Codespaces port forwarding + `exp://` doesn't work with iOS Expo Go's manual URL entry, `--tunnel` mode's bundled ngrok is deprecated, a manual localtunnel workaround wasn't reliable either) — don't re-attempt this unless something genuinely needs a real device (camera, push notifications).

---

## 1. Where things actually stand

- **Task 1 (Project Scaffolding + Full Database Schema): merged into `main`, migration run for real.** [PR #19](https://github.com/Sknowdev/Agrolease/pull/19) merged 2026-07-17. `0004_mobile_app_schema.sql` run for real against the live Supabase project on 2026-07-20 — verified directly, every new table exists, `country_config`'s 19 rows untouched. Only open item: pre-existing non-square-logo `expo-doctor` warning (cosmetic, not urgent).

- **Task 2 (Auth + Profile ID): substantively built and real-bug-tested this session. Deliberately NOT marked ✅ Complete — carried forward with one documented gap.**
  - Brief: `task_folder/Task-02-Auth-ProfileID.md` (Revision v5) + `task_folder/Task-02-Additions-Beyond-Spec.md` (everything built beyond that brief — read this one too).
  - Branch: `feature/task2-auth-profile-id` ("branch #20"), off `main`. **Pushed to `origin` — the founder merges this into `main` themselves.**
  - `supabase/migrations/0005_task2_auth_profile.sql` has also been run for real.
  - Numerous real bugs found and fixed through actual live usage this session (wrong active-country resolution, missing profile-creation-on-login, signup name/phone data loss across the email-confirmation gap, CORS, silent error swallowing, stale data on navigation, Google OAuth redirect race, and more) — see `task_folder/task_app_progress.md`'s full session log for the complete list.
  - **The one remaining gap, dashboard-only, not code: no SMS provider configured in Supabase.** Phone-based signup/login/OTP and "Reset via SMS" cannot work until this is set up — explicitly deferred as a founder product/launch decision, not something an agent can fix from this repo.
  - Google OAuth and Supabase's Site URL are both now fully configured and confirmed working (up to Google's real consent screen; a live interactive click-through from a real browser is the one thing no sandbox can fully test).

- **Task 3 (Conduit Creation + Invitation): brief exists on `main`, not started.**
  - Brief: `task_folder/Task-03-Conduit-Creation-Invitation.md` (pushed directly to `main` by the founder, 2026-07-20).
  - **To be built on branch #21, off `main`, after branch #20 is merged.** See the TL;DR plan above for the exact sequence.

- **Tasks 4–20:** not started, no briefs written yet.

## 2. What to do right now (for whoever picks this up next)

1. **Read `task_folder/task_app_progress.md`'s Task 2 session sections in full** (search for "Session Update 2026-07-20") — the single source of truth for exactly what was built, fixed, and left open this session.
2. **Read `task_folder/Task-02-Additions-Beyond-Spec.md`** — everything built beyond Task 2's original text brief, so Task 3 doesn't re-specify or rebuild any of it.
3. **Check `git branch -r` and confirm branch #20 (`feature/task2-auth-profile-id`) has been merged into `main`** before doing anything else. If unmerged, stop and ask the founder — do not start Task 3 work on an unmerged `main`.
4. **Once merged, branch #21 off updated `main`** for Task 3 (see TL;DR step 2b above for the exact commands). Read `task_folder/Task-03-Conduit-Creation-Invitation.md` and the relevant Amendments before writing code.
5. **Restart the backend and Metro before touching anything** — neither survives between sessions in this Codespace. Backend runs on **port 4055** (not 4000 — see §3 below for why), Metro/web on port 8081. Both need `gh codespace ports visibility <port>:public -c $CODESPACE_NAME` after every restart. `EXPO_PUBLIC_API_BASE_URL` in `.env` must point at the backend's current public forwarded URL, and Metro must restart after any `.env` change (inlined at bundle time). Confirm both respond (`curl` `/health` and the web root) before writing code.
6. **Push branch #21 to `origin` once Task 3 work reaches a stopping point** — don't leave it local-only. `git push -u origin <branch-21-name>`.

## 3. Known messes in this repo — don't get confused by these

- **`task_folder/task_app_progress (1).md` existed on `main` and was STALE** — deleted 2026-07-17. `task_folder/task_app_progress.md` (no suffix) is the one, real, maintained tracker.
- **The amendments log was renamed.** It's `docs/AgroLease-Product-Plan-Amendments.md` now (was briefly `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md`).
- **The founder edits/uploads files directly to `main` via GitHub's web UI sometimes**, outside of any agent session — including `task_folder/Task-03-Conduit-Creation-Invitation.md` and several `app_refrence.png/*` images mid-session. Always `git fetch origin main` and check for new files there before assuming you've seen everything — use `git checkout origin/main -- <path>` to pull just what you need in without merging anything else into your working branch.
- **`Error_screenshot.png` at the repo root is a genuinely empty (0-byte) file** — not a real screenshot, don't try to read it, don't worry about an "image data cannot be empty" error if it comes up again.
- **Port 4000 got stuck as a leftover shell environment variable in an earlier session** and silently shadowed every `.env` edit — the backend now runs on port **4055** instead as the fix. If a future session sees the backend refusing to pick up an env change, `echo $BACKEND_PORT` in the shell before assuming the `.env` file itself is wrong.

## 4. Repo layout reminder (three separate npm projects, one repo)

- **Root (`/`)** — the actual AgroLease mobile app (Expo, SDK 54). `npm install` here only installs this project's deps.
- **`/backend`** — Fastify API for the mobile app. Separate `package.json`. `npm run backend:install` / `npm run backend:dev` from the root are shortcuts into it. Runs on port **4055** in this Codespace (see §3).
- **`/web`** — the already-live public price website (Next.js, deployed on Vercel). Unrelated to the mobile app tasks. Don't touch unless a task explicitly says to.
- **`/scraper`** — feeds `/web`'s price data. Also unrelated to mobile app tasks.

## 5. Logo — for the avoidance of doubt

The real app logo is **`/logo.png` at the repo root**. Never `web/logo.png` or `web/public/logo.png`. `app.json`'s `icon`/`splash`/`favicon` fields already point at the correct root file — don't change this. The founder has, at various points, said both "remove the logo from the auth screen" and later "don't remove it" — **final instruction was DO NOT remove it**. Leave `components/ui/AuthShell.tsx`'s logo as-is unless told otherwise again.

## 6. Real accounts in the live database (do not use these for testing — use disposable Admin-API accounts instead, same pattern as this session)

- `akintoyev612@gmail.com` — `profile_id: user0989`.
- `shiwonikuoluwabunmi@gmail.com` — `profile_id: sknow` (founder changed this themselves via the new free-form Profile ID edit).
- `afterglowmindd@gmail.com` — `profile_id: user2948`, **`display_name` is stuck on a placeholder** ("afterglowmindd") — this account predates the signup `user_metadata` fix, and the originally-typed name was never stored anywhere recoverable. Can be corrected via Edit Profile (self-service) or on direct request — not auto-fixed.

## 7. Branch history for reference

- `feature/task1-scaffolding-database` → PR #19 → merged into `main` (2026-07-17).
- `feature/task2-auth-profile-id` ("branch #20") → this session's work → **pending merge into `main` by the founder**.
- Branch #21 (name TBD, suggested `feature/task3-conduit-invitation`) → **to be created off `main` after #20 merges** → Task 3.

---

*If anything in this file turns out to be wrong or out of date by the time you read it, fix it here too — that's the whole point of a handoff doc.*
