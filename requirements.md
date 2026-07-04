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

You mentioned staging and production Supabase projects already exist and
are linked to the GitHub repo, but empty. Nothing in this repo can write
or read real data until you provide:

| Value | Where to find it | Used by |
|---|---|---|
| `SUPABASE_URL` (staging) | Supabase dashboard -> Project Settings -> API -> Project URL | scraper (local `.env`) |
| `SUPABASE_SERVICE_ROLE_KEY` (staging) | Same page -> `service_role` secret | scraper (local `.env`) |
| `NEXT_PUBLIC_SUPABASE_URL` (staging) | Same Project URL | web app (`web/.env.local`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (staging) | Same page -> `anon` `public` key | web app (`web/.env.local`) |
| Same 4 values again, for the **production** project | Production project's own Settings -> API page | Vercel Production environment variables + `SCRAPER_ENV=production` runs |

Steps:
1. Copy `.env.example` (repo root) to `.env` and fill in the staging
   values, for the scraper.
2. Copy `web/.env.example` to `web/.env.local` and fill in the staging
   `NEXT_PUBLIC_*` values, for the web app.
3. In the Supabase SQL editor for **both** the staging and production
   projects, run in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_countries.sql`
4. In Vercel's project settings, add the production `NEXT_PUBLIC_*`
   values as Production environment variables (and, if you want a preview
   deployment to use staging data, add the staging values as Preview
   environment variables).

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
