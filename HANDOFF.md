# AgroLease — Session Handoff (read this first)

**Written:** 2026-07-16. **Updated:** 2026-07-21 (end of Task 3 live-usage session — real bugs fixed, My Conduits Edit/Delete added, Codespace networking made resilient). **For:** whichever agent/session picks up next.

This file exists because this repo has had files scattered across two places — `main` (where the founder pushes docs/briefs directly via GitHub's web UI) and per-task feature branches — plus a couple of stale/duplicate files from re-uploads. Read this before touching anything, so you don't work from the wrong copy of something.

---

## 0. TL;DR for whoever/whatever picks this up next (read this first, then §1-7 for detail)

- **Task 3 (Conduit Creation + Invitation) is built, real-bug-tested through two full sessions of live usage, and NOT marked ✅ Complete.** It's carried forward with two documented gaps: (1) the hourly expiry-sweep cron has no scheduler wired anywhere — Railway was dropped project-wide, the callable endpoint itself works and is verified; (2) a browser-side tunnel-auth 404 pattern the founder hit, diagnosed but not yet confirmed fixed (see §3 below). Full detail: `task_folder/task_app_progress.md`'s two Task 3 session-update entries (2026-07-20 and 2026-07-21).
- **`task_folder/Task-03-Additions-Beyond-Spec.md` lists everything built beyond Task 3's original brief this session** — session-expiry recovery in `lib/apiClient.ts`, the back-button fix, the Metro dev-server proxy (`metro.config.js`), the combined `npm run dev` script, and My Conduits' per-row 3-dot Edit/Delete menu (`app/conduit/edit.tsx`, `DELETE /v1/conduits/:id`). **Read this before starting Task 4** so nothing gets accidentally re-specified, rebuilt, or reverted.
- **Real Supabase credentials exist in `.env` at the repo root** (gitignored, already present).
- **This Codespace's networking now only requires ONE port to be public: 8081 (Metro's dev server), not two.** `metro.config.js` proxies all `/v1/*` and `/health` requests through to the backend on port 4055 internally — you no longer need to fight port 4055's visibility at all. Just run `npm run dev` (starts both backend + Metro together) and confirm port 8081 is Public in the Ports panel (`gh codespace ports visibility 8081:public -c $CODESPACE_NAME` if needed).
- **THE PLAN GOING FORWARD, IMPORTANT — read carefully:**
  1. **This session's work is on branch `feature/task3-conduit-invitation`** and has been pushed to `origin`. The founder merges this into `main` themselves — **no agent should ever merge or push directly to `main`.**
  2. **Before starting any Task 4 code, the next session must:**
     a. Run `git fetch origin` and **check all branches on `origin`** (`git branch -r`) — confirm `feature/task3-conduit-invitation` has actually been merged into `main` by the founder before proceeding. If it hasn't been merged yet, **stop and ask the founder**, don't build Task 4 on top of an unmerged `main`.
     b. Once confirmed merged, run `git checkout main && git pull origin main`, then create a **new branch off updated `main`** for Task 4 (suggested name: `feature/task4-paystack-entitlement`, matching the existing convention).
     c. Work Task 4 entirely on the new branch. **Never push directly to `main`.**
     d. **Push the new branch to `origin` at any natural stopping point** — nothing survives between sessions in this Codespace except what's actually on `origin`.
  3. **Task 4's brief does not exist yet** as of this update (`task_folder/` has no `Task-04-...md`). Check `main` for it first (the founder sometimes pushes briefs directly via GitHub's web UI) before assuming it needs to be generated.
- **Testing method: `npx expo start --web` in Chrome/Edge, not Expo Go on a phone.** Unchanged from before — see §3 for this session's networking-specific findings.

---

## 1. Where things actually stand

- **Task 1 (Project Scaffolding + Full Database Schema): merged into `main`, migration run for real.** Unchanged since the last update — see §1 in the previous version of this file if needed, or `task_app_progress.md`'s Task 1 section.

- **Task 2 (Auth + Profile ID): substantively built and real-bug-tested. Deliberately NOT marked ✅ Complete — carried forward with one documented gap (no SMS provider).** Unchanged since the last update.

- **Task 3 (Conduit Creation + Invitation): built and real-bug-tested across TWO sessions now (2026-07-20 initial build, 2026-07-21 live-usage bug-fixing). NOT marked ✅ Complete.**
  - Brief: `task_folder/Task-03-Conduit-Creation-Invitation.md` + `task_folder/Task-03-Additions-Beyond-Spec.md` (everything built beyond that brief — read this one too, same pattern as Task 2's).
  - Branch: `feature/task3-conduit-invitation`, off `main`. **Pushed to `origin` this session — the founder merges this into `main` themselves.**
  - All 9 creation-flow screens + backend routes exist and were verified against the live Supabase project. This session added: My Conduits' per-row 3-dot Edit/Delete menu, the combined `app/conduit/edit.tsx` screen, `DELETE /v1/conduits/:id`, a real session-expiry-recovery fix in `lib/apiClient.ts`, a back-button fix in `AppShell`, a Metro dev-server proxy (`metro.config.js`) so only one Codespace port needs to be public, and `npm run dev` to start both processes together.
  - **Two open gaps, carried forward:** (1) no scheduler for the hourly expiry-sweep cron (infra decision, not code); (2) a browser-side 404 the founder hit that traced to every server-side check passing cleanly — diagnosed as a likely stale Codespaces tunnel-auth cookie, recommended fix (reopen via `github.com/codespaces` directly) given but **not yet confirmed working**. See `task_app_progress.md`'s 2026-07-21 entry for the full account.

- **Task 4 (Paystack Payment + Entitlement Engine Core): not started, no brief exists yet as of this update.**

- **Tasks 5–20:** not started, no briefs written yet.

## 2. What to do right now (for whoever picks this up next)

1. **Read `task_folder/task_app_progress.md`'s two Task 3 session sections in full** (search for "Session Update 2026-07-20" and "Session Update 2026-07-21") — the single source of truth for exactly what was built, fixed, and left open.
2. **Read `task_folder/Task-03-Additions-Beyond-Spec.md`** — everything built beyond Task 3's original brief, so Task 4 doesn't re-specify, rebuild, or accidentally revert any of it (especially the `metro.config.js` proxy and `lib/apiClient.ts`'s session-recovery fix — both are load-bearing infrastructure, not leftover cruft).
3. **Check `git branch -r` and confirm `feature/task3-conduit-invitation` has been merged into `main`** before doing anything else. If unmerged, stop and ask the founder.
4. **Once merged, branch off updated `main`** for Task 4. Check `main` for an existing Task 4 brief before assuming one needs to be written.
5. **Start both the backend and Metro with `npm run dev`** (one command now, not two — see §0 above). Confirm port 8081 is Public in the Ports panel after every restart (`gh codespace ports visibility 8081:public -c $CODESPACE_NAME`) — port 4055 no longer needs to be public at all. Confirm both respond (`curl http://localhost:4055/health` and the web root) before writing code.
6. **If the founder reports a browser-side 404 despite the server checking out fine**, don't repeat the same server-side diagnostics that already came back clean last session (local curl, external curl, header inspection, process restart) — try the tunnel-auth-refresh fix first (reopen the Codespace via `github.com/codespaces` directly, not a bookmarked URL) and confirm whether that resolves it, then update this file with the actual outcome either way.
7. **Push the new Task 4 branch to `origin` at any natural stopping point.**

## 3. Known messes in this repo — don't get confused by these

- **`task_folder/task_app_progress (1).md` existed on `main` and was STALE** — deleted 2026-07-17. `task_folder/task_app_progress.md` (no suffix) is the one, real, maintained tracker.
- **The amendments log was renamed.** It's `docs/AgroLease-Product-Plan-Amendments.md` now (was briefly `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md`).
- **The founder edits/uploads files directly to `main` via GitHub's web UI sometimes**, outside of any agent session. Always `git fetch origin main` and check for new files there before assuming you've seen everything.
- **`Error_screenshot.png` at the repo root is a genuinely empty (0-byte) file** — not a real screenshot, don't try to read it.
- **Port 4000 got stuck as a leftover shell environment variable in an earlier session** and silently shadowed every `.env` edit — the backend runs on port **4055** instead. If a future session sees the backend refusing to pick up an env change, `echo $BACKEND_PORT` in the shell before assuming the `.env` file itself is wrong.
- **NEW (2026-07-21): Codespace port visibility does not persist across restarts, and setting it via `gh codespace ports visibility` from inside the Codespace itself was unreliable this session** — it worked sometimes and silently failed to register at other times. **Workaround now in place: `metro.config.js` proxies backend requests through Metro's own port (8081), so only that ONE port needs to be public** — this removes most of the previous friction, but if 8081 itself ever shows as reachable server-side (`curl` succeeds from inside the Codespace) while the founder's browser still 404s, that's very likely a stale tunnel-auth cookie in the browser, not a port-visibility problem — see §0/§2 above for the recommended fix.
- **A disposable test account from this session's live testing could not be fully deleted**: `task3-editdel-...@example.com` (auth-only, orphaned, harmless — no profile, no conduits) returned a persistent 500 from Supabase's Admin API on `deleteUser` across three retries. Worth a retry or a manual dashboard delete in a future session; not blocking anything.

## 4. Repo layout reminder (three separate npm projects, one repo)

- **Root (`/`)** — the actual AgroLease mobile app (Expo, SDK 54). `npm install` here only installs this project's deps. **`npm run dev` now starts both this and the backend together** (new this session — see `scripts/dev-all.js`).
- **`/backend`** — Fastify API for the mobile app. Separate `package.json`. Runs on port **4055**, but no longer needs to be publicly forwarded (see §3) — Metro's dev server proxies to it internally.
- **`/web`** — the already-live public price website (Next.js, deployed on Vercel). Unrelated to the mobile app tasks. Don't touch unless a task explicitly says to.
- **`/scraper`** — feeds `/web`'s price data. Also unrelated to mobile app tasks.

## 5. Logo — for the avoidance of doubt

The real app logo is **`/logo.png` at the repo root**. Never `web/logo.png` or `web/public/logo.png`. Leave `components/ui/AuthShell.tsx`'s logo as-is unless told otherwise again.

## 6. Real accounts in the live database (do not use these for testing — use disposable Admin-API accounts instead)

- `akintoyev612@gmail.com` — `profile_id: user0989`.
- `shiwonikuoluwabunmi@gmail.com` — `profile_id: sknoww`.
- `afterglowmindd@gmail.com` — `profile_id: user2948`, **`display_name` is stuck on a placeholder** ("afterglowmindd") — unrecoverable, can be corrected via Edit Profile or on direct request.
- Two real draft Conduits exist from the founder's own live testing this session: `CON-NG-898790` ("jfjf") and `CON-NG-636701` ("my land in kaduna") — both genuinely `draft` status, awaiting a partner. Not test data to clean up; leave as-is unless told otherwise.

## 7. Branch history for reference

- `feature/task1-scaffolding-database` → PR #19 → merged into `main` (2026-07-17).
- `feature/task2-auth-profile-id` → merged into `main` (confirmed via branch #21 being cleanly based off it, no divergence).
- `feature/task3-conduit-invitation` → this and last session's work → **pending merge into `main` by the founder.**
- Next branch (name TBD, suggested `feature/task4-paystack-entitlement`) → **to be created off `main` after `feature/task3-conduit-invitation` merges** → Task 4.

---

*If anything in this file turns out to be wrong or out of date by the time you read it, fix it here too — that's the whole point of a handoff doc.*

