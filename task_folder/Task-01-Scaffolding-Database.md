# TASK 1 — Project Scaffolding + Full Database Schema

Hand this file to your coding agent as-is. This is infrastructure only — no screens, no auth, no business logic yet. Everything else in the project builds on top of this.

---

## Objective

Stand up the AgroLease Nigeria project: repo structure, dependencies, the complete database schema (product + sponsorship, in one pass), Nigeria seeded as the active country, an empty backend deployed and responding, and EAS configured for future builds.

## Before You Start

- **Logo asset (corrected 2026-07-10):** the real logo is `/logo.png` at the **repo root** — confirmed present, 2.1MB PNG. There is no `App_logo.png` anywhere in this repo; that filename in the original brief was wrong. There is a *different* logo file at `web/public/logo.png` — that one belongs to the public price website (Track B) and **must not be reused or referenced for the mobile app**. Point `app.json`'s icon/splash config at root `/logo.png` only. **Do not generate, replace, redraw, or modify either logo file.**
- Do not scaffold any screens beyond what Expo Router requires by default. No auth flow, no dashboard, no gate logging — that's Task 2 onward.
- The schema below is intentionally the *full* schema, including Sponsorship & Entitlement tables that no feature uses yet. Building it once now avoids a retrofit later — don't skip or defer any table.
- **Source attribution policy (reaffirmed 2026-07-10):** per the Product Plan, no exchange name, government body, or data source name is ever shown to an app user. All commodity prices are presented only as "AgroLease market reference prices." This applies strictly to this mobile app. If any future task deviates from this, it must be logged in `docs/CHANGE_LOG_PRODUCT_PLAN.md` with reasoning — never a silent change.
- **This task extends, not replaces, the existing repo and Supabase project.** This repo already contains a separate, shipped product (the public price website in `/web` + `/scraper`, deployed on Vercel + Supabase). Task 1 adds the mobile app *alongside* it in the same repo/project — see the Supabase and hosting notes in Steps 5, 6, and 8 below before touching anything.

---

## Steps

1. **Initialize** Expo project — TypeScript template, Expo Router.
2. **Folder structure:**
   ```
   /app                    — Expo Router screens
   /components             — Reusable UI components
   /components/coming-soon — Coming Soon placeholder components
   /hooks                  — Custom React hooks
   /lib                    — Supabase client, API client, helpers
   /constants              — Colors, fonts, config
   /backend                — Fastify API
   /backend/routes
   /backend/services
   /backend/middleware
   /backend/db             — migration files
   /scraper                — Scraping bot (separate deployable)
   /satellite               — Satellite bot (separate deployable)
   ```
3. **Install:** `expo-router`, `@supabase/supabase-js`, `expo-image-picker`, `expo-camera`, `expo-notifications`, `react-native-maps`, `expo-location`, `react-native-paystack` (or current maintained Paystack RN library — check for the actively maintained package first).
4. **Configure `app.json`:** app name "AgroLease", icon/splash referencing root `/logo.png` (see "Before You Start" above — not `web/public/logo.png`), iOS bundle ID `com.agrolease.app`, Android package `com.agrolease.app`.
5. **Supabase — extend the existing project, do not create a new one.** One project already exists (`ovfopqzjneuxxtyxmiri.supabase.co`), currently serving the price website. Confirmed decision: this task extends that same project with the full schema below rather than provisioning a separate one. Credentials are in the repo's root `.env` (gitignored) — ask the founder directly if they're not accessible in your environment; do not create a second project as a workaround.
6. **Run the full schema migration below as an additive migration, not a fresh `CREATE TABLE` pass for `country_config`.** That table already exists (from the price website's `0001_init.sql`) with 19 real rows and a simpler column set (`id, country_code, country_name, currency_code, currency_symbol, price_feed_source, price_feed_method, update_frequency, timezone, utc_offset_hours, active, created_at`). For `country_config` specifically:
   - Use `ALTER TABLE country_config ADD COLUMN IF NOT EXISTS ...` for every new column this task needs (`overwrite_fee_floor_local`, `scrape_utc_hour`, `payment_provider`, `payment_provider_public_key`), each nullable with no default that would silently populate real countries with fake values.
   - Do **not** drop, truncate, or recreate `country_config` — the price website reads from it live.
   - Every other table in the schema below (`profiles`, `conduits`, `harvest_records`, all Sponsorship/Entitlement tables, etc.) is genuinely new — create those fresh, one migration pass, exactly as specified.
   - Write this as a new numbered migration file (e.g. `supabase/migrations/0004_mobile_app_schema.sql`) plus its rollback, following the same pattern as the existing `0001`–`0003` migrations already in this repo.
7. **Update, don't insert, the Nigeria row in `country_config`.** A Nigeria row (`country_code = 'NG'`) already exists from the price website seed. Update that existing row's new mobile-app-specific columns (`overwrite_fee_floor_local`, `scrape_utc_hour`, `payment_provider`, `payment_provider_public_key` — values below) rather than inserting a duplicate. Leave every other existing country row's new columns `NULL` — do not populate them with guessed values, and do not set any other country's mobile-app `active` flag. (Note: the price website's own `active`/`live` semantics for those 18 other rows are unrelated to and unaffected by this — they keep working for the website regardless.)
8. **Deploy an empty Fastify server — platform-agnostic, not Railway.** Confirmed decision: Railway is dropped entirely from this project. The long-term direction is consolidating hosting onto AWS, but that migration is explicitly *not* part of this task — build the Fastify server as a plain, portable, containerized Node app (a `Dockerfile` + no platform-specific SDKs or config baked in) so it can run locally now and move to AWS (ECS/Fargate/EC2) later with no rework. For this task, it only needs to run and respond locally (`npm run dev` / `docker run`, `/health` → `200`) — do not create any new hosting account or deploy to a live URL yet. That's a deliberate, separate decision point, not something to default into.
9. **Set up EAS** for iOS + Android builds — config only, no build triggered yet.

---

## Full Database Schema

### Core product tables

```
country_config
  id, country_code, country_name, currency_code, currency_symbol,
  price_feed_source, price_feed_method, update_frequency,
  overwrite_fee_floor_local, timezone, utc_offset_hours,
  scrape_utc_hour (int), payment_provider (text),
  payment_provider_public_key, active (boolean), created_at

profiles
  id (uuid, FK auth.users), profile_id (unique text),
  display_name, phone, country_code (FK country_config),
  kyc_verified (boolean), expo_push_token,
  created_at, updated_at

conduits
  id (uuid), conduit_id (text, e.g. CON-NG-000001),
  land_owner_id (FK profiles), farm_operator_id (FK profiles, nullable),
  status (draft | pending_payment | active | expired | cancelled),
  land_name, land_size_hectares (decimal), land_location (text),
  farm_boundary_coords (jsonb, nullable), farm_boundary_type (pin | coords | polygon | gps, nullable),
  country_code (FK country_config),
  agreed_percentage (decimal), payment_deadline_days (int),
  late_fee_active (boolean), late_fee_percentage (decimal), late_fee_grace_period_days (int),
  overwrite_fee_local (decimal),
  fixed_term_active (boolean, default false), fixed_term_end_date (date, nullable),
  invitation_expiry (timestamptz), invitation_expiry_setting (24h | 7d | 30d | never),
  satellite_active (boolean, default false), satellite_activated_at (timestamptz),
  amount_paid_by_owner (decimal, default 0), amount_paid_by_operator (decimal, default 0),
  paystack_payment_ref_owner (text), paystack_payment_ref_operator (text),
  activated_at (timestamptz), expires_at (timestamptz),
  created_at, updated_at

conduit_sub_parcels
  id (uuid), conduit_id (FK conduits), parcel_name (text),
  boundary_coords (jsonb), locked_hectares (decimal),
  anchor_point (jsonb), drag_direction_degrees (decimal),
  rotation_degrees (decimal, default 0), created_at, updated_at

land_utilization_snapshots
  id, conduit_id (FK conduits), total_land_hectares (decimal),
  utilized_hectares (decimal), utilization_percentage (decimal),
  active_parcel_count (int), calculated_at (timestamptz)

security_officers
  id (uuid), conduit_id (FK conduits), full_name, phone, device_info,
  linked_by (FK profiles), status (pending_approval | active | locked | revoked),
  approved_by_owner (boolean, default false), approved_by_operator (boolean, default false),
  link_code_used (text), created_at, updated_at

link_codes
  id, conduit_id (FK conduits), code (unique 6-char text),
  expires_at (timestamptz, nullable), expiry_setting (24h | 7d | 30d | never),
  created_by (FK profiles), active (boolean), created_at

harvest_records
  id (uuid), conduit_id (FK conduits), conduit_display_id (text, denormalized), land_label (text, denormalized),
  record_type (entry | exit), truck_photo_url (text, required), plate_number (text), gate_key_used (text),
  crop_name (text), weight_tonnes (decimal, nullable on entry), evidence_rating (MEDIUM | HIGH),
  logged_by_officer_id (FK security_officers), logged_by_name (text, denormalized), logged_by_phone (text, denormalized),
  is_tampered (boolean, default false), original_values (jsonb, nullable), audit_flags (jsonb array, default []),
  sealed_at (timestamptz), created_at

invoices
  id (uuid), conduit_id (FK conduits), harvest_record_id (FK harvest_records),
  conduit_display_id (text, denormalized), land_label (text, denormalized),
  crop_name, weight_tonnes, market_price_local (decimal), market_price_usd (decimal),
  currency_code, exchange_rate_at_creation (decimal), agreed_percentage (decimal),
  total_value_local (decimal), total_value_usd (decimal),
  owner_share_local (decimal), operator_share_local (decimal),
  status (draft | negotiating | approved | paid | disputed | frozen),
  owner_approved (boolean, default false), operator_approved (boolean, default false),
  payment_marked_received (boolean, default false), payment_marked_at (timestamptz),
  created_at, updated_at

invoice_proposals
  id, invoice_id (FK invoices), proposed_by (FK profiles), proposed_by_role (owner | operator),
  proposed_price_local (decimal), note (text, nullable), created_at

disputes
  id (uuid), conduit_id (FK conduits), invoice_id (FK invoices), harvest_record_id (FK harvest_records),
  raised_by (FK profiles), raised_by_role (owner | operator),
  reason (weight_discrepancy | crop_misclassification | unauthorised_entry | other),
  description (text), evidence_urls (jsonb array), status (open | resolved | unresolved),
  resolved_by (FK profiles, nullable), resolved_at (timestamptz), created_at, updated_at

messages
  id (uuid), conduit_id (FK conduits), sender_id (FK profiles), sender_role (owner | operator),
  context_type (general | dispute | negotiation), context_id (uuid, nullable),
  body (text), read_by_recipient (boolean, default false), created_at

agreement_change_log
  id, conduit_id (FK conduits), changed_field (text), old_value (text), new_value (text),
  proposed_by (FK profiles), proposed_by_role (owner | operator),
  status (proposed | counter_proposed | accepted | rejected), accepted_at (timestamptz, nullable), created_at

fixed_term_overwrites
  id, conduit_id (FK conduits), initiated_by (FK profiles), initiated_by_role (owner | operator),
  confirmed_by (FK profiles, nullable), status (pending | confirmed | cancelled),
  overwrite_fee_charged_local (decimal), paystack_ref (text, nullable),
  initiated_at (timestamptz), confirmed_at (timestamptz, nullable)

trust_scores
  id, conduit_id (FK conduits, unique), score (decimal 0-100),
  disputes_raised (int, default 0), late_payments (int, default 0), rejected_invoices (int, default 0),
  audit_flags_count (int, default 0), clean_approvals (int, default 0), fast_payments (int, default 0),
  consecutive_dispute_free_months (int, default 0), last_calculated_at (timestamptz), created_at, updated_at

satellite_reports
  id (uuid), conduit_id (FK conduits), report_date (date), ndvi_map_url (text),
  rainfall_mm (decimal), cloud_cover_percentage (decimal), image_available (boolean),
  anomaly_detected (boolean, default false), anomaly_type (text, nullable), anomaly_description (text, nullable),
  sentinel_scene_id (text), created_at

commodity_prices
  id, country_code (FK country_config), crop_name, price_local (decimal), currency_code,
  price_usd (decimal), exchange_rate (decimal), source (text), data_date (date),
  entered_by (admin | scraper), created_at

exchange_rates
  id, base_currency (USD), target_currency, rate (decimal), fetched_at (timestamptz)

notifications
  id (uuid), recipient_id (FK profiles), conduit_id (FK conduits, nullable),
  type (text), title, body, data (jsonb — deep link payload), read (boolean, default false),
  sent_at (timestamptz), created_at
```

### Sponsorship & Entitlement tables

```
sponsors
  id (uuid), sponsor_id (text, e.g. SPO-000001), display_name (text),
  sponsor_type (text — association | cooperative | ngo | government | enterprise | foundation | university | promotional | other),
  country_code (FK country_config, nullable), contact_name (text), contact_email (text), contact_phone (text, nullable),
  status (active | paused | expired | terminated), agreement_start (date), agreement_end (date, nullable),
  notes (text, nullable), created_by (FK profiles), created_at, updated_at

entitlements
  id (uuid), entitlement_id (text, e.g. ENT-000001), sponsor_id (FK sponsors),
  funding_source_name (text, nullable), funding_source_type (text, nullable — sponsor | donor | agrolease | government | other),
  funding_source_contact (text, nullable), funding_notes (text, nullable),
  covered_features (jsonb array — conduit | satellite | legal_readiness | planet_labs | enterprise | all),
  scope (jsonb, nullable — {countries, regions, crops, user_roles}, all nullable = no restriction),
  priority (int, default 0), duration_months (int, nullable), fixed_end_date (date, nullable),
  grace_period_days (int, default 30), renewal_behaviour (expire | notify_and_expire | auto_renew),
  max_members (int, nullable), verification_providers (jsonb array),
  status (active | paused | expired), version (int, default 1), notes (text, nullable),
  created_at, updated_at

entitlement_revisions
  id (uuid), entitlement_id (FK entitlements), version (int), snapshot (jsonb),
  changed_by (FK profiles), change_reason (text, nullable), created_at
  -- Enforced by a DB trigger: BEFORE UPDATE on entitlements, write the current row here first,
  -- increment entitlements.version, then apply the update. No code path may bypass this.

sponsor_members
  id (uuid), sponsor_id (FK sponsors), entitlement_id (FK entitlements),
  entitlement_version_at_enrollment (int), profile_id (FK profiles, nullable),
  verification_provider (text), verified_identifier (text),
  status (pending | active | grace_period | expired | converted | removed),
  activated_at (timestamptz, nullable), expires_at (timestamptz, nullable),
  grace_period_ends_at (timestamptz, nullable), converted_to_paid_at (timestamptz, nullable),
  created_at, updated_at

sponsor_activations
  id (uuid), sponsor_id (FK sponsors), entitlement_id (FK entitlements), entitlement_version (int),
  member_id (FK sponsor_members), profile_id (FK profiles), conduit_id (FK conduits, nullable),
  feature_activated (text), original_price_usd (decimal), covered_amount_usd (decimal),
  currency_code (text), original_price_local (decimal), funding_source_name (text, denormalized),
  activation_date (timestamptz), expiry_date (timestamptz),
  engine_decision (text — SPONSORED | PROMOTIONAL | ENTERPRISE), created_at
  -- Append-only. Never deleted, never soft-deleted.

entitlement_access_denials
  id (uuid), profile_id (FK profiles), feature (text), conduit_id (FK conduits, nullable),
  reason (text), denied_by (FK profiles), active (boolean, default true), created_at, updated_at

sponsor_invite_codes
  id (uuid), sponsor_id (FK sponsors), entitlement_id (FK entitlements), code (text, unique),
  max_uses (int, nullable), uses_count (int, default 0), expires_at (timestamptz, nullable),
  active (boolean, default true), created_by (FK profiles), created_at

sponsor_phone_whitelist
  id, sponsor_id (FK sponsors), entitlement_id (FK entitlements), phone (text),
  claimed (boolean, default false), claimed_by (FK profiles, nullable), claimed_at (timestamptz, nullable), created_at

sponsor_email_domains
  id, sponsor_id (FK sponsors), entitlement_id (FK entitlements), domain (text),
  active (boolean, default true), created_at
```

### Indexes

```sql
CREATE INDEX idx_sponsor_members_profile ON sponsor_members(profile_id);
CREATE INDEX idx_sponsor_members_entitlement ON sponsor_members(entitlement_id);
CREATE INDEX idx_sponsor_members_status ON sponsor_members(status);
CREATE INDEX idx_sponsor_activations_profile ON sponsor_activations(profile_id);
CREATE INDEX idx_sponsor_activations_conduit ON sponsor_activations(conduit_id);
CREATE INDEX idx_sponsor_activations_entitlement ON sponsor_activations(entitlement_id);
CREATE INDEX idx_entitlement_revisions_entitlement ON entitlement_revisions(entitlement_id, version DESC);
CREATE INDEX idx_sponsor_invite_codes_code ON sponsor_invite_codes(code);
CREATE INDEX idx_sponsor_phone_whitelist_phone ON sponsor_phone_whitelist(phone);
CREATE INDEX idx_entitlement_access_denials_profile ON entitlement_access_denials(profile_id);
```

---

## Nigeria Row Update (`country_config`, `country_code = 'NG'`, existing row)

Update these columns on the existing Nigeria row (do not insert a new row — see Step 7):

```
overwrite_fee_floor_local: 100000
scrape_utc_hour: 2   (3AM WAT = 2AM UTC)
payment_provider: paystack
payment_provider_public_key: (leave NULL until real Paystack keys are supplied)
```

Note: `currency_code`, `currency_symbol`, `timezone`, `utc_offset_hours` already exist correctly on this row from the price website's seed (NGN, ₦, Africa/Lagos, 1) — do not overwrite them. `price_feed_source` on the existing row currently reflects the price website's real working source (NBS Food Price Tracking, not FMARD — FMARD was found dead, see `docs/CHANGE_LOG_PRODUCT_PLAN.md` §3); leave that column alone, since the mobile app's own price-feed logic (Task 14) is a separate concern from what this column currently drives.

All other countries: their new mobile-app columns stay `NULL`. Do not insert rows for them, and do not touch their existing website-facing columns.

---

## Test Before Marking Complete

- [ ] `/health` endpoint returns `200` when the Fastify server is run locally (via `npm run dev` and via its `Dockerfile`) — no Railway or other hosting account required for this task
- [ ] Every new table listed above exists in Supabase with the correct columns and types
- [ ] `country_config` was altered in place (new columns added), not dropped/recreated — confirm all 19 pre-existing rows are still present and the price website (`agrolease.xyz/prices/...`) still loads correctly after the migration
- [ ] All 10 indexes created
- [ ] Nigeria's existing `country_config` row has the 4 new mobile-app columns populated (per the table above); every other existing row has those same 4 columns present but `NULL`
- [ ] App boots on iOS simulator and Android emulator, showing root `/logo.png` as icon/splash (not `web/public/logo.png`, not a placeholder)
- [ ] `eas.json` is configured for iOS + Android production profiles (no build submitted yet)
- [ ] No source/exchange/government name (e.g. "FMARD", "DEFRA") is hardcoded anywhere in app-facing strings — confirm against the Source Attribution Policy above

---

## When Done

Update `task_app_progress.md` in the repo root:
- Mark **Task 1** as ✅ **Complete & Confirmed**, today's date, and one line on what was tested and verified.
- If anything above fails or can't be finished, mark it ⚠️ **Blocked** instead, with the specific error and what's needed to unblock — do not mark it Complete.

Then stop and report back: what's live, what was tested, and anything that needs a decision before Task 2.
