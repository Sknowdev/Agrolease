import { getSupabaseClient } from '../db/supabaseClient.js';
import { ApiError } from '../lib/errors.js';
import { resolveActiveCountryCode } from './profileService.js';

const CONDUIT_ID_DIGITS = 6;
const MAX_GENERATION_ATTEMPTS = 10;

const EXPIRY_SETTINGS = ['24h', '7d', '30d', 'never'];

const EXPIRY_MS_BY_SETTING = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  // 'never' has no numeric offset - invitation_expiry stays null, meaning
  // "does not expire," per the brief's own 4th option.
};

function randomDigits(length) {
  const max = 10 ** length;
  const n = Math.floor(Math.random() * max);
  return String(n).padStart(length, '0');
}

/**
 * Generates a unique Conduit ID: `CON-{country_code}-{6-digit sequence}`.
 *
 * Per the brief's explicit warning (mirrors Task 2's own real bug with
 * Profile ID generation): the country_code is pulled dynamically from
 * the caller's resolved active country - never hardcoded "NG". Retries
 * up to 10x on collision, same pattern as
 * profileService.generateUniqueProfileId.
 */
export async function generateUniqueConduitId(countryCode) {
  const supabase = getSupabaseClient();

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const candidate = `CON-${countryCode}-${randomDigits(CONDUIT_ID_DIGITS)}`;
    const { data, error } = await supabase
      .from('conduits')
      .select('id')
      .eq('conduit_id', candidate)
      .maybeSingle();

    if (error) {
      throw new ApiError(500, 'conduit_id_generation_failed', 'Could not verify Conduit ID uniqueness.');
    }
    if (!data) {
      return candidate;
    }
  }

  throw new ApiError(
    500,
    'conduit_id_generation_exhausted',
    'Could not generate a unique Conduit ID after 10 attempts. Please try again.'
  );
}

/**
 * Resolves the country code to stamp on a new Conduit. Reuses the same
 * "active country" resolution Task 2 already fixed for Profile creation
 * (profiles.country_code) - a Conduit's country follows its creator's
 * own resolved active country, not a hardcoded value, for the same
 * reason Task 2's real bug applied to profiles.
 */
export async function resolveConduitCountryCode() {
  return resolveActiveCountryCode();
}

/**
 * Validates an invitation expiry setting and computes the absolute
 * `invitation_expiry` timestamp from "now." Returns { setting, expiresAt }
 * where expiresAt is an ISO string or null for 'never'.
 */
export function resolveInvitationExpiry(setting) {
  const resolvedSetting = setting || '24h';
  if (!EXPIRY_SETTINGS.includes(resolvedSetting)) {
    throw new ApiError(
      422,
      'invalid_invitation_expiry',
      'Invitation expiry must be one of 24h, 7d, 30d, or never.',
      'invitationExpirySetting'
    );
  }

  const offsetMs = EXPIRY_MS_BY_SETTING[resolvedSetting];
  const expiresAt = offsetMs ? new Date(Date.now() + offsetMs).toISOString() : null;

  return { setting: resolvedSetting, expiresAt };
}

/**
 * Determines which FK slot (`land_owner_id` or `farm_operator_id`) a
 * given side maps to - the single source of truth for Side Selection's
 * meaning (Step 2 of the brief), used both at creation and at
 * acceptance (where the partner takes the opposite side automatically).
 */
export function sideToColumn(side) {
  if (side === 'land_owner') return 'land_owner_id';
  if (side === 'farm_operator') return 'farm_operator_id';
  throw new ApiError(422, 'invalid_side', 'Side must be "land_owner" or "farm_operator".', 'side');
}

export function oppositeSide(side) {
  if (side === 'land_owner') return 'farm_operator';
  if (side === 'farm_operator') return 'land_owner';
  throw new ApiError(422, 'invalid_side', 'Side must be "land_owner" or "farm_operator".', 'side');
}

/** Whether a Conduit's draft invitation has expired ('never' never expires). */
export function isInvitationExpired(conduit) {
  if (!conduit.invitation_expiry) return false;
  return new Date(conduit.invitation_expiry) < new Date();
}
