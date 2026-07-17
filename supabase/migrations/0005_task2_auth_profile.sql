-- AgroLease - Task 2 (Auth + Profile ID) - schema adjustments
--
-- Context: 0004_mobile_app_schema.sql (Task 1) already created `profiles`
-- WITHOUT an `account_role` column - Task 1 was built after Amendment 7
-- (account roles removed) was already in effect, so no role column was
-- ever added in the first place. This migration's DROP COLUMN IF EXISTS
-- is therefore a defensive no-op in this repo's actual history, not a
-- real removal - included anyway because:
--   1. Task-02-Auth-ProfileID.md explicitly requires this exact statement
--      as a "Before You Start" step, and
--   2. IF EXISTS makes it safe to run unconditionally regardless of
--      which schema state the target Supabase project is actually in
--      (e.g. if an earlier, pre-Amendment-7 draft of Task 1 was ever run
--      against it by hand outside this repo's history).
--
-- Also per the brief: confirm profiles.phone is nullable (it already is -
-- 0004_mobile_app_schema.sql never added a NOT NULL constraint on it -
-- included as an explicit, idempotent ALTER anyway so this migration
-- doesn't silently depend on that fact staying true forever).
--
-- No new columns are added for password or Google auth - Supabase Auth
-- handles credentials natively in auth.users, never in profiles, per
-- the brief's own instruction.

-- ===========================================================================
-- STEP 1 - Drop account_role if it exists (defensive - see note above)
-- ===========================================================================
alter table profiles drop column if exists account_role;

-- ===========================================================================
-- STEP 2 - Confirm profiles.phone is nullable (idempotent no-op if already so)
-- ===========================================================================
alter table profiles alter column phone drop not null;

-- ===========================================================================
-- STEP 3 - security_officers: link_codes needs to be reachable by a
-- deep-link code lookup (agrolease://link/{code}) before the officer
-- record itself exists yet. link_codes.code is already unique (from
-- 0004), which is what Security Access's "Verify Your Access" screen
-- looks up - no schema change needed here, this is just confirming the
-- existing column is sufficient (kept as a comment, not a statement, so
-- this migration doesn't restate 0004's own DDL).
-- ===========================================================================

-- ===========================================================================
-- STEP 4 - profile_id generation support: a case-insensitive uniqueness
-- guarantee. profiles.profile_id already has a UNIQUE constraint from
-- 0004, but Postgres UNIQUE is case-sensitive by default ('user1234' and
-- 'USER1234' would both be allowed). The brief's generation format is
-- lowercase ('user' + 4 digits) and the inline-edit feature must also
-- reject a case-variant collision, not just an exact one. Enforced via a
-- unique index on lower(profile_id) rather than changing the column's
-- own case at write time, so a user's chosen casing (if ever allowed to
-- vary) is still preserved for display.
-- ===========================================================================
create unique index if not exists idx_profiles_profile_id_lower
  on profiles (lower(profile_id));

-- ===========================================================================
-- STEP 5 - link_codes: index on conduit_id was not in Task 1's original
-- 10-index list (that list covered Sponsorship/Entitlement tables only),
-- but the Constitution's blanket "every foreign key has an index" rule
-- applies to every table, not just the ones in that specific list -
-- adding it here since Task 2's Security Access flow is the first real
-- read path against this table.
-- ===========================================================================
create index if not exists idx_link_codes_conduit on link_codes(conduit_id);
create index if not exists idx_security_officers_conduit on security_officers(conduit_id);
create index if not exists idx_notifications_recipient on notifications(recipient_id);
