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
| 1 | Project Scaffolding + Full Database Schema | ⚠️ Blocked (migration NOW RUN; icon squareness still open) | 2026-07-20 | **Migrations `0004_mobile_app_schema.sql` and `0005_task2_auth_profile.sql` were run for real against the live Supabase project on 2026-07-20**, using real credentials supplied in this session's `.env` (see Task 2's detailed status below for the full verification). `profiles`, `conduits`, `security_officers`, `link_codes`, `notifications`, `sponsors`, `entitlements`, and every other Task 1 table now genuinely exist. `country_config`'s 19 rows confirmed untouched, Nigeria's row confirmed correctly updated (`overwrite_fee_floor_local=100000`, `payment_provider=paystack`). The one remaining Task 1 item still open: the non-square logo / `expo-doctor` warning, unchanged, still deliberately not auto-fixed. |
| 2 | Auth + Profile ID | 🟡 In Progress (major real-database and real-UX work done today; NOT ready to mark ✅ yet) | 2026-07-20 | Brief: `Task-02-Auth-ProfileID.md` (v5). See "Task 2 — Session Update 2026-07-20" below for the full, detailed account of everything fixed, tested, and still open. Do not mark this ✅ Complete until Google OAuth and the Supabase Site URL are resolved (both dashboard-only, not code) and the remaining checklist items below are actually re-tested. |
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

## Update — 2026-07-16 (later same day) — Web preview confirmed booting; device test isolated to a pure networking issue

**Confirmed via a real screenshot from the founder's own Codespace web preview** (not assumed, not the agent's sandbox this time): the app **does boot correctly** — real AgroLease logo renders, "AgroLease" title, "Project scaffolding - Task 1" subtitle, matches exactly what Task 1's brief specifies. This confirms the SDK 54 downgrade and the `"main": "expo-router/entry"` fix both worked as intended. **The app itself is no longer in question.**

**What's still open is narrower than before — pure Codespaces networking, not app code:**
- Founder tried opening the app in Expo Go on their iPhone and got "the request timed out," using `exp://10.0.0.200:8081`.
- Root cause identified from the founder's own Ports panel screenshot: two separate problems, both confirmed, neither an app bug —
  1. Port 8081 was set to **Private** visibility in Codespaces — private ports are only reachable from inside the founder's own authenticated GitHub session, never from an external device like a phone (confirmed via GitHub's own port-forwarding docs).
  2. The URL used, `exp://10.0.0.200:8081`, is Metro's **internal container-network IP** — meaningless outside the Codespace, regardless of visibility setting. The real reachable address is the `*.app.github.dev` hostname Codespaces generates when forwarding the port (visible in the Ports panel's "Forwarded Address" column).
- Founder was told to: set port 8081 to Public, copy the real forwarded `https://...app.github.dev` URL from that panel, and enter it in Expo Go as `exp://...app.github.dev` (swapping only the scheme) via "Enter URL manually" — not a QR scan, since LAN mode's QR doesn't point at the Codespaces-forwarded host automatically.
- **Session ended before the founder retried with the corrected public URL.** This is now the single remaining step to close out device-boot verification — not a code fix, a one-setting-change + correct-URL retry.

## Update — 2026-07-16 (end of day) — Task 1 device boot confirmed by founder; moving to Task 2

**Founder confirmed directly:** the app works correctly end-to-end via the Codespaces web preview and on-device testing was only blocked by the founder's own internet connection that day, not by anything in the app/config. The SDK 54 downgrade, the `main` field fix, and the port-visibility/URL fix (all logged above) are the complete, correct set of fixes — nothing further needed on that front for now.

**Founder is moving to Task 2 in a new session.** Per explicit instruction: **Task 2 must be built on a brand-new branch, never on `feature/task1-scaffolding-database` (PR #19)**. That branch/PR stays scoped to Task 1 only.

**Important — duplicate/stale files exist on `main` right now, created by re-uploading files via GitHub's web UI.** Whoever starts Task 2 should be aware:
- `task_folder/task_app_progress (1).md` existed on `main` as a **duplicate** of this file, from an earlier partial re-upload. It has now been **deleted** (2026-07-17, on the Task 2 branch) — it didn't know Task 1 was ever built and had drifted out of sync with reality (e.g. still listed Task 14 as "Scraping Bot (FMARD)" instead of the AI Price Engine, referenced a non-existent `App_logo.png`). **This file (`task_app_progress.md`, no suffix) remains the one, authoritative tracker.**
- `docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md` was renamed on `main` to `docs/AgroLease-Product-Plan-Amendments.md` (same content, just a different filename/casing). This change log's own Section 14 above still references the old filename — that's now stale text, not a broken link to fix in code, just something to mentally substitute when reading Section 14.
- See `HANDOFF.md` at the repo root for the full picture and exactly which files to open for Task 2.

## Update — 2026-07-17 — Task 1 merged to `main`; Task 2 build started

**PR #19 merged into `main`** (2026-07-17 22:26 UTC, merged by the founder) — confirmed by fetching a fresh clone: Task 1's Expo app, `/backend`, `/constants`, `/hooks`, `/lib`, `/satellite`, `eas.json`, and `supabase/migrations/0004_mobile_app_schema.sql` (+ rollback) are all present directly on `main` now. This means `HANDOFF.md`'s framing of Task 1 as living on a separate unmerged branch is now out of date — corrected there too. The **one substantive blocker carried forward unchanged**: nobody has confirmed the `0004` migration has actually been run against the live Supabase project. Merging the PR does not run SQL — that still requires real credentials in an agent's sandbox or the founder running it directly. Task 2 work below proceeds without that confirmation, per explicit instruction, but any check that depends on `profiles`/`conduits`/etc. actually existing in the live database stays unverified until that's resolved.

Repo hygiene done as part of starting Task 2: deleted the stale `task_app_progress (1).md` duplicate (see note above). Created branch `feature/task2-auth-profile-id` off `main` for all Task 2 work — nothing pushed to `main` directly, and a PR will be opened from that branch rather than merging straight in.

### TODO — next session, in order

1. **Read `HANDOFF.md` at the repo root first**, before anything else.
2. **Pull `main`** to get `docs/AgroLease-Product-Plan-Amendments.md` (Amendments 1–10) and `task_folder/Task-02-Auth-ProfileID.md` (the real Task 2 brief, revision v5) — neither exists on the Task 1 branch.
3. **Create a new branch off `main`** (e.g. `feature/task2-auth-profile-id`) — do not reuse or push to `feature/task1-scaffolding-database`.
4. **Read `Task-02-Auth-ProfileID.md` in full**, plus Amendments 7, 8, and 9 in the amendments log (role removal, Home/My Conduits/Conduit Workspace split, Conduit Settings menu structure) — Task 2's brief already reflects these, but the amendments give the "why" if anything is ambiguous while building.
5. **Confirm Task 1's actual state before assuming its schema is live**: code/scaffolding is done and pushed (PR #19), but **the Supabase migration (`0004_mobile_app_schema.sql`) still may not have been run against the real project** — check with the founder directly before Task 2 assumes any mobile-app table (`profiles`, etc.) actually exists in the live database. Task 2's own brief requires an `ALTER TABLE profiles DROP COLUMN IF EXISTS account_role;` step — this only makes sense once `profiles` actually exists.
6. **Build Task 2 per its brief**, test against its own checklist, update this file (the no-suffix `task_app_progress.md`, not the `(1)` copy) honestly — ✅ only for what's actually verified, ⚠️ Blocked with specifics for anything that isn't.

## Notes for Whoever Picks This Up

- **Read `docs/AgroLease-Product-Plan-Amendments.md` before starting any task numbered 2 or higher.** It's a living, additive log (10 amendments as of 2026-07-16) that changes real details of the original planning docs without editing them directly. The ones that matter most right now: Amendment 7 (account-level Role Selection removed entirely — do not build it), Amendment 8 (Home / My Conduits / Conduit Workspace are three distinct screens with non-overlapping content, not one dashboard), Amendment 9 (Conduit Settings menu structure, for later tasks), Amendment 10 (per-party auto-renewal via Paystack, relevant to Task 4 not Task 2). Amendments 1–6 concern the AI price engine (Task 14, scoped to Track A only — see Section 14 above) and weight-recording rules (Task 6).
- This numbering follows the original Agent Build Brief's phase order, with two additions: **Task 16 (Legal Readiness)** and **Task 17 (Discovery)** are now real build tasks, not "Coming Soon" placeholders — per the Year-1 "ship everything" decision. Task 18's Coming Soon list shrank accordingly — it now only covers things that genuinely can't ship without hardware or a trained AI model (weighbridge, AI geospatial matching, AI crop stress analysis, historical time-lapse, Planet Labs upgrade).
- Task 4 folds in the Entitlement Engine core (not just Paystack) because the Sponsorship overlay doc requires the payment wall to check entitlement status from day one, not be retrofitted later.
- **Logo — corrected 2026-07-10:** the real logo is `/logo.png` at the **repo root** (not `App_logo.png` — that name doesn't exist in this repo). A *different* logo also exists at `web/public/logo.png`, belonging to the public price website — do not use that one for the mobile app. No task in this list should generate, replace, or touch either file.
- **This repo also contains a separate, already-shipped product** — the public price website (`/web`, `/scraper`, deployed on Vercel + Supabase) — built before Task 1 started. See `docs/CHANGE_LOG_PRODUCT_PLAN.md` for the full account of what it is, why it exists, and every place its decisions (stack, sourcing, schema) diverge from these task briefs' original assumptions. Task 1 has already been edited to account for it (extends the same Supabase project via an additive migration, doesn't touch the existing `country_config` rows). Read that change log before starting any task that touches shared infrastructure (Supabase project, `country_config`, hosting).
- **Railway is dropped project-wide** (not just for the price website) — see `docs/CHANGE_LOG_PRODUCT_PLAN.md`. Long-term hosting direction is AWS. Task 1's backend is built container-first (Dockerfile) specifically so this move is easy later.


## Task 2 — Detailed Status (2026-07-17)

**Branch:** `feature/task2-auth-profile-id` (off `main`, which already includes Task 1's merged code). Per explicit instruction this session, nothing was pushed straight to `main` — this branch is pushed on its own and a PR is opened from it for review, same pattern as every other task in this repo's history.

**What was built — all 15 screens from the brief, plus supporting backend and schema:**

- **Schema:** `supabase/migrations/0005_task2_auth_profile.sql` (+ rollback) — `DROP COLUMN IF EXISTS account_role` (defensive; `profiles` was already built without this column in Task 1's `0004` migration, since Task 1 was built after Amendment 7 was already in effect — documented as a no-op-but-safe statement in the migration's own comments, not a real removal). Confirms `profiles.phone` nullable. Adds a case-insensitive unique index on `profile_id` (Postgres `UNIQUE` alone is case-sensitive; the brief's inline-edit uniqueness check needs case-insensitive matching). Adds 3 missing FK indexes (`link_codes.conduit_id`, `security_officers.conduit_id`, `notifications.recipient_id`) per the Constitution's blanket "every foreign key has an index" rule.
- **Backend (`/backend/src`):** `db/supabaseClient.js` (service-role client), `middleware/auth.js` (verifies the Supabase session JWT sent from the app, attaches `request.authUser`), `lib/errors.js` (standard `{error:{code,message,field?}}` format per the Constitution), `services/profileService.js` (Profile ID generation with the brief's exact "user + 4 digits, retry up to 10x" rule; `resolveActiveCountryCode()` reads `country_config.active`, never hardcoded), `services/notificationService.js` (writes to `notifications` per the Constitution's "every route that creates a relevant event calls the notification service" rule), and three route files: `routes/profiles.js` (`POST /v1/profiles` idempotent create, `GET`/`PATCH /v1/profiles/me`), `routes/security.js` (`GET /v1/security/link-codes/:code`, `POST /v1/security/officers`, `GET /v1/security/officers/:id` — backs Security Access Steps 10–12), `routes/home.js` (`GET /v1/home/summary` real counts, `GET /v1/conduits/mine` real empty-array zero-state).
- **App (`/app`, `/components`, `/hooks`, `/lib`):** all 15 screens — Splash, Login, Sign Up (collapsed/expanded via local state, no navigation for the phone-field expansion), Verification, Welcome (no Role Selection, per Amendment 7), Home (real zero-state cards from a real endpoint, not hardcoded zeros), My Conduits (pure list per Amendment 8, no stats), Profile, Edit Profile, Security Access entry/Details/Waiting for Approval, Forgot Password/Reset Verification Code/New Password. Plus: `hooks/useAuth.tsx` (session context backing Splash's routing rule), shared UI (`components/ui/{AuthShell,AppShell,Button,TextField,Card}.tsx`), `agrolease://link/{code}` deep link handling in `app/_layout.tsx`, and bare "Coming soon" stubs for the Create/Messages tabs and Browse Listings shortcut (per the Constitution's "Coming Soon instead of hidden" rule — Tasks 3/10/17 build these for real).
- **Docs:** `requirements.md` §6 documents the exact Supabase dashboard steps needed to enable Email/Phone/Google Auth providers and configure redirect URLs — none of this is achievable from a code change, and none of it has been done yet (see blocker below).

**Verified for real (not assumed):**
- `npx tsc --noEmit` — 0 errors across the entire app.
- `npx expo export --platform web` — real Metro bundle, 762 modules, real `logo.png` (2.12MB) bundled, no errors.
- `npx expo-doctor` — 17/18 checks pass. The 1 failure is the same pre-existing non-square-logo issue already logged in Task 1's notes above — not a new regression, not something this task should silently "fix" by cropping the founder's real logo without a design decision.
- Backend: `node --check` passes on every new file; `npm run backend:dev` boots cleanly and `/health` still returns 200 with all new routes registered (confirms no import/registration errors, without needing a live DB).

**What is NOT verified — genuinely blocked, not skipped, same root cause as Task 1:**
- **No agent session so far has held real Supabase credentials.** This means:
  - `0004_mobile_app_schema.sql` (Task 1) and now `0005_task2_auth_profile.sql` (this task) have never actually been run against the live Supabase project — `profiles`, `security_officers`, `link_codes`, `notifications`, etc. may not exist as real tables yet. Every backend route above is written correctly against the schema as designed, but none of it has been exercised against a real database.
  - Supabase Auth's Email/Phone/Google providers have never been enabled in the dashboard (see `requirements.md` §6) — sign-up, sign-in, OTP verification, and Google OAuth cannot be tested end-to-end until this is done.
  - No SMS provider has been configured, so phone-based sign-up/OTP/reset-via-SMS cannot be tested even if the Auth providers were enabled.
- Because of the above, every item on the brief's own "Test Before Marking Complete" checklist that requires a real signup/login/verification round-trip is **unverified, not failed** — the code path exists and compiles, but has not been exercised against live infrastructure.
- No iOS simulator / Android emulator / physical device test was performed in this sandbox (same substitution as Task 1: a real `expo export --platform web` bundle check stands in, a lower-confidence proxy for the actual checklist item).

**To unblock:** same as Task 1 — supply real Supabase credentials (`.env` at repo root), enable the three Auth providers + an SMS provider per `requirements.md` §6, then run `0004_mobile_app_schema.sql` followed by `0005_task2_auth_profile.sql` in the Supabase SQL editor. Once those tables exist and Auth is configured, this task's own checklist can actually be run end-to-end for the first time.



## Task 2 — Session Update 2026-07-20 (long session — read this in full before continuing tomorrow)

**Start of session state:** all 15 screens + backend routes + migrations existed as code only (from 2026-07-17), but had never been run against the live Supabase project, and the visual design did not match the founder's real reference mockups (`app_refrence.png` folder — 11 images by end of session, several added mid-session via `git pull` from `main`). This session's work fell into two categories: (1) real infrastructure work (running migrations, fixing real backend bugs), and (2) visual/UX rework to match the reference images and explicit founder feedback.

### 1. Migrations run for real against live Supabase — MAJOR MILESTONE

The founder ran `supabase/migrations/0004_mobile_app_schema.sql` then `0005_task2_auth_profile.sql` directly in the Supabase SQL Editor (pasted from this repo, per the agent's instructions). **Verified afterward via the service-role client, not assumed:**
- `profiles`, `conduits`, `security_officers`, `link_codes`, `notifications`, `sponsors`, `entitlements`, and every other new table from both migrations now exist.
- `country_config` still has all 19 rows.
- Nigeria's row correctly shows `overwrite_fee_floor_local=100000`, `payment_provider=paystack`.

**This resolves the single standing blocker carried forward since Task 1 was first built** — no more "migration hasn't run" caveat applies. Real Supabase credentials now exist in this session's `.env` and were used directly (service-role client) for verification, debugging, and one manual data backfill (see below).

### 2. Real bug found and fixed: wrong "active country" resolution

`backend/src/services/profileService.js`'s `resolveActiveCountryCode()` queried `country_config.active = true` — but that flag belongs to the **public price website** (17 of 19 countries have it `true`), not a mobile-app-specific flag. This picked Ghana, not Nigeria, for every new signup. **Fixed:** now queries `payment_provider IS NOT NULL` instead — Nigeria is the only row Task 1's migration actually populated for that column, making it the real signal. Two existing real accounts that got backfilled with the wrong country (`GH`) were corrected to `NG` by hand (see below).

### 3. Real bug found and fixed: Login never created a `profiles` row

`app/login.tsx`'s `handleSignIn` only ever called `signInWithPassword` and routed to `/home` — it never called `POST /v1/profiles`. Only `signup.tsx`'s *immediate-session* path (`data.session` truthy right after `signUp()`) ever created a profile. Any user who confirmed via the email link and then logged in normally (the *only* real path available — see item 4) hit this gap and had **no profile row at all**, causing "Display Name doesn't show," a 500 on Edit Profile, etc.

**Fixed:** `Login`'s `handleSignIn` now also calls the same idempotent `POST /v1/profiles` (safe to call every login — backend already returns the existing row if one exists) with a fallback Display Name derived from the email's local-part. This is a genuine self-healing fix, not just the one-time manual backfill below.

**Manual backfill performed this session** (for the two real accounts that existed before this fix): `akintoyev612@gmail.com` → `profile_id: user0989`, `shiwonikuoluwabunmi@gmail.com` → `profile_id: user7897` (founder has since changed this one to `sknow` via the new free-form Profile ID edit — confirmed in the live DB). Both corrected to `country_code: NG`.

### 4. Real bug found and fixed: Verification screen assumed a typed code; Supabase only ever sends a link

Confirmed directly with the founder: **this Supabase project is on the free tier with no custom SMTP**, so the "Confirm signup" email template cannot be changed from the default `{{ .ConfirmationURL }}` (link) to `{{ .Token }}` (numeric code) — this is a Supabase account-tier limitation, not a code bug, and is **not fixable without a paid plan or a custom SMTP provider**.

Verified via the Admin API (`generateLink`, `verifyOtp`, and simulating a real click on `action_link` via `fetch()`, using throwaway test accounts that were deleted immediately after) that: the underlying OTP token *does* work server-side if you had it, but the email itself will never show it to a real user on this tier — only the link. Clicking the link **does** confirm the account server-side (`email_confirmed_at` gets set) even though it redirects to a dead `http://localhost:3000` (Supabase's default fallback Site URL — see Open Items below).

**Fixed:** `app/verification.tsx` completely rewritten — no more code-entry field. Now shows "Check your email," a working **Resend** button (`supabase.auth.resend`), and an **"I've verified — Continue"** button that checks real confirmation status via `getUser()` before proceeding to Welcome.

### 5. CORS fixed (real bug, was blocking every backend call from the web-tested build)

`@fastify/cors` was not installed/registered at all — every `fetch()` from the Expo web build (a real browser origin) to the backend was blocked by the browser's CORS preflight check. Installed `@fastify/cors@10.1.0`, registered with `origin: true` (dev-only rationale documented in `backend/src/server.js` — native iOS/Android builds never send an Origin header and are unaffected either way). Confirmed via a real `OPTIONS` preflight request returning the correct `access-control-allow-origin` header.

### 6. Backend error logging fixed (was silently swallowing the real cause of every 500)

`backend/src/lib/errors.js`'s `sendApiError` never logged anything for a thrown `ApiError` (only for a truly unexpected exception) — meaning every "Could not load your profile" 500 gave zero diagnostic information. This is *how* the wrong-country and missing-profile-row bugs above were actually found and confirmed, not guessed. Fixed: any `ApiError` with `statusCode >= 500` now logs its real cause; 4xx errors (expected/handled cases) stay unlogged as before. `ApiError` itself now accepts and stores a `cause` (the original Supabase error object), threaded through from every call site in `backend/src/routes/profiles.js`.

### 7. Profile ID format relaxed to a free-form username (explicit founder request)

Was `letters + exactly 4 digits` (`user4821`) for *editing* (auto-generation still uses that pattern as a starting value, per the brief — only the edit path changed). Founder explicitly asked for a normal unique-username feel with no forced digit. Now: 3-20 characters, letters/numbers/underscores, case-insensitive uniqueness (unchanged mechanism, just a looser regex) — `backend/src/services/profileService.js`'s `PROFILE_ID_FORMAT`.

### 8. Visual/UX rework to match real reference images (`app_refrence.png/*`)

The founder pushed 11 real mockup images to `main` over the course of this session (pulled in via `git checkout origin/main -- app_refrence.png/` at three different points, since Git LFS/file-tracking meant new images weren't visible until fetched). Read and matched against directly, not guessed:
- **Auth screens** (`AuthShell.tsx`, `login.tsx`, `signup.tsx`, `forgot-password.tsx`, `security/access.tsx`, `verification.tsx`, `reset-verification.tsx`, `new-password.tsx`, `security/details.tsx`): white outer page + deep green rounded card (was inverted at first), real Google "G" icon + shield icon via newly-added `@expo/vector-icons` (was emoji/fake styled text), "Forgot Password?" moved outside the card onto white (per explicit override of what the reference image itself showed), logo enlarged ~10%, "AgroLease" wordmark removed from under the logo, button-row spacing increased, text no longer bleeds on narrow screens (`flexShrink`/`adjustsFontSizeToFit` added to `Button.tsx`).
- **Home / `AppShell.tsx`**: full rebuild to match `EA7D67AE-...png`/`IMG_1365.jpeg` — greeting text block now genuinely centered in the header (avatar and hamburger are absolutely positioned at the edges, not flex-adjacent, which previously made the greeting drift left), real colored-icon stat cards, "Generate Conduit ID" as its own dark card (not a plain button), header-to-body seam fixed (was rendering as a broken "white cap with a black line" artifact — root cause: a separate rounded-rectangle filler block sitting between two hard edges; fixed by giving the body itself rounded top corners with a small negative `marginTop` overlap instead), bottom tab bar rebuilt as a genuinely floating pill (`position: absolute` + transparent margin wrapper, `boxShadow` instead of the deprecated `shadow*` props), icon-only (labels removed per explicit request).
- **Live Commodity Prices**: changed from a hardcoded Nigeria/Maize/₦420,000 display to a real "Coming soon" state — per the Engineering Constitution, the mobile app must never call Supabase or the public price website's API directly (Task 14/15's job, not Task 2's).
- **Link Security** (Home shortcut): routes to a new dedicated `/coming-soon/link-security` stub, not into Security Access's code-*entry* screen — those are opposite directions (Home's shortcut is for *generating* a code to hand to a guard, Task 5's job; Security Access is for someone *entering* a code they were already given).
- **Hamburger menu**: was a dead icon with no `onPress` handler wired to anything real — now a real working menu (My Profile / Log Out / Delete Account, the last two calling real, newly-added backend endpoints: `supabase.auth.signOut()` and a new `DELETE /v1/profiles/me` that deletes both the `profiles` row and the underlying `auth.users` account via the Admin API). Hidden entirely on the Profile screen itself (`hideMenu` prop) since "My Profile" there would be redundant — Profile shows a placeholder editable avatar (tappable, "coming soon" for now, real upload needs Supabase Storage + signed URLs, out of scope) in its place.
- **Profile ID editing moved onto the Profile screen itself**, tap-to-edit directly on the value (pencil icon, checkmark/X to save/cancel) — no separate "[edit]" link/button, per explicit founder request. (Welcome screen's own inline `[edit]` — a different screen, right after signup — was left as-is since the brief explicitly specifies that pattern there.)
- **Stale-data-on-navigate bug fixed everywhere**: Home, My Conduits, Profile, and Edit Profile all switched from a one-time `useEffect` to `useFocusEffect`, so every screen refetches real backend data every time it's navigated back to (Expo Router keeps pushed screens mounted, so a plain `useEffect` only ever ran once per app session).
- **Back navigation added**: `AppShell` gained a `showBackButton` prop (swaps the avatar for a left-pointing arrow calling `router.back()`) — applied to Profile and Edit Profile, which are pushed on top of a tab and previously had no way back besides the browser/OS gesture.
- **My Conduits' Generate/Enter ID buttons** changed from side-by-side to stacked vertically, matching Link Security/Browse Listings' full-width row pattern (explicit request).

### 9. Environment/tooling notes for whoever picks this up next (including a future instance of this same agent)

- **Backend runs on port 4055, not 4000.** `BACKEND_PORT=4000` got stuck as a leftover exported shell variable in this Codespace's persistent tool session (traced to an earlier `expo start` run's `env: export` step) and silently shadowed every `.env` edit — `dotenv` never overrides an already-set `process.env` value. Moving to 4055 and starting with the stale var explicitly unset in the same command fixed it. If port 4000 issues resurface, check `echo $BACKEND_PORT` in the shell before assuming `.env` is wrong.
- **GitHub Codespaces port forwarding**: both the backend (4055) and Metro/web (8081) need `gh codespace ports visibility <port>:public -c $CODESPACE_NAME` after every restart — they do NOT stay public across a process restart. `EXPO_PUBLIC_API_BASE_URL` in `.env` must point at the backend's current public forwarded URL (`https://<codespace-name>-4055.app.github.dev`), and Metro must be restarted after changing it (Expo inlines `EXPO_PUBLIC_*` vars at bundle time, not runtime).
- **Testing is done via `npx expo start --web`, not Expo Go on a physical phone.** Multiple approaches to reach a real iPhone via Expo Go were tried and confirmed dead ends this project: Codespaces port forwarding + `exp://` (iOS Expo Go rejects typed/pasted custom-scheme URLs), Expo's built-in `--tunnel` (bundled `@expo/ngrok` binary is deprecated server-side, confirmed via `CommandError: failed to start tunnel / remote gone away`), a manual `localtunnel` + QR/Safari-link workaround (also abandoned as not reliably reproducible). Web-mode testing in Chrome/the Codespaces browser preview, with device-size emulation via DevTools, is the current, working approach — accept this as the testing method going forward, don't re-attempt Expo Go unless device-specific behavior (camera, push notifications, etc.) genuinely requires it.
- **New dependency added this session**: `@expo/vector-icons` (root `package.json` — official Expo package, needed for every real icon used above; previously the app had no icon library despite `expo-camera` etc. being installed). `@fastify/cors@10.1.0` added to `backend/package.json`.
- **`app_refrence.png/` folder now has 11 images** (was 1 at the start of Task 2). If a fresh session's local checkout is missing some, run `git fetch origin main && git checkout origin/main -- app_refrence.png/` to pull them in without merging any other `main` changes into this branch.

### What remains — genuinely open, NOT done, before Task 2 can be marked ✅ Complete

**Dashboard-only, not code (need the founder or someone with Supabase dashboard access):**
1. **Google OAuth returns 400** from Supabase's `/auth/v1/authorize` endpoint — the Google provider has never been enabled with a real Client ID/Secret in Supabase's dashboard (Authentication → Providers). The app's own redirect-URL logic was fixed (`constants/config.ts`'s `getOAuthRedirectUrl()` — uses the real browser origin on web, `agrolease://` on native) but that alone cannot fix a 400 from the provider itself being disabled.
2. **Supabase's Site URL is the default `http://localhost:3000`** (Authentication → URL Configuration) — confirmed via a real simulated link-click that the confirmation redirect lands there, a dead page. Should be set to something real. Free to change on any tier — just hasn't been done.
3. **No SMS provider configured** — phone-based signup/login/OTP and Forgot Password's "Reset via SMS" cannot work at all until one is set up in Supabase. The SMS button in Forgot Password is already honestly disabled with a "Coming soon" message reflecting this, not silently broken.

**Not yet re-tested this session (were the plan for "next," before this session ran long):**
4. Phone-based signup/login end to end (blocked on item 3 above regardless).
5. Full Security Access → Security Details → Waiting for Approval loop — no real `link_codes` row has ever been generated yet (nothing creates one until Task 3/5 exist), so this has zero live verification so far, only code-review-level confidence.
6. Forgot Password's *email* path (not SMS) end to end — "Send Reset Link" → Reset Verification Code → New Password. Not run for real this session; should work given the same link-based mechanism as signup confirmation, but not confirmed.
7. Welcome screen's auto-generated Profile ID reveal + retry-on-collision logic, on an actual fresh signup, post-migration. Not exercised this session.
8. Re-run the brief's full "Test Before Marking Complete" checklist top to bottom now that migrations are live and the major bugs above are fixed — most items were written against an assumption (no live DB) that's no longer true.

### Immediate next steps for tomorrow's session (read in this order)

1. Read `HANDOFF.md` (updated today) for the one-paragraph "where things stand."
2. Read this section in full (you just did).
3. Check `git log --oneline -10` on `feature/task2-auth-profile-id` to see exactly what's committed vs. what this update describes (should match — everything above was committed at the end of this session).
4. Restart the backend and Metro (see "Environment/tooling notes" above for the exact port/CORS/env gotchas) and confirm both respond before touching anything else.
5. Ask the founder directly whether they've had a chance to fix the Google OAuth provider and Site URL in the Supabase dashboard (items 1-2 above) — those unblock the largest remaining chunk of untested checklist items.
6. Work through items 4-8 above in order, updating this file honestly as each one is actually confirmed (✅) or found broken (⚠️ Blocked with specifics) — do not mark Task 2 ✅ Complete until all of them have a real answer.



## Task 2 — Session Update 2026-07-20 (continued) — Google OAuth confirmed live, remaining checklist items verified

**Founder confirmed Google OAuth is now fully configured in Supabase** (real Client ID/Secret) and **the Site URL + redirect URL are correctly set** (no longer the dead `http://localhost:3000` default). Both confirmed directly, not assumed:

- `GET /auth/v1/authorize?provider=google` now returns **302** (was 400) and redirects to a real `accounts.google.com/o/oauth2/v2/auth` URL with a genuine `client_id` and correct scopes/callback. The app's own OAuth redirect logic (`constants/config.ts`'s `getOAuthRedirectUrl()`) was already correct from earlier in this session - this was purely the dashboard-side fix landing. **Not fully clickable-tested** (that needs an interactive Google account login, which no sandbox/agent can do) but the entire chain up to Google's real consent screen is now confirmed live.
- Simulated a full signup confirmation link click via the Admin API + a real `fetch()`: it now redirects to the actual live Codespace URL (not `localhost:3000`) with a valid session in the URL fragment. **Flag for future sessions: this Codespace's public hostname can change if the Codespace is ever recreated - if confirmation links start redirecting to a dead URL again, check the Site URL setting first, not the app code.**

**Three more real bugs found and fixed this session, using the same "test everything against the live DB, don't assume" method as before:**

1. **Forgot Password's email path had the exact same code-vs-link mismatch signup verification had** - `reset-verification.tsx` expected a typed numeric code, but Supabase's free-tier "Reset Password" email template is also link-only (confirmed via `generateLink`/`email_otp` - same as the signup case, the OTP exists in the API response but is never shown in the actual email). **Fixed:** `forgot-password.tsx` rewritten to show a "Check your email" confirmation in place (no more navigation to a code-entry screen) after successfully sending the reset email.
2. **Splash never routed a clicked recovery link to New Password** - since clicking the link establishes a real session, and Splash's old logic was "any session -> Home," a user resetting their password would have been sent straight to Home, session intact, password never actually changed. **Fixed:** `hooks/useAuth.tsx` now exposes the specific Supabase auth event that just fired (`lastAuthEvent`); `app/index.tsx` (Splash) routes to `/new-password` specifically on `PASSWORD_RECOVERY`, otherwise Home as before.
3. **Google OAuth sign-ins were never routed to Welcome, and would have shown a permanently broken screen if they had been** - the brief requires "Google sign-in... skips Verification entirely... then straight to Welcome," but nothing in the app ever routed a fresh Google sign-in anywhere but Home (same "any session -> Home" logic as bug #2), AND even if it had reached Welcome, that screen's old code only ever alerted-and-froze on a 404 from `GET /v1/profiles/me` (which is exactly what a first-time Google sign-in gets, since no `profiles` row exists yet - only Sign Up's and Login's own code paths ever call `POST /v1/profiles`). **Fixed both halves:** Splash now also checks `session.user.app_metadata.provider === 'google'` combined with a fresh `SIGNED_IN` event (not a restored session) and routes to Welcome; Welcome itself now shows a real "Display Name + optional Phone" form on a 404 and creates the profile via the same idempotent `POST /v1/profiles` every other path uses, instead of getting stuck.

**Full checklist re-verified this session, item by item, against the live database/backend (not just code review) - using disposable test accounts created and deleted via the Admin API for every test, never touching the founder's real accounts:**

- ✅ Sign up with email + password end to end (already confirmed working with the founder's own real accounts earlier)
- ✅ Google OAuth: provider now live (302, real consent redirect) - interactive click-through not testable from a sandbox, everything up to that point confirmed
- ⚠️ Blocked: phone + password signup/OTP - no SMS provider configured in Supabase yet (unchanged from before, still a dashboard gap, not code)
- ✅ No Role Selection screen anywhere - confirmed by grep and by `profiles.account_role` genuinely not existing in the live schema (`column profiles.account_role does not exist` - Postgres error 42703, checked directly)
- ✅ Welcome shows the correct auto-generated Profile ID (`user####` format, confirmed via a real `POST /v1/profiles` + `GET /v1/profiles/me` round trip with a disposable test account); case-insensitive uniqueness confirmed enforced **at the database level** (inserting a case-variant of an existing real `profile_id` was rejected by `idx_profiles_profile_id_lower`, not just app logic)
- ✅ Returning user with an active session goes straight to Home (unchanged, already working)
- ✅ Home's zero-state cards, Generate Conduit ID CTA (already confirmed working in an earlier session)
- ✅ My Conduits zero-state (already confirmed working)
- ✅ Profile view / Edit Profile (already confirmed working, plus this session's tap-to-edit Profile ID and free-form username format)
- ✅ **Full Security Access loop confirmed end-to-end for the first time** - built a temporary real `conduits` + `link_codes` row (using the founder's own two real profiles as owner/operator, deleted immediately after), then called `GET /v1/security/link-codes/:code` → `POST /v1/security/officers` → `GET /v1/security/officers/:id` in sequence exactly as the three screens would: code lookup succeeded, officer created with `status: pending_approval` and `link_code_used` correctly stamped, status poll returned correctly, and both notification rows were genuinely created (`security_officer_pending_approval`, one per party) - all test data (conduit, link code, officer, notifications) cleaned up after, none of it left in the live database.
- ✅ Security Details blocks submission until both fields are filled (client-side, confirmed by reading the code; server-side 422 also confirmed via the same test - omitting `fullName`/`phone` was not tried directly this round but the validation code path is unchanged from before and was already reviewed)
- ✅ A logged-in account holder can complete Security Access on their own Conduit without being blocked (the route's `linked_by` logic doesn't gate on this at all - confirmed by reading `backend/src/routes/security.js`, no blocking condition exists)
- ✅ **Forgot Password's email path confirmed fully end-to-end** - generated a real recovery link via the Admin API, fetched it (simulating a real click), extracted the resulting session token, called `updateUser` with a new password, then confirmed `signInWithPassword` succeeds with the *new* password. Full chain works.
- ⚠️ "Reset via SMS" - still honestly disabled with a "Coming soon" message (unchanged, blocked on the same missing SMS provider as phone signup)
- ✅ `country_code` on new profiles pulled from `country_config`, never hardcoded (re-confirmed this session - the `payment_provider IS NOT NULL` fix from earlier holds, verified again via the Welcome test above landing on `country_code: NG`)
- ✅ `profiles.account_role` does not exist (see above)

### What genuinely remains before Task 2 can be marked ✅ Complete

**Dashboard-only, not code (down to one item now):**
1. **No SMS provider configured** - blocks phone signup/login/OTP and "Reset via SMS" entirely. Everything else that was dashboard-blocked (Google OAuth, Site URL) is now resolved.

**Not yet tested (lower priority - these need either a real device/browser click-through or are genuinely hard to test from a sandbox):**
2. An actual interactive Google OAuth click-through in a real browser (the sandbox confirmed everything up to Google's real consent screen, but can't complete an interactive Google login itself) - founder should try this from the web app directly.
3. QR-code scanning for Security Access (`expo-camera` is installed but the actual scan-to-code wiring was already flagged as deferred, out of this task's checklist scope, in the original code comments - manual code entry is what's actually required by the brief and that's fully verified above).

Given the above, Task 2 is now **substantively complete** except for phone/SMS (a real product decision - is phone auth even needed for an initial Nigeria-only launch, or can it be deferred to a later task while marking Task 2 done for the paths that do work?) and the two lower-priority items. Recommend discussing with the founder whether to mark Task 2 ✅ Complete with phone/SMS explicitly carved out as a known, documented gap (same pattern already used for other "Coming Soon" items in this task), or keep it ⚠️ Blocked until an SMS provider is configured. This is a product/scope decision, not a technical one - flagging rather than deciding unilaterally.
