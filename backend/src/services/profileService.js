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
 * Validates a user-supplied Profile ID for the Welcome screen's inline
 * [edit] action: same `user` + 4 digit format, checked case-insensitively
 * for uniqueness against every other profile (not just an exact match).
 */
const PROFILE_ID_FORMAT = /^[a-zA-Z]+[0-9]{4}$/;

export async function validateAndReserveProfileId(profileId, currentProfileDbId) {
  if (!PROFILE_ID_FORMAT.test(profileId)) {
    throw new ApiError(
      422,
      'invalid_profile_id_format',
      'Profile ID must be letters followed by 4 digits, e.g. user4821.',
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
 * Resolves the active country_config row to stamp onto a new profile's
 * country_code - per the Constitution ("Geography is configuration, not
 * code") and Task 2's explicit checklist item ("country_code on new
 * profiles is pulled from country_config, never hardcoded").
 *
 * Task 2's brief doesn't specify how the active country is determined
 * for a brand-new signup (no device-locale/IP-geo requirement is stated
 * anywhere in this task's checklist) - taking the single row where
 * active = true as the current, deliberately narrow interpretation,
 * since Nigeria is still explicitly the only launch market (see ABS
 * Section 1 / Product Plan V10). This will need revisiting the moment a
 * second country's mobile-app rollout begins - flagging here rather than
 * silently guessing further logic (e.g. IP-based geo-detection) that no
 * brief has asked for yet.
 */
export async function resolveActiveCountryCode() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('country_config')
    .select('country_code')
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'country_config_lookup_failed', 'Could not resolve active country.');
  }
  if (!data) {
    throw new ApiError(500, 'no_active_country', 'No active country is configured yet.');
  }
  return data.country_code;
}
