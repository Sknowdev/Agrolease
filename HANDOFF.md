# AgroLease — Session Handoff (read this first)

**Written:** 2026-07-16. **Updated:** 2026-07-20 (major Task 2 session — migrations run for real, real bugs fixed, visual rework, still not done). **For:** whichever agent/session picks up Task 2's continuation next.

This file exists because this repo has had files scattered across two places — `main` (where the founder pushes docs/briefs directly via GitHub's web UI) and per-task feature branches — plus a couple of stale/duplicate files from re-uploads. Read this before touching anything, so you don't work from the wrong copy of something.

---

## 0. TL;DR for whoever/whatever picks this up next (read this first, then §1-6 for detail)

- **Real Supabase credentials exist in `.env` at the repo root** (gitignored, already present — do not ask the founder for them again, they're there).
- **Migrations `0004` and `0005` have been RUN for real against the live Supabase project** (2026-07-20, via the SQL Editor). `profiles` and every other Task 1/2 table genuinely exist now. This is a real milestone — every previous handoff note calling this "the standing blocker" is now resolved.
- **Email signup → confirm → login → session → Home works end to end**, confirmed with the founder's own two real accounts. Email confirmation is link-based only (Supabase free tier, no custom SMTP — cannot be changed to a numeric code), and the app's Verification screen was rewritten to match that reality ("Check your email" + Resend, not a code field).
- **Two real backend bugs were found and fixed this session**: wrong "active country" resolution (was reading the price website's own `active` flag, picked Ghana instead of Nigeria) and a missing profile-creation-on-login call (only Sign Up created a profile; Login now does too, idempotently).
- **Google OAuth returns 400 and phone/SMS auth doesn't work at all** — both are **Supabase dashboard configuration gaps**, not code bugs. Cannot be fixed from this repo. Ask the founder whether they've enabled the Google provider (needs a real Client ID/Secret) and set a real Site URL (currently the dead default `http://localhost:3000`) before re-testing those paths.
- **Full detailed account of everything done today**: `task_folder/task_app_progress.md`, the section titled **"Task 2 — Session Update 2026-07-20"** near the bottom. Read that in full before writing any new code — it lists exactly what's fixed, what's verified, and what's still open, in order.
- **Everything from today is committed** to `feature/task2-auth-profile-id` (this branch) — nothing is sitting uncommitted. `git log --oneline -5` to confirm before assuming otherwise.
- **Testing method: `npx expo start --web` in Chrome, not Expo Go on a phone.** Multiple real attempts to reach a physical iPhone via Expo Go this session all hit dead ends (Codespaces port forwarding + `exp://` doesn't work with iOS Expo Go's URL entry, `--tunnel` mode's bundled ngrok is deprecated, a manual localtunnel workaround wasn't reliable either) — don't re-attempt this unless something genuinely needs a real device (camera, push notifications).

---

## 1. Where things actually stand

- **Task 1 (Project Scaffolding + Full Database Schema): merged into `main`, AND its migration has now actually been run.**
  - [PR #19](https://github.com/Sknowdev/Agrolease/pull/19) was merged by the founder on 2026-07-17. Task 1's code has been on `main` since then.
  - **Update 2026-07-20: `supabase/migrations/0004_mobile_app_schema.sql` was run for real** against the live Supabase project this session, using real credentials now present in `.env`. Verified directly (service-role client): every new table exists, `country_config`'s 19 rows are untouched, Nigeria's row correctly has its 4 new mobile-app columns populated. **This was the standing blocker since Task 1 was built — it is now resolved.** The only Task 1 item still open is the pre-existing non-square-logo `expo-doctor` warning (unchanged, not urgent).

- **Task 2 (Auth + Profile ID): substantial progress this session, NOT ready to mark ✅ Complete.**
  - Brief: `task_folder/Task-02-Auth-ProfileID.md` (Revision v5).
  - Branch: `feature/task2-auth-profile-id`, off `main`. Per standing instruction: **do not push directly to `main`.**
  - `supabase/migrations/0005_task2_auth_profile.sql` has also now been run for real (same session as `0004` above).
  - Two real backend bugs fixed, one major UX flow (email verification) redesigned to match Supabase's actual free-tier behavior, and a large visual rework done to match the founder's real reference mockups (`app_refrence.png/` — now 11 images). **Full detail: `task_folder/task_app_progress.md`'s "Task 2 — Session Update 2026-07-20" section — read that before continuing.**
  - **Still open, dashboard-only (not code):** Google OAuth provider not enabled in Supabase, Site URL still the dead default, no SMS provider configured.
  - **Still open, code-side but not yet re-tested this session:** phone auth end-to-end, the full Security Access loop, Forgot Password's email path, Welcome's Profile ID generation on a fresh signup, and a full re-run of the brief's own checklist now that the DB is finally live.

- **Tasks 3–20:** not started, no briefs written yet.

## 2. What to do right now (for whoever picks this up next)

1. **Don't re-clone or re-pull assuming things are missing** — check `git log --oneline -10` and `git status` on `feature/task2-auth-profile-id` first. Everything from 2026-07-20's session is already committed there.
2. **Read `task_folder/task_app_progress.md`'s "Task 2 — Session Update 2026-07-20" section in full** — it is the single source of truth for exactly what changed today and what's left, in priority order.
3. **Restart the backend and Metro before touching anything** — neither survives between sessions in this Codespace. See that same section's "Environment/tooling notes" for the exact port (backend runs on **4055**, not 4000 — there's a reason, it's documented there), CORS, and public-port-forwarding steps. Confirm both respond (`curl` `/health` and the web root) before writing code.
4. **Ask the founder directly** whether they've enabled Google OAuth and fixed the Supabase Site URL in the dashboard (both blocking real test coverage, both outside this repo's control).
5. Work through the remaining checklist items listed in that section, updating `task_app_progress.md` honestly as you go — ✅ only for what's actually verified, ⚠️ Blocked with the specific reason for anything that isn't.

## 3. Known messes in this repo — don't get confused by these

- **`task_folder/task_app_progress (1).md` existed on `main` and was STALE** — deleted 2026-07-17. `task_folder/task_app_progress.md` (no suffix) is the one, real, maintained tracker.
- **The amendments log was renamed.** It's `docs/AgroLease-Product-Plan-Amendments.md` now (was briefly `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md`).
- **The founder edits/uploads files directly to `main` via GitHub's web UI sometimes**, outside of any agent session — including mid-session image uploads to `app_refrence.png/` this very session. Always `git fetch origin main` and check for new files there before assuming you've seen every reference image; use `git checkout origin/main -- app_refrence.png/` to pull just that folder in without merging anything else.
- **`Error_screenshot.png` at the repo root is a genuinely empty (0-byte) file** — not a real screenshot, don't try to read it, don't worry about the "image data cannot be empty" error if it comes up again.
- **Port 4000 got stuck as a leftover shell environment variable this session** and silently shadowed every `.env` edit — the backend now runs on port **4055** instead as the fix. If a future session sees the backend refusing to pick up an env change, `echo $BACKEND_PORT` in the shell before assuming the `.env` file itself is wrong.

## 4. Repo layout reminder (three separate npm projects, one repo)

- **Root (`/`)** — the actual AgroLease mobile app (Expo, SDK 54). `npm install` here only installs this project's deps.
- **`/backend`** — Fastify API for the mobile app. Separate `package.json`. `npm run backend:install` / `npm run backend:dev` from the root are shortcuts into it. Runs on port **4055** in this Codespace (see §3).
- **`/web`** — the already-live public price website (Next.js, deployed on Vercel). Unrelated to the mobile app tasks. Don't touch unless a task explicitly says to.
- **`/scraper`** — feeds `/web`'s price data. Also unrelated to mobile app tasks.

## 5. Logo — for the avoidance of doubt

The real app logo is **`/logo.png` at the repo root**. Never `web/logo.png` or `web/public/logo.png`. `app.json`'s `icon`/`splash`/`favicon` fields already point at the correct root file — don't change this.

---

*If anything in this file turns out to be wrong or out of date by the time you read it, fix it here too — that's the whole point of a handoff doc.*
