# AgroLease — Task & App Progress Tracker

**This file is a living document.** Every coding agent that completes a task updates its row here — status, date, and what was actually verified — before ending its turn. Nothing gets marked Complete without passing the test criteria stated in that task's brief.

---

## How This Works

1. Each numbered task below has (or will have) its own brief: `Task-01-....md`, `Task-02-....md`, etc., in the same repo location as this file.
2. Hand the agent **one task file at a time** — not this whole tracker. The task file is self-contained.
3. When the agent finishes, it must update this tracker before stopping: change the status, add today's date, and write one line on what was tested and confirmed working.
4. If something can't be finished or a test fails, the agent marks it **⚠️ Blocked** with the specific error/reason — never marks it ✅ Complete to move past a failure.
5. When a task is confirmed ✅ here, tell the founder — the next task's brief gets generated from this tracker + the original planning docs, matching what actually got built (not just what was planned).

## Status Legend

| Symbol | Meaning |
|---|---|
| ⬜ Not Started | Brief not yet generated / not yet handed to an agent |
| 🔲 Ready | Brief exists, waiting to be run |
| 🟡 In Progress | Agent is actively working this task |
| ⚠️ Blocked | Attempted, something failed — see notes |
| ✅ Complete & Confirmed | Built, tested against the brief's checklist, verified working |

---

## Task Index

| # | Task | Status | Last Updated | Notes / What Was Verified |
|---|---|---|---|---|
| 1 | Project Scaffolding + Full Database Schema | ⚠️ Blocked (code/infra done, DB migration not yet run) | 2026-07-11 | See detailed notes below. Everything that could be built and verified locally without real Supabase credentials is done and tested. The one thing not done: actually running `0004_mobile_app_schema.sql` against the live project, because no `.env` / credentials exist in this environment. |
| 2 | Auth + Profile ID | ⬜ Not Started | — | — |
| 3 | Conduit Creation + Invitation | ⬜ Not Started | — | — |
| 4 | Paystack Payment + Entitlement Engine Core | ⬜ Not Started | — | — |
| 5 | Security Officer System | ⬜ Not Started | — | — |
| 6 | Gate Logging + Harvest Records | ⬜ Not Started | — | — |
| 7 | Invoice + Negotiation | ⬜ Not Started | — | — |
| 8 | Dispute Workflow | ⬜ Not Started | — | — |
| 9 | Trust Score | ⬜ Not Started | — | — |
| 10 | Notifications | ⬜ Not Started | — | — |
| 11 | Agreement Rules + Fixed-Term Lock + Sponsorship Verification Providers | ⬜ Not Started | — | — |
| 12 | Spatial Conduit Engine | ⬜ Not Started | — | — |
| 13 | Satellite & Weather Intelligence | ⬜ Not Started | — | — |
| 14 | Scraping Bot (FMARD) | ⬜ Not Started | — | — |
| 15 | Admin Price Panel | ⬜ Not Started | — | — |
| 16 | Legal Readiness Export | ⬜ Not Started | — | — |
| 17 | Discovery & Matchmaking Network | ⬜ Not Started | — | — |
| 18 | Coming Soon States (hardware/AI-dependent only) | ⬜ Not Started | — | — |
| 19 | Full End-to-End Regression Test | ⬜ Not Started | — | — |
| 20 | App Store + Play Store Submission | ⬜ Not Started | — | — |

---

## Task 1 — Detailed Status (2026-07-11)

**What was built and verified (all ✅, tested for real, not assumed):**

- Expo (TypeScript + Router) project scaffolded at the repo root with the exact folder structure specified: `/app`, `/components`, `/components/coming-soon`, `/hooks`, `/lib`, `/constants`, `/backend` (+ `/routes`, `/services`, `/middleware`, `/db`), `/scraper` (untouched, pre-existing), `/satellite` (placeholder).
- All specified packages installed via `npx expo install` (SDK-compatible versions resolved automatically, not guessed): `expo-router`, `@supabase/supabase-js`, `expo-image-picker`, `expo-camera`, `expo-notifications`, `react-native-maps`, `expo-location`, `react-native-paystack-webview` (checked npm registry publish dates for 4 candidate Paystack RN libraries — this one is the only actively maintained one, see `docs/CHANGE_LOG_PRODUCT_PLAN.md`).
- `app.json` configured: name "AgroLease", icon/splash pointing at root `/logo.png` (confirmed the real 2.1MB file is bundled — verified via a real `expo export --platform web` run, which reported bundling `logo.6472aeead42f4912262e5f98f221a6c7.png (2.1MB)`), iOS bundle ID `com.agrolease.app`, Android package `com.agrolease.app`.
- `npx tsc --noEmit` — 0 errors.
- `npx expo export --platform web` — real Metro bundle succeeded, 776 modules, no errors.
- `eas.json` configured with `development`/`preview`/`production` build profiles for iOS + Android — config only, no build triggered.
- `supabase/migrations/0004_mobile_app_schema.sql` + rollback written: additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for `country_config` (only the 3 columns genuinely missing — see note below), fresh `CREATE TABLE` for every other listed table including all Sponsorship/Entitlement tables, the `entitlement_revisions` enforcement trigger, all 10 specified indexes, RLS enabled on every new table with no public policy.
- Nigeria row `UPDATE` statement included in the same migration (not a new INSERT) — only touches the 4 mobile-app columns, leaves `currency_code`/`timezone`/`price_feed_source`/etc. untouched.
- Backend (`/backend`): plain Fastify + Node, no platform SDK. `npm run dev` tested locally — `curl http://localhost:4000/health` → real `200` with JSON body. `Dockerfile` built successfully (`docker build`) and the containerized server also verified to return `200` on `/health` (tested via `--network host`, since this sandbox's rootless bridge networking doesn't forward `-p` ports — confirmed the app itself works correctly either way).
- Grepped all new app/backend/lib/constants code for hardcoded source/exchange/government names (FMARD, DEFRA, NBS, WFP, KilimoSTAT, GCX, DAFF, CONAB) — zero matches, source-masking policy holds.

**What is NOT done — genuinely blocked, not skipped:**

- **The migration has not been run against the real Supabase project.** This sandbox has no root `.env` and no `SUPABASE_*` environment variables — confirmed by direct filesystem/env search, not assumed. Per `requirements.md`, credentials only exist in the gitignored `.env`, which was never supplied here. **Someone with real credentials needs to run `supabase/migrations/0004_mobile_app_schema.sql` in the Supabase SQL editor** (or via CLI) before this task can be marked ✅ Complete & Confirmed. Until that happens: every table in the schema above exists only as SQL text in this repo, not as real tables in Supabase.
- Because the migration hasn't run, these specific checklist items from the task brief are **unverified, not failed**: "every new table exists in Supabase," "all 10 indexes created," "Nigeria's row has the 4 new columns populated," "the price website still loads correctly after the migration," "all 19 pre-existing rows are still present."
- App boot on an actual iOS simulator / Android emulator was not tested (no simulator/emulator available in this sandbox) — the equivalent web bundle export was tested instead and succeeded; this is a lower-confidence substitute for the real checklist item, not equivalent to it.

**To unblock:** supply real Supabase credentials (copy `.env.example` → `.env` at repo root, fill in `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`), then either run the migration file directly in the Supabase SQL editor, or hand it back to an agent with those credentials present so it can run it and re-verify the checklist for real.

## Update — 2026-07-16 — SDK downgrade to 54, device verification in progress

**Why:** Expo Go on the founder's iPhone only supports SDK 54 (Expo Go always tracks a specific, narrower SDK range than whatever `create-expo-app` scaffolds with at build time — SDK 57 was current when Task 1 was originally built, but Expo Go hadn't caught up to it yet). Downgraded the whole project to SDK 54 so real-device testing via Expo Go is possible at all.

**Done and verified in the agent's own sandbox (not the founder's Codespace):**
- `package.json` dependencies rewritten to exact SDK 54–compatible versions (not `expo install --fix`, which corrupted `node_modules` with a mixed SDK 57/54 state and an unresolved ERESOLVE conflict on a fresh attempt — ended up reverting and pinning versions directly instead): `expo@~54.0.36`, `expo-router@~6.0.24`, `react@19.1.0`, `react-native@0.81.5`, and matching versions for every `expo-*`/`react-native-*` package. Full list is already committed in `package.json` on this branch.
- Clean `rm -rf node_modules && npm install` — 0 ERESOLVE errors.
- `npx tsc --noEmit` — 0 errors.
- `npx expo export --platform web` — real bundle, 682 modules, real logo.png (2.12MB) bundled, no errors.
- `npx expo-doctor` — 17/18 checks pass. The 1 failure is unrelated to the SDK change: `app.json`'s `icon` field points at root `/logo.png`, which is 1536×1024 (not square) — Expo's icon spec requires a square image. **Not fixed yet** — deliberately left alone rather than auto-cropping the founder's real logo file without a design decision. Needs either a square crop of the logo or an explicit "ignore for now" call before Task 1 can be fully ✅.
- Added `@expo/ngrok` as an explicit `devDependency` (was missing, silently required by `--tunnel`).

**Genuinely blocked — real device verification not yet complete:**
- `npx expo start --tunnel` fails in the founder's Codespace with `ERR_NGROK_105`/`Cannot read properties of undefined (reading 'body')`. Root cause confirmed via ngrok's own documented error codes (`ERR_NGROK_120`/`121`): **the ngrok agent version bundled inside `@expo/ngrok` (v2.3.41) is fully deprecated on ngrok's cloud service.** This is not fixable client-side (no config, authtoken, or version pin resolves it) — `--tunnel` mode is a dead end for this project as long as `@expo/ngrok` ships that binary.
- Switched approach to Codespaces' own native port forwarding instead (`npx expo start` without `--tunnel`, forward port 8081 as Public in the Ports panel, open the forwarded URL). Founder tried this and hit a second, unrelated bug: root `package.json` was **missing its `"main": "expo-router/entry"` line** (lost during earlier manual SDK-54 edits in the Codespace, before the exact-version fix above was applied there) — without it, Expo falls back to its legacy default entry point, which looks for a root `App.tsx` that doesn't exist in this Expo-Router-based project, causing `Unable to resolve "../../App"` bundling errors. Founder confirmed via `grep '"main"' package.json` printing nothing, and was told to add the line back + clear Metro's cache (`rm -rf .expo node_modules/.cache && npx expo start --clear`) and retry.
- **Session ended before the fix above was confirmed working on the founder's actual iPhone.** This is the single next step to actually close out Task 1's device-boot verification.

### TODO — next session, in order

1. **Confirm the founder's Codespace `package.json` now has `"main": "expo-router/entry"` on line 5** (or wherever) — re-check with `grep '"main"' package.json` before doing anything else. If it's still missing, add it back.
2. **Clear Metro's cache and restart clean** in the Codespace: `rm -rf .expo node_modules/.cache && npx expo start` (no `--tunnel` — that path is confirmed dead, see above).
3. **Re-forward port 8081 as Public** in the Codespaces Ports panel (this resets sometimes between restarts).
4. **On the founder's iPhone, in Expo Go**, use "Enter URL manually" with `exp://<the-forwarded-codespaces-hostname>` (swap `https://` for `exp://`) — not a QR scan, since there's no QR code in LAN mode pointing at the right forwarded host automatically.
5. **If it loads:** confirm the AgroLease logo/title/subtitle render correctly on the real device. That closes out the one remaining unverified item in Task 1's checklist (device boot). Update this file's Task 1 status to reflect that specific item as ✅ verified (the Supabase migration itself is a separate, still-open blocker — see above, don't conflate the two).
6. **If it still fails:** get the exact new error text (from both the Codespace terminal and the phone screen) before guessing further — every fix so far in this saga came from reading the literal error, not assumption.
7. **Once device boot is confirmed:** decide on the non-square logo/icon issue from `expo-doctor` (crop vs. explicitly accept as-is) — small, but it's the only other open item before Task 1 can honestly be marked fully ✅ Complete & Confirmed (still separately blocked on the Supabase migration itself, which is a founder-side action, not an agent one).
8. **Push current branch state to `feature/task1-scaffolding-database` (PR #19)** — the SDK 54 downgrade (`package.json`/`package-lock.json`) and this progress-file update are uncommitted as of session end; commit and push them before starting anything else.
9. **Task 2 (`Task-02-Auth-ProfileID.md`, already pushed directly to `main` by the founder) starts on a brand-new branch** — explicitly NOT `feature/task1-scaffolding-database`. Pull `main` first to get the real brief content, create e.g. `feature/task2-auth-profile-id`, then build there.

## Notes for Whoever Picks This Up

- This numbering follows the original Agent Build Brief's phase order, with two additions: **Task 16 (Legal Readiness)** and **Task 17 (Discovery)** are now real build tasks, not "Coming Soon" placeholders — per the Year-1 "ship everything" decision. Task 18's Coming Soon list shrank accordingly — it now only covers things that genuinely can't ship without hardware or a trained AI model (weighbridge, AI geospatial matching, AI crop stress analysis, historical time-lapse, Planet Labs upgrade).
- Task 4 folds in the Entitlement Engine core (not just Paystack) because the Sponsorship overlay doc requires the payment wall to check entitlement status from day one, not be retrofitted later.
- **Logo — corrected 2026-07-10:** the real logo is `/logo.png` at the **repo root** (not `App_logo.png` — that name doesn't exist in this repo). A *different* logo also exists at `web/public/logo.png`, belonging to the public price website — do not use that one for the mobile app. No task in this list should generate, replace, or touch either file.
- **This repo also contains a separate, already-shipped product** — the public price website (`/web`, `/scraper`, deployed on Vercel + Supabase) — built before Task 1 started. See `docs/CHANGE_LOG_PRODUCT_PLAN.md` for the full account of what it is, why it exists, and every place its decisions (stack, sourcing, schema) diverge from these task briefs' original assumptions. Task 1 has already been edited to account for it (extends the same Supabase project via an additive migration, doesn't touch the existing `country_config` rows). Read that change log before starting any task that touches shared infrastructure (Supabase project, `country_config`, hosting).
- **Railway is dropped project-wide** (not just for the price website) — see `docs/CHANGE_LOG_PRODUCT_PLAN.md`. Long-term hosting direction is AWS. Task 1's backend is built container-first (Dockerfile) specifically so this move is easy later.
