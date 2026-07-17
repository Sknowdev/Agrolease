# AgroLease — Session Handoff (read this first)

**Written:** 2026-07-16. **For:** whichever agent/session picks up Task 2 next.

This file exists because this repo currently has files scattered across two places — `main` (where the founder pushes docs/briefs directly via GitHub's web UI) and `feature/task1-scaffolding-database` (PR #19, where Task 1's actual code lives) — and a couple of stale/duplicate files from re-uploads. Read this before touching anything, so you don't work from the wrong copy of something.

---

## 1. Where things actually stand

- **Task 1 (Project Scaffolding + Full Database Schema): built, pushed, confirmed working.**
  - Branch: `feature/task1-scaffolding-database` — [PR #19](https://github.com/Sknowdev/Agrolease/pull/19), **not merged yet**.
  - Expo app (SDK 54, downgraded from 57 specifically so Expo Go on the founder's iPhone can run it), Fastify backend, full DB migration SQL — all committed there.
  - **Founder confirmed the app boots correctly** — web preview screenshot showed the real logo/title/subtitle, and on-device testing was only blocked by the founder's own internet that day, not by the app.
  - **Still open, real blocker:** `supabase/migrations/0004_mobile_app_schema.sql` (the Task 1 schema migration) has **not been confirmed run** against the real Supabase project. No agent so far has had real Supabase credentials in its sandbox. **Ask the founder directly whether this has been run before assuming any mobile-app table (`profiles`, `conduits`, etc.) exists in the live database.** Task 2's brief includes a step (`ALTER TABLE profiles DROP COLUMN IF EXISTS account_role;`) that only makes sense if `profiles` already exists — confirm before running it.
  - Full detailed history (every bug hit and fixed — SDK mismatch, missing `main` field, ngrok deprecation, Codespaces port visibility) is in `task_folder/task_app_progress.md`, under the dated "Update" sections. Worth skimming once if anything about Task 1's setup seems off later.

- **Task 2 (Auth + Profile ID): brief exists, not yet built.**
  - Brief: `task_folder/Task-02-Auth-ProfileID.md` — **on `main` only**, not on the Task 1 branch. Pull `main` to get it.
  - This is **Revision v5** — role selection is removed (Amendment 7), and instead of a generic dashboard stub, it builds real zero-states for Home and My Conduits per Amendment 8's three-tier structure. Read the brief's own header note — it explains this.

- **Tasks 3–20:** not started, no briefs written yet.

## 2. What to do right now

1. **Pull `main`** — it has the real Task 2 brief and the current amendments log, neither of which exist on the Task 1 branch:
   ```bash
   git fetch origin main
   git checkout main
   git pull
   ```
2. **Create a brand-new branch for Task 2** — explicitly instructed by the founder: **do not** build on or push to `feature/task1-scaffolding-database`. That branch/PR stays scoped to Task 1 only.
   ```bash
   git checkout -b feature/task2-auth-profile-id
   ```
3. **Read, in this order:**
   - `task_folder/Task-02-Auth-ProfileID.md` — the actual brief, self-contained
   - `docs/AgroLease-Product-Plan-Amendments.md` — specifically Amendments 7, 8, 9 (role removal, Home/My Conduits/Conduit Workspace split, Conduit Settings menu structure for later). Amendments 1–6 and 10 are about other tasks (price engine, weight recording, auto-renewal) — skim, not urgent for Task 2.
   - `task_folder/task_app_progress.md` (the file with **no** `(1)` suffix — see warning below) — Task 1's real status and the note at the bottom about this handoff.
4. **Confirm with the founder** whether `0004_mobile_app_schema.sql` has actually been run against Supabase yet, before assuming any mobile-app table exists.
5. Build Task 2 per its brief. Test against its own checklist honestly. Update `task_app_progress.md` (again — the no-suffix one) before ending the session: ✅ only for what's actually verified, ⚠️ Blocked with the specific reason for anything that isn't.

## 3. Known messes in this repo — don't get confused by these

- **`task_folder/task_app_progress (1).md` exists on `main` and is STALE.** It was created by an earlier partial re-upload and doesn't know Task 1 was ever built. **`task_folder/task_app_progress.md` (no suffix) is the real, maintained one.** Read/update that one only. The `(1)` copy should eventually be deleted directly on GitHub — not urgent, just don't be misled by it.
- **The amendments log was renamed.** It's `docs/AgroLease-Product-Plan-Amendments.md` now (was briefly `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md` — same content, different filename/casing from an earlier upload that got replaced). `docs/CHANGE_LOG_PRODUCT_PLAN.md`'s Section 14 still references the old name in its text — that's just stale prose, not a broken link in code anywhere.
- **The founder edits/uploads files directly to `main` via GitHub's web UI sometimes**, outside of any agent session. Always `git pull` on `main` before assuming you have the latest version of any doc or brief — an agent's own branch can be behind `main` on docs even while being ahead on code.

## 4. Repo layout reminder (three separate npm projects, one repo)

- **Root (`/`)** — the actual AgroLease mobile app (Expo, SDK 54). `npm install` here only installs this project's deps.
- **`/backend`** — Fastify API for the mobile app. Separate `package.json`. `npm run backend:install` / `npm run backend:dev` from the root are shortcuts into it.
- **`/web`** — the already-live public price website (Next.js, deployed on Vercel). Unrelated to the mobile app tasks. Don't touch unless a task explicitly says to.
- **`/scraper`** — feeds `/web`'s price data. Also unrelated to mobile app tasks. Amendment 1's AI price engine is scoped to a future mobile-app task (Task 14), not this existing scraper — see `docs/CHANGE_LOG_PRODUCT_PLAN.md` Section 14.

---

*If anything in this file turns out to be wrong or out of date by the time you read it, fix it here too — that's the whole point of a handoff doc.*
