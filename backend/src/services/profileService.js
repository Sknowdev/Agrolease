import { getSupabaseClient } from '../db/supabaseClient.js';
import { ApiError } from '../lib/errors.js';

const PROFILE_ID_PREFIX = 'user';
const PROFILE_ID_DIGITS = 4;
const MAX_GENERATION_ATTEMPTS = 10;

function randomDigits(length) {
  const max = 10 ** length;
  const n = Math.floor(Math.random() * max);
  return String(n).padStart(length, '0');
}

/**
 * Generates a unique Profile ID (`user` + 4 digits, e.g. `user4821`),
 * retrying up to 10x on collision - exactly as Task 2's Welcome screen
 * step specifies. Uniqueness is checked case-insensitively (see
 * migration 0005's idx_profiles_profile_id_lower) even though the
 * generated format is always lowercase, so a later manual edit to
 * uppercase can't silently collide with an existing lowercase one.
 *
 * Throws a 500 ApiError if all attempts collide - vanishingly unlikely
 * at 10,000 possible suffixes, but per the Constitution's "never let a
 * divergence go undocumented" spirit, this fails loudly rather than
 * returning a duplicate ID silently.
 */
export async function generateUniqueProfileId() {
  const supabase = getSupabaseClient();

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const candidate = `${PROFILE_ID_PREFIX}${randomDigits(PROFILE_ID_DIGITS)}`;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('profile_id', candidate)
      .maybeSingle();

    if (error) {
      throw new ApiError(500, 'profile_id_generation_failed', 'Could not verify Profile ID uniqueness.');
    }
    if (!data) {
      return candidate;
    }
  }

  throw new ApiError(
    500,
    'profile_id_generation_exhausted',
    'Could not generate a unique Profile ID after 10 attempts. Please try again.'
  );
}

/**
 * Validates a user-supplied Profile ID for the Profile screen's inline
 * edit: a free-form unique username, not the `user####` auto-generated
 * format alone - per explicit instruction, a user should be able to
 * pick any handle they want (e.g. "johndoe", "farmking"), not be forced
 * to include a number. Still constrained to a safe, URL/display-safe
 * charset and a sane length, checked case-insensitively for uniqueness
 * against every other profile (not just an exact match) - same
 * mechanism as before, just a looser format.
 */
const PROFILE_ID_FORMAT = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Read-only check: is this Profile ID valid and available? Used by
 * both the live-as-you-type availability check (Task 3 addition,
 * GET /v1/profiles/check-id) and the actual save path below - shared
 * so the two never drift out of sync with each other. Never mutates
 * anything; the live check calling this repeatedly as a user types is
 * always safe.
 *
 * Returns { available: boolean, reason?: string } instead of throwing,
 * since "not available" is an expected, normal outcome for a live
 * check (not an error condition) - unlike validateAndReserveProfileId
 * below, which is the actual save path and DOES throw on invalid/taken.
 */
export async function checkProfileIdAvailability(profileId, currentProfileDbId) {
  if (!profileId || !PROFILE_ID_FORMAT.test(profileId)) {
    return { available: false, reason: 'Must be 3-20 characters: letters, numbers, and underscores only.' };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'profile_id_lookup_failed', 'Could not verify Profile ID uniqueness.');
  }
  if (data && data.id !== currentProfileDbId) {
    return { available: false, reason: 'That Profile ID is already in use.' };
  }

  return { available: true };
}

/**
 * Validates a user-supplied Profile ID for the Profile screen's inline
 * edit: a free-form unique username, not the `user####` auto-generated
 * format alone - per explicit instruction, a user should be able to
 * pick any handle they want (e.g. "johndoe", "farmking"), not be forced
 * to include a number. Still constrained to a safe, URL/display-safe
 * charset and a sane length, checked case-insensitively for uniqueness
 * against every other profile (not just an exact match) - same
 * mechanism as before, just a looser format.
 */
export async function validateAndReserveProfileId(profileId, currentProfileDbId) {
  if (!PROFILE_ID_FORMAT.test(profileId)) {
    throw new ApiError(
      422,
      'invalid_profile_id_format',
      'Profile ID must be 3-20 characters: letters, numbers, and underscores only.',
      'profileId'
    );
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'profile_id_lookup_failed', 'Could not verify Profile ID uniqueness.');
  }
  if (data && data.id !== currentProfileDbId) {
    throw new ApiError(409, 'profile_id_taken', 'That Profile ID is already in use.', 'profileId');
  }

  return profileId;
}

/**
 * Resolves the active mobile-app country_config row to stamp onto a
 * new profile's country_code - per the Constitution ("Geography is
 * configuration, not code") and Task 2's explicit checklist item
 * ("country_code on new profiles is pulled from country_config, never
 * hardcoded").
 *
 * IMPORTANT: country_config.active is the PUBLIC PRICE WEBSITE's own
 * flag (Track B - which countries have a live price page), not a
 * mobile-app-specific flag - confirmed directly against the live
 * database, where 17 of 19 rows have active = true (every country the
 * price website shows a page for), not just Nigeria. Querying on
 * `active` alone picked up whichever active row happened to sort
 * first (Ghana, in practice) rather than Nigeria - a real bug, not a
 * hypothetical one. The mobile app has no country-activation flag of
 * its own in this schema (Task 1's migration deliberately didn't add
 * one - see 0004_mobile_app_schema.sql's own comments). `payment_provider`
 * is the only column Task 1 actually populated for exactly one country
 * (Nigeria, `paystack`) and is therefore the real, current signal for
 * "this country is live for the mobile app" - not a guessed proxy.
 * This will need a dedicated column (e.g. `mobile_app_active`) the
 * moment a second mobile-app market launches; flagging here rather
 * than silently re-guessing further logic no brief has asked for yet.
 */
export async function resolveActiveCountryCode() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('country_config')
    .select('country_code')
    .not('payment_provider', 'is', null)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'country_config_lookup_failed', 'Could not resolve active country.', undefined, error);
  }
  if (!data) {
    throw new ApiError(500, 'no_active_country', 'No active country is configured yet.');
  }
  return data.country_code;
}
