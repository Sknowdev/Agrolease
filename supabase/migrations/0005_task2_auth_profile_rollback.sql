-- Rollback for 0005_task2_auth_profile.sql
--
-- Reverses only what this migration added. Does NOT restore
-- profiles.account_role (it was already absent before this migration in
-- this repo's actual history - see the forward migration's note) and
-- does NOT re-add a NOT NULL constraint to profiles.phone (that would
-- fail if any row already has a null phone by the time this runs).

drop index if exists idx_notifications_recipient;
drop index if exists idx_security_officers_conduit;
drop index if exists idx_link_codes_conduit;
drop index if exists idx_profiles_profile_id_lower;

-- profiles.phone nullability and the (already-absent) account_role
-- column are intentionally not touched by this rollback - see note above.
