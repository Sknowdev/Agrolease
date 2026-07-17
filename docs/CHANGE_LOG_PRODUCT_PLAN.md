AGROLEASE — CHANGE LOG AGAINST ORIGINAL PRODUCT PLAN & ABS DOCS
Living document. Read this before asking "why is this different from the plan" — the answer should already be here.

This file exists because two different tracks have been running against the same set of planning documents:

- **Track A — The ABS Mobile App** (Constitution + ABS Section 1/2/3 + Product Plan V10 + Sponsorship System): the actual AgroLease product — Expo mobile app, Fastify backend, full relationship-management schema. **Not started.** Task 1 (scaffolding) has zero code written against it as of this document's creation.
- **Track B — The Public Price Website** (`web/` + `scraper/`): a Next.js SEO/lead-gen site at `agrolease.xyz/prices/...`, built first as a pragmatic go-to-market move, reusing the `country_config` / `commodity_prices` / `exchange_rates` shape from ABS Section 1 so it wouldn't need a rebuild later. This is the only thing that exists in the repo today.

Every deviation below is a Track B decision. None of them touch Track A — Task 1 has not been built, so nothing here has actually contradicted it yet. But several of these decisions **will collide with Task 1's assumptions** the moment Task 1 starts, and those collisions are flagged explicitly in the "Open Decisions Before Task 1" section at the bottom.

---

## 1. Stack: Vercel + standalone Node scraper, not Railway + Fastify + BullMQ

**Plan says (Constitution, ABS Section 1):** Fastify backend on Railway. Scraping bot as a separate Railway service, cron-scheduled, writing through BullMQ job queues. Mobile app never calls Supabase directly — everything through the Fastify API.

**What was built instead:** Next.js app deployed on Vercel (SSG/ISR), reading Supabase directly via the anon key (no backend API layer at all), and a standalone Node CLI scraper (`node scraper/src/index.js --source=...`) run manually/locally, with no job queue, no Railway, no BullMQ/Redis.

**Why:** This was an explicit, early decision in this session (see original planning exchange) — the price website was scoped as a lightweight, fast-to-ship marketing site, not the ABS mobile app's production backend. Railway was deliberately dropped in favor of Vercel (frontend) + Supabase (data) + a local-first scraper, with AWS EC2 on-demand instances floated as the eventual home for scheduled scraping — not Railway. This directly conflicts with the Constitution's "Railway hosts backend" and "BullMQ is the only queue technology" rules, but those rules govern Track A (the mobile app backend), which doesn't exist yet. **Flagged as an open decision below** — if Task 1 is built on Railway as written, there will be two different hosting strategies for two different services talking to the same database.

## 2. Only one real Supabase project exists (no staging)

**Plan says (Constitution):** "Three environments: local, staging, production. No exceptions... Supabase has three projects."

**What actually exists:** One Supabase project (`ovfopqzjneuxxtyxmiri.supabase.co`), confirmed directly with the user on 2026-07-09. It serves double duty as both "staging" and "production" for the price website. The scraper's `SCRAPER_ENV=production` flag is currently a no-op because both env var sets resolve to the same project.

**Why:** The staging project was created empty early in the session per the user's instruction, but a second, genuinely separate project was never actually provisioned — this was surfaced and confirmed as a real gap, not a deliberate design choice. It's a temporary state, not a permanent one.

**Impact:** Every scraper run and every schema change made so far has gone directly against the only database the live site reads from. There is currently no safe place to test a Task 1 schema migration before it hits the price site's production data.

## 3. Nigeria's price source: FMARD → NBS Food Price Tracking

**Plan says (Product Plan §07, ABS Section 1):** Nigeria's source is FMARD (Federal Ministry of Agriculture, `fmard.gov.ng`), scraped daily.

**What was built:** `fmard.gov.ng` was checked live and found to permanently redirect (301) to `agriculture.gov.ng`, which has no price data of any kind. The real, working substitute found and verified: Nigeria's National Bureau of Statistics' Food Price Tracking pilot (`nigeriafoodpricetracking.ng`), a genuine public Google Drive CSV export with 1.26M+ rows of state/LGA-level retail and farmgate prices.

**Why:** FMARD is a dead source — not a matter of preference. NBS is arguably a better source (granular government microdata vs. a simple bulletin), but it doesn't cover cassava or groundnuts, so Nigeria's crop list narrowed from the originally planned 6 crops to 4 (`maize`, `rice`, `sorghum`, `soybeans`) plus `yam` via a separate WFP source. Cassava and groundnuts were not faked — those crop pages simply don't exist for Nigeria on the price site right now.

## 4. Kenya's price source: KilimoSTAT → WFP Global Food Prices

**Plan says (Product Plan §07, ABS Section 2):** Kenya's source is the KilimoSTAT API, "fully legal, open API."

**What was built:** KilimoSTAT was never actually verified working in any session. When checked, WFP's own VAM endpoints (`api.vam.wfp.org`, `dataviz.vam.wfp.org`) returned HTTP 403. The real, working substitute: WFP's Global Food Prices dataset, republished on HDX (`data.humdata.org`) — genuinely public, no key, actively maintained.

**Why:** Same reasoning as Nigeria — the originally planned source was never confirmed live, and a real alternative was found and verified instead of assumed.

## 5. Ghana: GCX scraper → admin-entered fallback

**Plan says (Product Plan §07, ABS Section 2):** Ghana's source is the GCX website, scraped daily, "low risk — govt-backed."

**What was built:** GCX (`gcx.com.gh`) was found to have rebuilt itself as a members-only trading exchange platform (Firebase-backed, requires authentication) rather than a public price bulletin. Confirmed again on a later re-check: it's a client-side SPA with no server-rendered price data, and its API host only exposes a directory listing.

**Why:** Scraping around an authentication wall was explicitly declined on ethical/authorization grounds. Ghana is downgraded to the same `priceFeedMethod: 'admin'` pattern used for South Africa and Brazil — the page and crop list are real, but the price must be entered by hand. **No admin tool exists yet to actually do this** (see Section 9 below).

## 6. South Africa: DAFF scraper → admin-entered fallback

**Plan says (Product Plan §07, ABS Section 2):** South Africa's source is DAFF / data.gov.za, scraped weekly, "fully legal, open licence."

**What was built:** DAFF (now reorganized as DALRRD) only publishes PDF price-watch reports — never a structured CSV or HTML feed, confirmed across multiple sessions. Downgraded to `priceFeedMethod: 'admin'`, same as Ghana and Brazil.

**Why:** No PDF-parsing pipeline was built (a judgment call, not an oversight) — parsing a PDF report reliably enough to trust as a "live" price felt like a worse trade than being honest that this needs a human.

## 7. Brazil: CONAB scraper → admin-entered fallback

**Plan says (Product Plan §07, ABS Section 2):** Brazil's source is the CONAB Govt Portal, scraped daily.

**What was built:** CONAB's own site (`conab.gov.br`, `consultaweb.conab.gov.br/precospaa`) is a JavaScript single-page "consulta" tool, not scrapable via plain HTTP. A tentative substitute — IBGE's SIDRA API — was investigated across two sessions and conclusively found to have **no crop-specific price aggregate at all**, only production/yield surveys and general consumer price indices (IPCA/INPC). Brazil is downgraded to `priceFeedMethod: 'admin'`.

**Why:** Same standard as Ghana/South Africa — no real scrapable source exists, so no scraper was built pretending one does.

## 8. UK: DEFRA index, not a real £/tonne price (known, unresolved limitation)

**Plan says (Product Plan §07):** UK's source is DEFRA gov.uk, "open govt data," monthly.

**What was built:** DEFRA's published dataset is a producer price *index* (base = 100), not a direct £-per-tonne figure. The module currently writes the index value directly and flags this as a known limitation in code comments. The ideal fix — combining it with AHDB's ex-farm wheat price series for a real £/tonne number — was identified but **not done**.

**Why:** Time-boxed; flagged rather than silently shipped as if it were a real price. This is still an open item, not a resolved one.

## 9. Ahead-of-schedule country activation: 11 African countries pulled forward from ABS Section 2 into the price website now

**Plan says (ABS Section 2):** Ethiopia, Tanzania, Uganda, Rwanda, Zambia, Cameroon, Ivory Coast, Senegal, Mozambique, Zimbabwe, Egypt, Mali, Burkina Faso activate *after* the Nigeria mobile app (Section 1) is complete, using a WFP VAM connector "written in Section 1, activated in Section 2."

**What was built:** All of these (except Zambia and Zimbabwe) are already live on the price website via the WFP Global Food Prices (HDX) source — the "written but inactive" plan from ABS was effectively skipped straight to "active," but only for the price website, not the mobile app (which doesn't exist).

**Why:** Building the price website surfaced a real, working, no-key data source (WFP/HDX) for far more countries than just Nigeria, and there was no reason to withhold real, verified data from the public site just because the mobile app hasn't caught up yet. This is a Track B decision — it does not mean ABS Section 2's mobile-app rollout schedule has changed.

**Crop lists were trimmed, not padded, to match reality:** Kenya/Uganda/Rwanda's "coffee" and Cameroon/Ivory Coast's "cocoa" were dropped because WFP doesn't track those export crops for those specific countries — even though the original plan implied broader coverage.

## 10. Zambia and Zimbabwe: still "coming soon" after exhaustive checking

**Plan says (ABS Section 2):** Both are part of the 16-country Africa expansion, using the WFP VAM connector.

**What was built:** Both remain `live: false`. Eight distinct sources were checked live for each (WFP global CSV, WFP per-country HDX extracts, World Bank RTFP, FEWS NET, ZamStats/ZIMSTAT, Grain Marketing Board, GIEWS/FAOSTAT) — every one is either empty, years out of date, or an aggregate index with no per-crop breakdown.

**Why:** Presenting any of these as a current price would violate the project's standing rule: never claim an untested/broken source works. This is a deliberate, documented non-fix — re-checking periodically is the only path forward, not a code fix.

## 11. Source names are shown openly — contradicts the Product Plan's masking rule

**Plan says (Product Plan §07, "Source Attribution Policy"):** *"No exchange name, government body, or data source is ever displayed in the app or on the public price page. Prices are presented as AgroLease market reference prices — accurate, verified, attributed to AgroLease."*

**What was built:** The opposite. `countries.ts`'s `source` field ("NBS Food Price Tracking", "DEFRA", "WFP Global Food Prices", "AgroLease market reference (Ghana)") is rendered directly on `PriceCard` and `LivePricesWidget` as a trust signal ("Source: [name]").

**Why this happened:** This was never an explicit decision to override the plan — it was built following the general product redesign direction (trust signals, timestamps, "Updated: [date] / Source: [name]") from an early planning conversation, without cross-checking it against the Product Plan's specific masking rule. **This is a real, unresolved contradiction, not a reasoned change.** It needs your explicit call: keep the transparent sourcing (arguably better for credibility on a public SEO site) or mask it as originally specified. Currently shipped as transparent by default, not by decision.

## 12. Vercel Web Analytics added — not in any planning doc

**What was built:** `@vercel/analytics` (cookieless Vercel Web Analytics) added to the price website, disclosed in updated Terms/Privacy pages.

**Why:** Requested directly ("introduce analysis") during the redesign work. This is Track B only — it has no relationship to the Constitution's OpenTelemetry/Sentry/metrics rules, which govern the mobile app's backend observability, not a marketing site's traffic analytics.

## 13. UI/UX redesign (cream/green theme, `/platform` page, floating nav)

**What was built:** A full visual redesign of the price website — cream/green color system, floating capsule header, image-driven sections, a new `/platform` narrative page surfacing the Conduit/Security/Settlement concepts from the Product Plan as marketing copy.

**Why:** Purely cosmetic Track B work, explicitly requested and iterated on with your direct feedback across several rounds. Not a deviation from any functional spec — flagged here only for completeness, since it touched files that reference Product Plan concepts (Conduit, Trust Score, Security Officers) as marketing copy rather than as working features.

---

## Where the numbers actually stand right now (verified against `web/src/config/countries.ts`)

| Status | Countries | Count |
|---|---|---|
| Live with a **real automated scraper** | Nigeria (NBS), United Kingdom (DEFRA) | 2 |
| Live via **WFP Global Food Prices** (real data, monthly survey cadence) | Kenya, Ethiopia, Tanzania, Uganda, Rwanda, Cameroon, Ivory Coast\*, Senegal, Mozambique, Egypt, Mali, Burkina Faso | 12 |
| Live, but **admin-entered with no admin tool built** — will show no price until a manual DB insert happens | Ghana, South Africa, Brazil | 3 |
| **"Coming soon"** — no viable source found after exhaustive checking | Zambia, Zimbabwe | 2 |
| **Total configured** | | **19** |

\* Ivory Coast has `priceFeedMethod: 'scraper'` and infrastructure wired up, but its only real reading is quality-filtered out (aggregate-only flag) — so in practice it's a 4th country showing no price today, alongside Ghana/South Africa/Brazil. That's the "4 of 17 have no data" you asked about.

**Countries from the ABS docs not yet represented anywhere in the price website:** India, Indonesia, United States, Australia, UAE, Saudi Arabia (all ABS Section 3). These are not "missing" from Track B — they were never in scope for it. They only exist in planning-document form.

---

## Decisions Confirmed 2026-07-10 (before Task 1 starts)

These were open questions as of this file's first draft. All five are now resolved, and `task_folder/Task-01-Scaffolding-Database.md` has been edited directly to match — treat that file, not this list, as the source of truth for what Task 1 will actually do.

1. **Railway dropped entirely, across the whole platform — not just the scraper.** Confirmed: no Railway anywhere in this project. Long-term direction is consolidating Supabase + Vercel + the mobile backend all onto AWS. Task 1's Fastify server is built as a plain, portable, containerized Node app (Dockerfile, no platform-specific SDK baked in) so it can run locally now and move to AWS later with no rework — Task 1 itself does not deploy it anywhere live yet; that migration is a separate, explicit future decision, not something to default into silently.

2. **Extend the existing Supabase project, exactly as Task 1's own instructions say.** Confirmed: no second project. The mobile app's full schema is added to the same project already serving the price website (`ovfopqzjneuxxtyxmiri.supabase.co`).

3. **`country_config` migration path — additive, not destructive.** To avoid the exact kind of future problem this decision was asked to prevent: Task 1 now uses `ALTER TABLE country_config ADD COLUMN IF NOT EXISTS ...` for the 4 mobile-app-specific columns (`overwrite_fee_floor_local`, `scrape_utc_hour`, `payment_provider`, `payment_provider_public_key`) instead of a fresh `CREATE TABLE`. All 19 existing rows and every column the price website already reads stay untouched. Nigeria's existing row gets those 4 new columns *updated* (not a duplicate row inserted); every other country's new columns stay `NULL` — never auto-populated with a guessed value. This is written as a new, separately reviewable migration file (`0004_mobile_app_schema.sql` + rollback), following the same pattern as the existing `0001`–`0003` files, so if anything about this migration ever needs to be rolled back, it can be — independently of the price website's own schema history.

4. **Source-masking policy — reaffirmed, no exception.** Per your instruction: the Product Plan's rule ("no exchange name, government body, or data source ever shown to a user") is followed exactly for the mobile app, no deviation. The price website's transparent "Source: DEFRA / NBS / WFP" display (Section 11 above) is now explicitly logged as the **one and only sanctioned exception**, scoped to Track B (the public website) only — not a precedent for anything else. Any future change to this rule, for either product, gets logged here first, before it ships — not after.

5. **Logo — corrected, not missing.** The real file is `/logo.png` at the **repo root** (confirmed present, valid 2.1MB PNG) — not `App_logo.png` as Task 1's original text claimed, and explicitly **not** `web/public/logo.png` (that one is the price website's own logo, a different asset, not to be reused for the mobile app). Task 1 has been corrected to point at the right file.

## Still Open Before Task 1 Can Fully Complete

1. **No Paystack account/keys supplied yet** — needed to actually test payment flows end-to-end later; doesn't block Task 1 itself (schema/scaffolding only), but will block Task 4.
2. **Whether Task 1's mobile-app scraper (Task 14, later) eventually merges with or replaces the current price-website scraper** — both will read/write `country_config` and `commodity_prices` once Task 1's migration lands. Not a blocker for Task 1, but worth deciding before Task 14 starts so two independent scrapers don't fight over the same rows.
3. **Whether showing 17 "live" countries on the marketing site undercuts the "Nigeria-only launch" narrative** for the mobile app — cosmetic/marketing concern only, no technical dependency either way.
4. **The `0004_mobile_app_schema.sql` migration has NOT been run against the real Supabase project yet.** No `.env` with real credentials exists in the sandbox this was built in (confirmed: no root `.env` file, no `SUPABASE_*` environment variables present). The SQL is written, reviewed, and ready — see Task 1's completion notes in `task_app_progress.md` for exactly what still needs to happen before this is marked fully done.

## Task 1 Implementation Notes (2026-07-11)

Two small, honest deviations found while actually building Task 1 — neither changes any decision above, both are documented per this file's own rule ("never let a divergence go undocumented"):

1. **`scrape_utc_hour` already existed on `country_config` before this task.** Task 1's brief listed `scrape_utc_hour` as one of "every new column this task needs" to add via `ALTER TABLE ADD COLUMN IF NOT EXISTS`. In reality, that column was already part of the original price-website schema (`0001_init.sql`) and already populated for all 19 rows by `0002_seed_countries.sql` — the brief's assumption that `country_config` only had the simpler column set it described turned out to be slightly out of date. `0004_mobile_app_schema.sql` does **not** re-add or alter `scrape_utc_hour` — only the 3 columns that were genuinely missing (`overwrite_fee_floor_local`, `payment_provider`, `payment_provider_public_key`) are added. No data risk either way (`ADD COLUMN IF NOT EXISTS` would have been a no-op on `scrape_utc_hour` regardless), but the migration file's own comments call this out explicitly rather than silently including a redundant statement.
2. **Paystack RN library**: `react-native-paystack-webview` (v5.1.0, published 2026-06-09) was selected after checking npm registry metadata directly for the 4 most likely candidates — it's the only one with a recent publish date; the others (`react-native-paystack`, `paystack-react-native`, `rn-pstack`) last published between 2022 and 2024. Task 1's brief asked for "the actively maintained package" without naming one, so this is a judgment call made against real, checked data, not a default guess — worth confirming before Task 4 wires up real payment flows against it.
3. **Expo SDK 57** was used (the current version as of 2026-07-11, verified via `create-expo-app` and Expo's own docs) since the brief didn't pin a version. All native-module versions (`react-native-maps`, `react-native-screens`, etc.) were resolved via `npx expo install`, not guessed, so they're guaranteed SDK-compatible.

## 14. Product Plan Amendments Log created (`docs/AGROLEASE_PRODUCT_PLAN_AMENDMENTS.md`) — Amendment 1 scoped to Track A only

**What changed:** A new living amendments log now sits alongside V10.0, tracking design changes to the (not-yet-built) mobile app as they're decided, without editing the original Product Plan text. Amendment 1 in that log replaces Section 07's per-country scraper/government-API design with a single AI price-search engine (2-3 sources per crop, confidence rating, "AgroLease AI Price Estimate" labeling, `entered_by` gains `ai_estimate`, new `sources_consulted`/`confidence` columns) — same 3AM/6AM/9AM retry cadence and never-name-a-source policy as before.

**Confirmed scope (2026-07-15):** Amendment 1 governs **Track A only** — the mobile app's price engine, which is not yet built (originally slated for a later task, e.g. Task 14). It does **not** apply to the `/scraper` directory in this repo, which is Track B's already-live, in-production scraper feeding `agrolease.xyz` right now (8 real source modules: Nigeria/NBS, UK/DEFRA, WFP for 12 countries, World Bank RTFP, admin-fallback for Ghana/SA/Brazil). That scraper is explicitly left untouched by this amendment — replacing it with an AI-search engine, if ever wanted, is its own separate, explicit decision, not something Amendment 1 triggers automatically.

**Why scoped this way:** the live price website has zero staging safety net (see Section 2 above — one Supabase project, no rollback path) and is serving real traffic today. Bundling a full price-engine replacement into a docs-sync pass would risk breaking a shipped product for a track (the mobile app) that hasn't even started. When Track A's price engine (Task 14 or wherever it lands) is actually built, it follows Amendment 1's AI-search design from the start — there's no legacy per-country scraper code to migrate away from on that track, since none exists yet.

**Not done as part of this entry:** no schema migration adding `ai_estimate`/`sources_consulted`/`confidence` to `commodity_prices` has been written yet — that's deferred until the task that actually builds Track A's price engine, so the columns land together with the code that uses them instead of sitting unused.

---

*Update this file every time a build decision diverges from a planning document, with the same structure: what the plan says, what was actually built, and why. Do not let a divergence go undocumented — that's the whole point of this file.*
