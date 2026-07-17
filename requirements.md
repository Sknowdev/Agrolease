# AgroLease - Requirements & Setup

This file lists everything needed to run this repo locally, what's already
built and verified, and exactly what **you** (the project owner) need to
supply or do next. For the full account of what was built, tested, and
where the implementation diverges from the original docs (with reasoning),
see [`web_progress.md`](./web_progress.md).

## 1. Runtime requirements

| Tool | Version used in this build | Notes |
|---|---|---|
| Node.js | 22.x | Both `web/` and `scraper/` were installed and verified against Node 22. |
| npm | 11.x | Comes with Node 22. |

No other system dependencies (no PHP, no Python, no Docker) are required
to run this project locally.

## 2. What's already done (no action needed from you)

- `web/` - all dependencies installed, `npm run build`, `npm run lint`, and
  `npm test` all pass cleanly.
- `scraper/` - all dependencies installed, the CLI (`node src/index.js
  --source=<name>`) runs and dispatches correctly for every source.
- Real, live network verification of every planned price source (see
  `web_progress.md` for details and the reasoning behind each decision).
- SQL migrations written for `country_config`, `commodity_prices`,
  `exchange_rates`, `early_access_signups`, `scraper_run_logs` (with
  rollback scripts) - see `supabase/migrations/`.

## 3. What you need to supply

### 3.1 Supabase credentials (required to see real data)

**UPDATE 2026-07-09:** the plan below originally assumed two separate
Supabase projects (staging + production). The user confirmed on
2026-07-09 that **only one real Supabase project actually exists**
(`ovfopqzjneuxxtyxmiri.supabase.co`) - there is no separate staging
project. Until a second project is created, "staging" and "production"
both point at this same single project. This is a real, current risk to
be aware of: **there is no safety net** - any scraper run or manual edit
against "production" is also directly editing the only database the
live site reads from, with no way to test against a throwaway copy
first. Treat this as a temporary state, not a permanent decision - see
Section 5.4 below.

Concretely, this means:
- The scraper's `SCRAPER_ENV=production` flag is currently a no-op: both
  the plain (`SUPABASE_URL`) and `_PRODUCTION`-suffixed env vars resolve
  to the exact same project, so running with or without that flag writes
  to the identical database either way.
- Schema (all 3 migrations) and full scraper data have already been
  applied here as of 2026-07-08/09 - see `web_progress.md` for the exact
  row counts written (33 real price rows across Nigeria, UK, and 11 WFP
  countries + 9 World Bank RTFP estimated series).

| Value | Where to find it | Used by |
|---|---|---|
| `SUPABASE_URL` | Supabase dashboard -> Project Settings -> API -> Project URL | scraper (local `.env`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page -> `service_role` secret | scraper (local `.env`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Project URL | web app (`web/.env.local`), Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page -> `anon` / `publishable` key | web app (`web/.env.local`), Vercel env vars |

Steps (already done once against the one real project, kept here for
reference / for if you create a true second project later):
1. Copy `.env.example` (repo root) to `.env` and fill in the values, for
   the scraper.
2. Copy `web/.env.example` to `web/.env.local` and fill in the
   `NEXT_PUBLIC_*` values, for the web app.
3. In the Supabase SQL editor, run in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_countries.sql`
   - `supabase/migrations/0003_add_price_normalization_columns.sql`
4. In Vercel's project settings, add the `NEXT_PUBLIC_*` values as
   Production environment variables.

**If/when you create a real second (staging) project later:** repeat
steps 1-4 against it with its own credentials, then the
`SCRAPER_ENV=production` flag will actually mean something again, and
you'll be able to test scraper/schema changes there before touching the
live database.

### 3.1a Vercel: deploy only `web/`, not the whole repo

Right now Vercel is building the entire repository (including `scraper/`,
`docs/`, `supabase/`, none of which are part of the actual website). This
is controlled by a Vercel **dashboard** setting that cannot be set from a
file in this repo:

1. Open your project on [vercel.com](https://vercel.com) -> **Settings**
   -> **Build and Deployment**.
2. Scroll to **Root Directory**.
3. Click **Edit**, enter `web`, and save.
4. Redeploy (Vercel will apply this on the next deployment).

A `vercel.json` has been added at the repo root with an `ignoreCommand`
that skips rebuilding when a commit only touches non-`web/` files (a
minor optimization) - but the Root Directory setting above is the actual
fix for "deploy only the web folder."

### 3.2 Domain / DNS (Spaceship -> Vercel)

Not yet configured. Once you're ready to point `agrolease.xyz` at the
Vercel deployment: in Spaceship's DNS settings, add the records Vercel's
"Domains" tab shows you (typically an `A` record to `76.76.21.21` and/or a
`CNAME` for `www`). I can walk through this with you when you're ready -
no repo changes are needed for this step.

### 3.3 Next-wave API keys (not needed yet)

Kenya, India, Indonesia, and US routes already exist as "coming soon"
pages and need no action right now. When you're ready to bring them
online, you'll need to supply (placeholders already exist, commented out,
in `.env.example`):

- `KILIMOSTAT_API_KEY` (Kenya)
- `DATA_GOV_IN_API_KEY` (India)
- `BPS_API_KEY` (Indonesia)
- `USDA_NASS_API_KEY` (US)

## 4. Running locally

```bash
# Web app
cd web
npm install        # already done in this session, but harmless to re-run
cp .env.example .env.local   # then fill in your Supabase values
npm run dev         # http://localhost:3000
npm run build       # production build check
npm run lint
npm test

# Scraper
cd scraper
npm install         # already done in this session
cp ../.env.example ../.env   # then fill in your Supabase values (repo root)
node src/index.js --help
node src/index.js --source=uk        # or nigeria / ghana / south-africa / brazil / all
```

## 5. Decisions that need your sign-off

These aren't blockers to keep building, but they're direction changes you
should be aware of (full reasoning in `web_progress.md`):

1. **Nigeria's price source changed** from the originally planned FMARD
   (which no longer publishes any price data) to NBS Food Price Tracking,
   a genuine, verified, working public dataset from Nigeria's National
   Bureau of Statistics. Nigeria's crop list narrowed from 6 to 4 crops
   (maize, rice, sorghum, soybeans) because cassava and groundnuts aren't
   in this dataset - rather than fake numbers for them, those crop pages
   simply don't exist for Nigeria yet.
2. **Brazil downgraded** from "scraper" to "admin-entered" pricing (same
   pattern as Ghana and South Africa), because neither CONAB nor IBGE
   offers a real, scrapable crop-price feed - only production/yield
   surveys and general inflation indices, not market prices.
3. This means **only 2 of the 5 "live" countries have a real automated
   scraper right now: Nigeria and the UK.** Ghana, South Africa, and
   Brazil are "live" in the sense that their pages are real and
   indexable, but their prices need to be entered by hand (there's no
   admin panel built yet - see Open Items in `web_progress.md`).

### 5.4 Only one real Supabase project exists (no staging safety net)

Confirmed with the user 2026-07-09: there is currently one Supabase
project total, doing double duty as both "staging" and "production."
Every scraper run and schema change made so far has gone directly
against the database the live site reads from. This isn't a blocker -
the site works - but it means there's currently no way to test a risky
migration or a new scraper source without it immediately affecting
production data. Worth creating a real second project before making any
future change that isn't already verified safe (e.g. a schema migration
that drops/renames a column).


## 6. Mobile app (Track A) — Supabase Auth setup for Task 2

**Scope note:** everything above in this file (Sections 1–5) is about Track B (`/web`, `/scraper`) — the already-live public price website. This section is about Track A, the mobile app (`/app`, `/backend`), specifically what Task 2 (Auth + Profile ID) needs configured in the **same** Supabase project's **Authentication** settings. None of this is achievable from a code change in this repo — it's dashboard configuration only, done once by whoever holds real Supabase credentials.

### 6.1 Enable auth providers

In the Supabase dashboard → **Authentication** → **Providers**:

1. **Email** — enable, with **Confirm email** left as a one-time verification code flow (Task 2's Step 4 "Verification" screen sends/checks this). Under **Authentication → Emails**, the confirmation template can stay default for now — no task requires custom copy yet.
2. **Phone** — enable, with **password-based** phone auth (a phone number as the identifier + a password), not OTP-only sign-in. Requires an SMS provider to be configured under **Authentication → Providers → Phone** (e.g. Twilio, MessageBird, Vonage — pick one and supply its credentials as environment variables in the dashboard, never committed to this repo). Both the sign-up OTP (Step 4) and Forgot Password's "Reset via SMS" (Steps 13–15) depend on this being live.
3. **Google** — enable under **Authentication → Providers → Google**, with a real OAuth Client ID/Secret from the Google Cloud Console. The redirect URI Supabase generates (`https://<project-ref>.supabase.co/auth/v1/callback`) must be added to the Google Cloud OAuth client's **Authorized redirect URIs** list. The mobile app additionally needs its own `agrolease://` custom scheme registered as an allowed redirect in **Authentication → URL Configuration → Redirect URLs** (already declared in `app.json`'s `"scheme": "agrolease"` — no app-side change needed once the dashboard is configured).

### 6.2 Redirect / deep link configuration

Under **Authentication → URL Configuration**:
- **Site URL**: not meaningfully used by a mobile-only app, but Supabase requires a value — set to the eventual production API/marketing URL once one exists; a placeholder is fine until then.
- **Redirect URLs**: add `agrolease://` (matches `app.json`'s scheme) so Google OAuth and any email-link flows can return control to the app.

### 6.3 What does NOT need dashboard config

- Verification **codes** (email 6-digit / phone OTP) are handled by Supabase Auth's own built-in confirmation flow — no separate service or table needed for this.
- `profiles` is a separate application table (not `auth.users`) — Supabase Auth's own settings have no bearing on its columns. The app writes to it after a successful `auth.users` sign-up, per Task 2's own instructions.

### 6.4 Current status (2026-07-17)

**Not yet configured** — no agent session so far has held real Supabase dashboard credentials (same gap as the still-unrun `0004_mobile_app_schema.sql` migration, see `task_app_progress.md`). Task 2's code is written to call these providers correctly (`supabase.auth.signUp`, `signInWithPassword`, `signInWithOAuth({ provider: 'google' })`, `verifyOtp`, `resetPasswordForEmail`), but none of it can be tested end-to-end against a real project until:
1. Email, Phone, and Google providers are enabled as described above, and
2. A real SMS provider is wired in for phone OTP/reset, and
3. `0004_mobile_app_schema.sql` and `0005_task2_auth_profile.sql` have both been run so `profiles`/`security_officers`/etc. actually exist to write into.
