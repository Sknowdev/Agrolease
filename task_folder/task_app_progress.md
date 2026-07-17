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
| 1 | Project Scaffolding + Full Database Schema | ⚠️ Blocked (merged to `main`; DB migration still not run) | 2026-07-17 | **PR #19 merged into `main` on 2026-07-17 22:26 UTC.** App/backend/migration code is no longer on a separate branch — it's part of `main` now, confirmed present in a fresh clone (`/app`, `/backend`, `supabase/migrations/0004_mobile_app_schema.sql` + rollback all verified on disk). App confirmed booting for real (SDK 54, web preview screenshot from founder's own Codespace — real logo/title/subtitle render). Physical-device test via Expo Go isolated to a pure networking/URL issue (port visibility + wrong internal IP), not an app bug. **Remaining real blocker, still unresolved as of this update:** `0004_mobile_app_schema.sql` has not been confirmed run against the live Supabase project — no agent so far has had real Supabase credentials in its sandbox, and merging the PR does not itself run the SQL. Task 2 work is proceeding on a new branch regardless, per explicit instruction, but any live-database verification for Task 2 remains blocked on this same open question. |
| 2 | Auth + Profile ID | ⚠️ Blocked (code complete; unverified against a live Supabase/Auth project) | 2026-07-17 | Brief: `Task-02-Auth-ProfileID.md` (v5). All 15 screens built, backend routes built, migration written. See detailed status below — genuinely blocked on the same real-credentials gap as Task 1, not on anything code-side. |
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
