# AgroLease — Session Handoff (read this first)

**Written:** 2026-07-16. **Updated:** 2026-07-17 (Task 1 merge + Task 2 start). **For:** whichever agent/session picks up Task 2's continuation next.

This file exists because this repo has had files scattered across two places — `main` (where the founder pushes docs/briefs directly via GitHub's web UI) and per-task feature branches — plus a couple of stale/duplicate files from re-uploads. Read this before touching anything, so you don't work from the wrong copy of something.

---

## 1. Where things actually stand

- **Task 1 (Project Scaffolding + Full Database Schema): merged into `main`.**
  - [PR #19](https://github.com/Sknowdev/Agrolease/pull/19) was **merged by the founder on 2026-07-17 22:26 UTC**. Its branch, `feature/task1-scaffolding-database`, is no longer where the current code lives — Task 1's Expo app, `/backend`, `/constants`, `/hooks`, `/lib`, `/satellite`, `eas.json`, and `supabase/migrations/0004_mobile_app_schema.sql` (+ rollback) are all directly on `main` now. A fresh clone of `main` already has all of it — no need to pull a separate branch for Task 1's code anymore.
  - **Founder confirmed the app boots correctly** — web preview screenshot showed the real logo/title/subtitle, and on-device testing was only blocked by the founder's own internet that day, not by the app.
  - **Still open, real blocker, unchanged by the merge:** `supabase/migrations/0004_mobile_app_schema.sql` has **not been confirmed run** against the real Supabase project. Merging the PR only merges the SQL file's *text* into `main` — it does not execute it. No agent so far has had real Supabase credentials in its sandbox. **Ask the founder directly whether this has been run before assuming any mobile-app table (`profiles`, `conduits`, etc.) exists in the live database.** Task 2's brief includes a step (`ALTER TABLE profiles DROP COLUMN IF EXISTS account_role;`) that only makes sense if `profiles` already exists — confirm before running it.
  - Full detailed history (every bug hit and fixed — SDK mismatch, missing `main` field, ngrok deprecation, Codespaces port visibility) is in `task_folder/task_app_progress.md`, under the dated "Update" sections. Worth skimming once if anything about Task 1's setup seems off later.

- **Task 2 (Auth + Profile ID): build started 2026-07-17.**
  - Brief: `task_folder/Task-02-Auth-ProfileID.md` (Revision v5) — role selection is removed (Amendment 7), and instead of a generic dashboard stub, it builds real zero-states for Home and My Conduits per Amendment 8's three-tier structure. Read the brief's own header note — it explains this.
  - Being built on branch `feature/task2-auth-profile-id`, off current `main` — **not** on `feature/task1-scaffolding-database` (that PR is merged and closed now, but the same "don't build Task 2 on Task 1's branch" instruction still applies in spirit: keep each task on its own branch).
  - Per explicit instruction from this session: **do not push directly to `main`.** All Task 2 work stays on its own branch until a PR is opened for review.

- **Tasks 3–20:** not started, no briefs written yet.

## 2. What to do right now (for whoever picks this up next)

1. **Pull `main`** — it now already contains Task 1's merged code plus the Task 2 brief and amendments log:
   ```bash
   git fetch origin main
   git checkout main
   git pull
   ```
2. **Check out (or create) the Task 2 branch** rather than working on `main` directly:
   ```bash
   git checkout feature/task2-auth-profile-id
   # or, if it doesn't exist locally yet:
   git checkout -b feature/task2-auth-profile-id origin/feature/task2-auth-profile-id
   ```
3. **Read, in this order:**
   - `task_folder/Task-02-Auth-ProfileID.md` — the actual brief, self-contained
   - `docs/AgroLease-Product-Plan-Amendments.md` — specifically Amendments 7, 8, 9 (role removal, Home/My Conduits/Conduit Workspace split, Conduit Settings menu structure for later). Amendments 1–6 and 10 are about other tasks (price engine, weight recording, auto-renewal) — skim, not urgent for Task 2.
   - `task_folder/task_app_progress.md` — Task 1 and Task 2's real current status, plus the dated "Update" sections at the bottom.
4. **Confirm with the founder** whether `0004_mobile_app_schema.sql` has actually been run against Supabase yet, before assuming any mobile-app table exists.
5. Continue/finish Task 2 per its brief. Test against its own checklist honestly. Update `task_app_progress.md` before ending the session: ✅ only for what's actually verified, ⚠️ Blocked with the specific reason for anything that isn't.

## 3. Known messes in this repo — don't get confused by these

- **`task_folder/task_app_progress (1).md` existed on `main` and was STALE** — created by an earlier partial re-upload, didn't know Task 1 was ever built, and referenced a nonexistent `App_logo.png`. **Deleted on 2026-07-17** as part of starting Task 2. `task_folder/task_app_progress.md` (no suffix) is the one, real, maintained tracker — it always was.
- **The amendments log was renamed.** It's `docs/AgroLease-Product-Plan-Amendments.md` now (was briefly `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md` — same content, different filename/casing from an earlier upload that got replaced). `docs/CHANGE_LOG_PRODUCT_PLAN.md`'s Section 14 still references the old name in its text — that's just stale prose, not a broken link in code anywhere.
- **The founder edits/uploads files directly to `main` via GitHub's web UI sometimes**, outside of any agent session. Always `git pull` on `main` before assuming you have the latest version of any doc or brief — an agent's own branch can be behind `main` on docs even while being ahead on code.

## 4. Repo layout reminder (three separate npm projects, one repo)

- **Root (`/`)** — the actual AgroLease mobile app (Expo, SDK 54). `npm install` here only installs this project's deps.
- **`/backend`** — Fastify API for the mobile app. Separate `package.json`. `npm run backend:install` / `npm run backend:dev` from the root are shortcuts into it.
- **`/web`** — the already-live public price website (Next.js, deployed on Vercel). Unrelated to the mobile app tasks. Don't touch unless a task explicitly says to.
- **`/scraper`** — feeds `/web`'s price data. Also unrelated to mobile app tasks. Amendment 1's AI price engine is scoped to a future mobile-app task (Task 14), not this existing scraper — see `docs/CHANGE_LOG_PRODUCT_PLAN.md` Section 14.

## 5. Logo — for the avoidance of doubt

The real app logo is **`/logo.png` at the repo root**. Never `web/logo.png` or `web/public/logo.png` — those belong to the separate, already-live public price website and are a different asset. `app.json`'s `icon`/`splash`/`favicon` fields already point at the correct root file — don't change this.

---

*If anything in this file turns out to be wrong or out of date by the time you read it, fix it here too — that's the whole point of a handoff doc.*
