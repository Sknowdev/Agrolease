-- AgroLease - Mobile App (Task 1) - Full product + Sponsorship/Entitlement schema
--
-- This migration EXTENDS the existing Supabase project
-- (ovfopqzjneuxxtyxmiri.supabase.co) that already serves the public
-- price website (Track B) - it does not create a second project and
-- does not touch that website's live data beyond one additive ALTER on
-- country_config. See docs/CHANGE_LOG_PRODUCT_PLAN.md and
-- task_folder/Task-01-Scaffolding-Database.md for the confirmed
-- decisions this migration follows.
--
-- country_config already exists (from 0001_init.sql, seeded by
-- 0002_seed_countries.sql, extended once already by 0003 - though 0003
-- only touched commodity_prices) with 19 real rows. This migration adds
-- 4 new nullable columns to it via ADD COLUMN IF NOT EXISTS and touches
-- NO other existing column, row, policy, or index on that table. It is
-- NOT dropped, truncated, or recreated.
--
-- Every other table below (profiles, conduits, harvest_records, all
-- Sponsorship/Entitlement tables, etc.) is genuinely new to this
-- project - created fresh, in this one migration pass, exactly as
-- specified in Task-01-Scaffolding-Database.md. Nothing here is
-- deferred or skipped, including the Sponsorship/Entitlement tables
-- that no feature uses yet.
--
-- Run this AFTER 0001_init.sql, 0002_seed_countries.sql, and
-- 0003_add_price_normalization_columns.sql, against the one real
-- Supabase project (see requirements.md Section 5.4 - there is
-- currently no separate staging project to test this against first).

-- ===========================================================================
-- STEP 1 - country_config: ADDITIVE ONLY. No DROP, no TRUNCATE, no
-- CREATE TABLE. All 19 existing price-website rows and every column the
-- price website already reads stay exactly as they are.
-- ===========================================================================
alter table country_config
  add column if not exists overwrite_fee_floor_local numeric,
  add column if not exists payment_provider text,
  add column if not exists payment_provider_public_key text;

-- scrape_utc_hour already exists on country_config (added by
-- 0001_init.sql, populated for all 19 rows by 0002_seed_countries.sql) -
-- intentionally NOT re-added or altered here. Task 1's brief listed it
-- as a "new" column under the mistaken assumption that country_config
-- only had the simpler column set described in Step 6 of that brief;
-- in reality it was already part of the original price-website schema.
-- Documented as a deviation in docs/CHANGE_LOG_PRODUCT_PLAN.md rather
-- than silently reusing it without a note.

comment on column country_config.overwrite_fee_floor_local is
  'Mobile app only (Task 1+). Minimum fixed-term overwrite fee in local currency. NULL for every country except Nigeria until set for that market too.';
comment on column country_config.payment_provider is
  'Mobile app only (Task 1+). e.g. paystack. NULL until a country''s payment flow is configured.';
comment on column country_config.payment_provider_public_key is
  'Mobile app only (Task 1+). Public/publishable key only - never a secret key. NULL until real keys are supplied.';

-- ===========================================================================
-- STEP 1b - Update (not insert) Nigeria's existing country_config row.
--
-- Only the 4 new mobile-app columns are touched. currency_code,
-- currency_symbol, timezone, utc_offset_hours, price_feed_source, and
-- every other existing column are left exactly as they are (NGN, ₦,
-- Africa/Lagos, 1, NBS Food Price Tracking - the price website's real
-- working source, per docs/CHANGE_LOG_PRODUCT_PLAN.md §3).
--
-- Every other country's new columns stay NULL - no guessed values, no
-- other row touched, no mobile-app "active" flag set anywhere by this
-- migration (there is no mobile-app-specific active flag in this schema
-- - country_config.active is the price website's own flag and is left
-- alone).
-- ===========================================================================
update country_config
set
  overwrite_fee_floor_local = 100000,
  payment_provider = 'paystack',
  payment_provider_public_key = null
where country_code = 'NG';

-- ===========================================================================
-- STEP 2 - Core product tables (all genuinely new)
-- ===========================================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_id text not null unique,
  display_name text,
  phone text,
  country_code text references country_config(country_code),
  kyc_verified boolean not null default false,
  expo_push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conduits (
  id uuid primary key default gen_random_uuid(),
  conduit_id text not null unique,
  land_owner_id uuid not null references profiles(id),
  farm_operator_id uuid references profiles(id),
  status text not null default 'draft'
    check (status in ('draft', 'pending_payment', 'active', 'expired', 'cancelled')),
  land_name text,
  land_size_hectares numeric,
  land_location text,
  farm_boundary_coords jsonb,
  farm_boundary_type text
    check (farm_boundary_type is null or farm_boundary_type in ('pin', 'coords', 'polygon', 'gps')),
  country_code text references country_config(country_code),
  agreed_percentage numeric,
  payment_deadline_days integer,
  late_fee_active boolean not null default false,
  late_fee_percentage numeric,
  late_fee_grace_period_days integer,
  overwrite_fee_local numeric,
  fixed_term_active boolean not null default false,
  fixed_term_end_date date,
  invitation_expiry timestamptz,
  invitation_expiry_setting text
    check (invitation_expiry_setting is null or invitation_expiry_setting in ('24h', '7d', '30d', 'never')),
  satellite_active boolean not null default false,
  satellite_activated_at timestamptz,
  amount_paid_by_owner numeric not null default 0,
  amount_paid_by_operator numeric not null default 0,
  paystack_payment_ref_owner text,
  paystack_payment_ref_operator text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conduit_sub_parcels (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  parcel_name text,
  boundary_coords jsonb,
  locked_hectares numeric,
  anchor_point jsonb,
  drag_direction_degrees numeric,
  rotation_degrees numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists land_utilization_snapshots (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  total_land_hectares numeric,
  utilized_hectares numeric,
  utilization_percentage numeric,
  active_parcel_count integer,
  calculated_at timestamptz not null default now()
);

create table if not exists security_officers (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  full_name text,
  phone text,
  device_info text,
  linked_by uuid references profiles(id),
  status text not null default 'pending_approval'
    check (status in ('pending_approval', 'active', 'locked', 'revoked')),
  approved_by_owner boolean not null default false,
  approved_by_operator boolean not null default false,
  link_code_used text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists link_codes (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  code text not null unique,
  expires_at timestamptz,
  expiry_setting text
    check (expiry_setting is null or expiry_setting in ('24h', '7d', '30d', 'never')),
  created_by uuid references profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists harvest_records (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  conduit_display_id text,
  land_label text,
  record_type text not null check (record_type in ('entry', 'exit')),
  truck_photo_url text not null,
  plate_number text,
  gate_key_used text,
  crop_name text,
  weight_tonnes numeric,
  evidence_rating text check (evidence_rating is null or evidence_rating in ('MEDIUM', 'HIGH')),
  logged_by_officer_id uuid references security_officers(id),
  logged_by_name text,
  logged_by_phone text,
  is_tampered boolean not null default false,
  original_values jsonb,
  audit_flags jsonb not null default '[]'::jsonb,
  sealed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  harvest_record_id uuid references harvest_records(id),
  conduit_display_id text,
  land_label text,
  crop_name text,
  weight_tonnes numeric,
  market_price_local numeric,
  market_price_usd numeric,
  currency_code text,
  exchange_rate_at_creation numeric,
  agreed_percentage numeric,
  total_value_local numeric,
  total_value_usd numeric,
  owner_share_local numeric,
  operator_share_local numeric,
  status text not null default 'draft'
    check (status in ('draft', 'negotiating', 'approved', 'paid', 'disputed', 'frozen')),
  owner_approved boolean not null default false,
  operator_approved boolean not null default false,
  payment_marked_received boolean not null default false,
  payment_marked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoice_proposals (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id),
  proposed_by uuid references profiles(id),
  proposed_by_role text check (proposed_by_role is null or proposed_by_role in ('owner', 'operator')),
  proposed_price_local numeric,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  invoice_id uuid references invoices(id),
  harvest_record_id uuid references harvest_records(id),
  raised_by uuid references profiles(id),
  raised_by_role text check (raised_by_role is null or raised_by_role in ('owner', 'operator')),
  reason text
    check (reason is null or reason in ('weight_discrepancy', 'crop_misclassification', 'unauthorised_entry', 'other')),
  description text,
  evidence_urls jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'resolved', 'unresolved')),
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  sender_id uuid references profiles(id),
  sender_role text check (sender_role is null or sender_role in ('owner', 'operator')),
  context_type text check (context_type is null or context_type in ('general', 'dispute', 'negotiation')),
  context_id uuid,
  body text,
  read_by_recipient boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists agreement_change_log (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  changed_field text,
  old_value text,
  new_value text,
  proposed_by uuid references profiles(id),
  proposed_by_role text check (proposed_by_role is null or proposed_by_role in ('owner', 'operator')),
  status text not null default 'proposed'
    check (status in ('proposed', 'counter_proposed', 'accepted', 'rejected')),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists fixed_term_overwrites (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  initiated_by uuid references profiles(id),
  initiated_by_role text check (initiated_by_role is null or initiated_by_role in ('owner', 'operator')),
  confirmed_by uuid references profiles(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  overwrite_fee_charged_local numeric,
  paystack_ref text,
  initiated_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists trust_scores (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null unique references conduits(id),
  score numeric check (score is null or (score >= 0 and score <= 100)),
  disputes_raised integer not null default 0,
  late_payments integer not null default 0,
  rejected_invoices integer not null default 0,
  audit_flags_count integer not null default 0,
  clean_approvals integer not null default 0,
  fast_payments integer not null default 0,
  consecutive_dispute_free_months integer not null default 0,
  last_calculated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists satellite_reports (
  id uuid primary key default gen_random_uuid(),
  conduit_id uuid not null references conduits(id),
  report_date date,
  ndvi_map_url text,
  rainfall_mm numeric,
  cloud_cover_percentage numeric,
  image_available boolean not null default false,
  anomaly_detected boolean not null default false,
  anomaly_type text,
  anomaly_description text,
  sentinel_scene_id text,
  created_at timestamptz not null default now()
);

-- NOTE: commodity_prices and exchange_rates already exist (0001_init.sql,
-- extended by 0003_add_price_normalization_columns.sql) and are shared
-- with the price website. Not recreated here - see Task-01's own note
-- that the mobile app's price-feed logic (Task 14) is a separate concern
-- from the website's existing use of these tables.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references profiles(id),
  conduit_id uuid references conduits(id),
  type text,
  title text,
  body text,
  data jsonb,
  read boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- STEP 3 - Sponsorship & Entitlement tables (all genuinely new)
-- ===========================================================================

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  sponsor_id text not null unique,
  display_name text,
  sponsor_type text
    check (sponsor_type is null or sponsor_type in (
      'association', 'cooperative', 'ngo', 'government', 'enterprise',
      'foundation', 'university', 'promotional', 'other'
    )),
  country_code text references country_config(country_code),
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'active' check (status in ('active', 'paused', 'expired', 'terminated')),
  agreement_start date,
  agreement_end date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  entitlement_id text not null unique,
  sponsor_id uuid not null references sponsors(id),
  funding_source_name text,
  funding_source_type text
    check (funding_source_type is null or funding_source_type in ('sponsor', 'donor', 'agrolease', 'government', 'other')),
  funding_source_contact text,
  funding_notes text,
  covered_features jsonb not null default '[]'::jsonb,
  scope jsonb,
  priority integer not null default 0,
  duration_months integer,
  fixed_end_date date,
  grace_period_days integer not null default 30,
  renewal_behaviour text
    check (renewal_behaviour is null or renewal_behaviour in ('expire', 'notify_and_expire', 'auto_renew')),
  max_members integer,
  verification_providers jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'expired')),
  version integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists entitlement_revisions (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references entitlements(id),
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid references profiles(id),
  change_reason text,
  created_at timestamptz not null default now()
);

create table if not exists sponsor_members (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references sponsors(id),
  entitlement_id uuid not null references entitlements(id),
  entitlement_version_at_enrollment integer,
  profile_id uuid references profiles(id),
  verification_provider text,
  verified_identifier text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'grace_period', 'expired', 'converted', 'removed')),
  activated_at timestamptz,
  expires_at timestamptz,
  grace_period_ends_at timestamptz,
  converted_to_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sponsor_activations (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references sponsors(id),
  entitlement_id uuid not null references entitlements(id),
  entitlement_version integer,
  member_id uuid references sponsor_members(id),
  profile_id uuid references profiles(id),
  conduit_id uuid references conduits(id),
  feature_activated text,
  original_price_usd numeric,
  covered_amount_usd numeric,
  currency_code text,
  original_price_local numeric,
  funding_source_name text,
  activation_date timestamptz,
  expiry_date timestamptz,
  engine_decision text check (engine_decision is null or engine_decision in ('SPONSORED', 'PROMOTIONAL', 'ENTERPRISE')),
  created_at timestamptz not null default now()
);
-- Append-only by convention: no UPDATE/DELETE policy is granted below
-- beyond the service_role key, and no application code path should ever
-- issue one. See entitlement_revisions trigger note below for the
-- equivalent guarantee on entitlements.

create table if not exists entitlement_access_denials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  feature text,
  conduit_id uuid references conduits(id),
  reason text,
  denied_by uuid references profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sponsor_invite_codes (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references sponsors(id),
  entitlement_id uuid not null references entitlements(id),
  code text not null unique,
  max_uses integer,
  uses_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists sponsor_phone_whitelist (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references sponsors(id),
  entitlement_id uuid not null references entitlements(id),
  phone text not null,
  claimed boolean not null default false,
  claimed_by uuid references profiles(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists sponsor_email_domains (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references sponsors(id),
  entitlement_id uuid not null references entitlements(id),
  domain text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- STEP 4 - entitlement_revisions enforcement trigger
--
-- Per the schema spec: "Enforced by a DB trigger: BEFORE UPDATE on
-- entitlements, write the current row here first, increment
-- entitlements.version, then apply the update. No code path may bypass
-- this."
-- ===========================================================================

create or replace function fn_entitlements_snapshot_before_update()
returns trigger as $$
begin
  insert into entitlement_revisions (entitlement_id, version, snapshot, changed_by, change_reason)
  values (old.id, old.version, to_jsonb(old), null, null);

  new.version := old.version + 1;
  new.updated_at := now();

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_entitlements_snapshot_before_update on entitlements;
create trigger trg_entitlements_snapshot_before_update
  before update on entitlements
  for each row
  execute function fn_entitlements_snapshot_before_update();

comment on function fn_entitlements_snapshot_before_update() is
  'Writes the pre-update entitlements row to entitlement_revisions and increments version, on every UPDATE - no application code path may bypass this (see Sponsorship System doc).';

-- ===========================================================================
-- STEP 5 - Indexes (exactly the 10 specified in Task-01-Scaffolding-Database.md)
-- ===========================================================================

create index if not exists idx_sponsor_members_profile on sponsor_members(profile_id);
create index if not exists idx_sponsor_members_entitlement on sponsor_members(entitlement_id);
create index if not exists idx_sponsor_members_status on sponsor_members(status);
create index if not exists idx_sponsor_activations_profile on sponsor_activations(profile_id);
create index if not exists idx_sponsor_activations_conduit on sponsor_activations(conduit_id);
create index if not exists idx_sponsor_activations_entitlement on sponsor_activations(entitlement_id);
create index if not exists idx_entitlement_revisions_entitlement on entitlement_revisions(entitlement_id, version desc);
create index if not exists idx_sponsor_invite_codes_code on sponsor_invite_codes(code);
create index if not exists idx_sponsor_phone_whitelist_phone on sponsor_phone_whitelist(phone);
create index if not exists idx_entitlement_access_denials_profile on entitlement_access_denials(profile_id);

-- ===========================================================================
-- STEP 6 - Row Level Security
--
-- All new tables get RLS enabled with no public (anon) policy - every
-- one of them is business data reached only through the Fastify backend
-- using the service_role key, per the Constitution ("mobile app never
-- calls Supabase directly for business logic"). This differs from
-- country_config/commodity_prices, which intentionally keep their
-- existing public-read policies from 0001_init.sql (the price website
-- depends on those) - untouched here.
-- ===========================================================================

alter table profiles enable row level security;
alter table conduits enable row level security;
alter table conduit_sub_parcels enable row level security;
alter table land_utilization_snapshots enable row level security;
alter table security_officers enable row level security;
alter table link_codes enable row level security;
alter table harvest_records enable row level security;
alter table invoices enable row level security;
alter table invoice_proposals enable row level security;
alter table disputes enable row level security;
alter table messages enable row level security;
alter table agreement_change_log enable row level security;
alter table fixed_term_overwrites enable row level security;
alter table trust_scores enable row level security;
alter table satellite_reports enable row level security;
alter table notifications enable row level security;
alter table sponsors enable row level security;
alter table entitlements enable row level security;
alter table entitlement_revisions enable row level security;
alter table sponsor_members enable row level security;
alter table sponsor_activations enable row level security;
alter table entitlement_access_denials enable row level security;
alter table sponsor_invite_codes enable row level security;
alter table sponsor_phone_whitelist enable row level security;
alter table sponsor_email_domains enable row level security;

-- No policies created here (no public/anon access to any of these
-- tables). Real per-role policies (owner/operator/officer/admin RBAC)
-- are a later task's responsibility, once auth (Task 2) exists to
-- define roles against - Task 1 is schema/scaffolding only.
