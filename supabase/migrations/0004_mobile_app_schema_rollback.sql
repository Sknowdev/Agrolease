-- Rollback for 0004_mobile_app_schema.sql
--
-- Drops every table/trigger/function/index this migration created, and
-- reverts country_config to its pre-migration state (drops the 3 new
-- columns this migration added; does NOT touch scrape_utc_hour, which
-- pre-existed this migration and was never added or altered by it).
--
-- Does NOT touch: country_config's pre-existing rows/columns beyond the
-- 3 new columns, commodity_prices, exchange_rates, early_access_signups,
-- scraper_run_logs - none of those were created or altered by
-- 0004_mobile_app_schema.sql.

drop trigger if exists trg_entitlements_snapshot_before_update on entitlements;
drop function if exists fn_entitlements_snapshot_before_update();

drop index if exists idx_sponsor_members_profile;
drop index if exists idx_sponsor_members_entitlement;
drop index if exists idx_sponsor_members_status;
drop index if exists idx_sponsor_activations_profile;
drop index if exists idx_sponsor_activations_conduit;
drop index if exists idx_sponsor_activations_entitlement;
drop index if exists idx_entitlement_revisions_entitlement;
drop index if exists idx_sponsor_invite_codes_code;
drop index if exists idx_sponsor_phone_whitelist_phone;
drop index if exists idx_entitlement_access_denials_profile;

-- Drop in dependency order (children before parents).
drop table if exists sponsor_email_domains;
drop table if exists sponsor_phone_whitelist;
drop table if exists sponsor_invite_codes;
drop table if exists entitlement_access_denials;
drop table if exists sponsor_activations;
drop table if exists sponsor_members;
drop table if exists entitlement_revisions;
drop table if exists entitlements;
drop table if exists sponsors;

drop table if exists notifications;
drop table if exists satellite_reports;
drop table if exists trust_scores;
drop table if exists fixed_term_overwrites;
drop table if exists agreement_change_log;
drop table if exists messages;
drop table if exists disputes;
drop table if exists invoice_proposals;
drop table if exists invoices;
drop table if exists harvest_records;
drop table if exists link_codes;
drop table if exists security_officers;
drop table if exists land_utilization_snapshots;
drop table if exists conduit_sub_parcels;
drop table if exists conduits;
drop table if exists profiles;

-- Revert Nigeria's row values for the 3 columns being dropped (defensive
-- - the DROP COLUMN below removes the data anyway, but this makes the
-- intent explicit and keeps the rollback readable top-to-bottom).
update country_config
set
  overwrite_fee_floor_local = null,
  payment_provider = null,
  payment_provider_public_key = null
where country_code = 'NG';

alter table country_config
  drop column if exists overwrite_fee_floor_local,
  drop column if exists payment_provider,
  drop column if exists payment_provider_public_key;
