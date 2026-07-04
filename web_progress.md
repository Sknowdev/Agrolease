# AgroLease Web + Scraper - Progress Report

Date: 2026-07-04
Scope: verify, complete, and test the AgroLease crop-price SEO site and
scraper that were scaffolded in a previous IDE session, then document what
was built and where it diverges from the original planning docs.

For setup steps and what you need to supply, see
[`requirements.md`](./requirements.md). This file is the "what was built,
what works, and why" account you asked for.

---

## 1. Summary

Everything in the repo was re-verified from scratch in this session (not
assumed to work): dependencies installed, `npm run build`/`lint`/`test`
run for the web app, and every planned scraper data source was
re-checked against the live internet rather than trusted from prior
research notes. That re-check surfaced two real, material changes from
the original plan (Nigeria's source and Brazil's status - see Section 3)
and two real bugs in the scraper (Section 4), all fixed and verified.

**Current state: the web app builds, lints, and tests cleanly. The
scraper CLI runs end-to-end and its Nigeria and UK modules are verified
against live data. Nothing has been written to a real Supabase database
yet, because no real credentials have been provided (see
`requirements.md` Section 3.1).**

---

## 2. What was verified working (this session)

### Web app (`web/`)
- `npm install` - 432 packages, clean.
- `npm run build` (Next.js 16.2.10, Turbopack) - succeeds. Generates 54
  pages total, including 44 static `/prices/[country]/[crop]` routes via
  `generateStaticParams` (ISR, `revalidate = 3600`).
- `npm run lint` - 0 errors, 0 warnings (2 real errors and 1 stale warning
  were found and fixed - see Section 4).
- `npm test` (added `vitest` + `jsdom` + React Testing Library, which
  were referenced by two test files but never actually installed in the
  previous session) - 9/9 tests pass (`lossCalculator.test.ts`,
  `trend.test.ts`).
- Confirmed the app degrades gracefully with **no** Supabase credentials
  configured: every price page logs a clear warning
  (`[prices] Supabase not configured: ...`) and renders the "coming
  soon" / unavailable state instead of crashing the build.

### Scraper (`scraper/`)
- `npm install` - clean, 0 vulnerabilities.
- Built the CLI runner (`scraper/src/index.js`) that was referenced in
  every `npm run scrape:*` script but did not exist in the cloned repo -
  see Section 4.
- `node src/index.js --help` and `--source=<name>` for all 5 sources
  verified working, including `--source=all`.
- The Nigeria and UK scraper modules were run against the **real, live**
  internet (not mocked) and verified to fetch and parse real data
  correctly, stopping only at the final "write to Supabase" step because
  no credentials exist yet in this environment (see Section 3 for what
  each one actually found).

---

## 3. Deviations from the original plan (with reasoning)

This is the part you specifically asked to be flagged honestly. All of
this came from re-checking sources live via `curl`/`fetch` during this
session, not from re-using unverified notes from the prior session.

### 3.1 Nigeria: FMARD replaced with NBS Food Price Tracking (upgrade)

**Original plan:** scrape FMARD (Federal Ministry of Agriculture,
`fmard.gov.ng`).

**What we found:** `fmard.gov.ng` now permanently redirects (301) to
`agriculture.gov.ng`. That new site has no price or market-data pages of
any kind - checked its `research-and-reports` page directly, empty of
price content. FMARD as originally planned is a dead source.

**What we did instead:** `nigerianstat.gov.ng` (Nigeria's National
Bureau of Statistics) links directly to
`nigeriafoodpricetracking.ng`, an official NBS pilot. Its dashboard page
exposes a public, no-authentication Google Drive CSV export containing
real state/LGA-level retail and farmgate prices. We downloaded and
parsed it for real: **1,267,380 rows**, most recent date **26 June
2025**, covering these food items: Brown beans, Garri, Imported rice,
Local rice, Maize white, Maize yellow, Sorghum, Soyabeans, White beans,
Yam.

**Why this is a net upgrade, not just a substitute:** it's granular
government microdata (state/LGA level, separate retail vs. farmgate
prices) rather than a simple bulletin page - a better foundation than
what was originally planned.

**The honest trade-off:** this dataset does not cover cassava or
groundnuts. Nigeria's crop list was narrowed from the originally planned
6 crops to 4 (`maize`, `rice`, `sorghum`, `soybeans`). We deliberately did
**not** substitute "Garri" (a processed cassava product) as a stand-in
for raw cassava pricing, and did not fabricate a groundnuts price -
those two crop pages simply don't exist for Nigeria right now, consistent
with the "never claim an untested/broken source works" rule. If you want
cassava/groundnuts covered, the admin-entered-price pattern (used for
Ghana/South Africa/Brazil) is the fallback option.

New module: `scraper/src/sources/nigeria-nbs.js`.

### 3.2 Brazil: downgraded from "scraper" to "admin-entered"

**Original plan:** Brazil live via CONAB, later tentatively re-pointed
(in an earlier session, mid-investigation) at IBGE's SIDRA API as a
no-key substitute, using a guessed table ID (6588).

**What we found, checked live this session:**
- CONAB's own site (`conab.gov.br`, `consultaweb.conab.gov.br/precospaa`)
  is a JavaScript single-page "consulta" tool - not scrapable via a plain
  HTTP request.
- We pulled IBGE's **entire** aggregates catalog
  (`servicodados.ibge.gov.br/api/v3/agregados`, ~1,900 aggregate groups)
  and searched all of it for anything price-related. The only real
  matches are consumer price indices (IPCA/INPC/IPCAE - general inflation
  baskets, not crop-specific). The group that contains table 6588
  ("Levantamento Sistemático da Produção Agrícola") and its neighbors are
  production/yield/harvest-area surveys (tonnes produced, hectares
  planted) - not market prices at all. The earlier session's guess was
  wrong, and this confirms it rather than assumes it.

**What we did instead:** Brazil is downgraded from `priceFeedMethod:
'scraper'` to `'admin'`, exactly like Ghana and South Africa. It stays
"live" in the sense that its page and crops are real, but its price
needs to be entered by a human, not a bot. Updated:
- `web/src/config/countries.ts`
- `supabase/migrations/0002_seed_countries.sql`

New stub module (documents *why* nothing runs, rather than silently doing
nothing): `scraper/src/sources/brazil.js`.

### 3.3 Ghana and South Africa: re-confirmed, no change

- **Ghana/GCX** (`gcx.com.gh`): re-checked live. It's a client-side Vite
  SPA with no server-rendered price data. Its API host
  (`api.gcx.com.gh`) only exposes a directory listing (a
  `notification-api.zip` file), not a prices endpoint. Confirmed still
  not scrapable without going through member authentication, which we
  will not do. Stub module: `scraper/src/sources/ghana.js`.
- **South Africa/DAFF** (now reorganized as DALRRD): a live re-check of
  `dalrrd.gov.za` timed out during this session (inconclusive on the
  exact current URL), but this doesn't change the underlying finding from
  before: this source has only ever published PDF price-watch reports,
  never a structured CSV/HTML feed. Stub module:
  `scraper/src/sources/south-africa.js`.

### 3.4 UK/DEFRA: re-confirmed working exactly as built

Re-checked live: the CSV link regex in `scraper/src/sources/uk-defra.js`
still matches a real, current gov.uk asset URL
(`API_20260625.csv`), and a wheat row with a real numeric value was
successfully extracted. No changes needed. The known limitation flagged
in the original session - that this dataset is a producer price *index*
(base = 100), not a direct £-per-tonne figure - is still accurate and
still unresolved (would need combining with AHDB's ex-farm price series;
not done in this session).

### 3.5 Net result: only 2 of 5 "live" countries have a real scraper

Being direct about this because it matters: **Nigeria and the UK now have
real, verified, working automated scrapers. Ghana, South Africa, and
Brazil do not** - they're "live" pages with real crop lists, but their
actual price numbers must be entered by a human through an admin flow
that does not exist yet (see Section 6, Open Items). This is a smaller
automated-scraper footprint than the original plan implied, but it's the
honest state of what's actually scrapable today versus what would have
been fabricated data presented as if it were real.

---

## 4. Bugs found and fixed in this session

These were real defects, not stylistic nitpicks - each one would have
caused a visible failure the first time someone actually ran the
project:

1. **`scraper/src/index.js` did not exist.** Every `npm run scrape:*`
   script in `scraper/package.json` referenced it, but it was never
   created in the prior session (confirmed via file search before
   starting). Built it from scratch: dispatches to each source module by
   `--source` flag, supports `--source=all` and `--help`, and calls
   `logScraperRun` after every run.
2. **`logScraperRun` crashed the entire CLI when Supabase credentials
   were missing.** It wrapped the *insert* call in error handling, but
   not the `getSupabaseClient()` call that happens first (which throws
   synchronously). Since no `.env` exists yet in a fresh clone, this was
   the very first thing anyone would hit. Fixed by wrapping the whole
   function body in a `try`/`catch` so a logging failure - including "not
   configured yet" - never crashes the scrape itself.
3. **Wrong status value passed to `logScraperRun`.** `index.js` used
   `status: 'error'`, but the database's `scraper_run_logs.status` check
   constraint (`supabase/migrations/0001_init.sql`) only allows
   `'success' | 'partial' | 'failed'`. This would have caused every
   failed-run log write to itself fail with a constraint violation once
   real credentials were in place. Fixed to `'failed'`.
4. **Two real ESLint errors** (`react-hooks/set-state-in-effect`) in
   `HomeHero.tsx` and `ThemeToggle.tsx`. Both are legitimate
   "hydration-safe read from `localStorage`/`matchMedia` on mount"
   patterns - there's no way to read either during server-side
   rendering - so both are suppressed with an inline justification
   comment rather than restructured, which would have added complexity
   for no real benefit. One stale/no-longer-needed `eslint-disable`
   comment (in the price page's JSON-LD `<script>` tag) was also cleaned
   up.

---

## 5. Testing tooling added

`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
and `@vitejs/plugin-react` were installed as dev dependencies (two test
files already existed and referenced `vitest`, but it was never actually
installed in the prior session). Added `web/vitest.config.ts` (jsdom
environment, `@` path alias matching `tsconfig.json`) and a `"test":
"vitest run"` script in `web/package.json`.

---

## 6. Open items / not done in this session

Being explicit about what's still outstanding rather than implying
everything is finished:

- **No real Supabase project has been touched.** Migrations are written
  and validated by inspection, but never actually run against a live
  database, because no credentials were provided. Zero real price rows
  exist anywhere. See `requirements.md` Section 3.1 for exactly what's
  needed and the steps to apply them.
- **No admin panel exists yet** for entering Ghana/South Africa/Brazil's
  admin-fallback prices. Right now there is no way to actually populate
  those "live" countries' price data short of a manual Supabase table
  insert.
- **UK price is still an index, not a £/tonne figure** (see Section 3.4)
  - a known, previously-flagged limitation, still unresolved.
  - **Kenya, India, Indonesia, US** remain "coming soon" pages only, per
  plan - no API integration attempted, as agreed (needs your API keys
  first).
- **Spaceship DNS -> Vercel** not configured (no repo work needed for
  this; see `requirements.md` Section 3.2).
- **No end-to-end test exists yet** against a real Supabase project
  (early-access form submission, real price rendering) - only unit tests
  for the pure calculation/formatting functions.
- `scripts/check-sources.ps1` (a Windows PowerShell research script from
  the original scaffolding session) is still sitting in the repo,
  unused now that the actual source verification happened via `curl`/
  `fetch` in this session. Left in place rather than deleted, since
  removing files wasn't part of this session's scope - flagging it as a
  candidate for cleanup.

---

## 7. Files changed or added in this session

- `scraper/src/index.js` (new - CLI runner)
- `scraper/src/sources/nigeria-nbs.js` (new - real scraper)
- `scraper/src/sources/ghana.js` (new - admin-fallback stub)
- `scraper/src/sources/south-africa.js` (new - admin-fallback stub)
- `scraper/src/sources/brazil.js` (new - admin-fallback stub)
- `scraper/src/lib/priceWriter.js` (bug fix - `logScraperRun` error
  handling)
- `web/vitest.config.ts` (new)
- `web/.env.example` (new - was missing)
- `web/package.json` (added `test` script)
- `web/src/components/HomeHero.tsx` (lint fix)
- `web/src/components/ThemeToggle.tsx` (lint fix)
- `web/src/app/prices/[country]/[crop]/page.tsx` (lint fix)
- `web/src/config/countries.ts` (Nigeria source + crop list, Brazil
  downgrade)
- `supabase/migrations/0002_seed_countries.sql` (Nigeria source name,
  Brazil downgrade)
- `requirements.md` (new)
- `web_progress.md` (this file)
