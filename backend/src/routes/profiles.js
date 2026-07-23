import { getSupabaseClient } from '../db/supabaseClient.js';
import { ApiError, sendApiError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import {
  checkProfileIdAvailability,
  generateUniqueProfileId,
  resolveActiveCountryCode,
  validateAndReserveProfileId,
} from '../services/profileService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Profile routes for Task 2 (Auth + Profile ID).
 *
 * All prefixed /v1/ per the Constitution's API versioning rule. Auth
 * itself (sign-up/sign-in/OAuth/OTP against auth.users) happens directly
 * from the app via supabase-js, per Task 2's own instruction - these
 * routes only handle the `profiles` business row that follows a
 * successful auth.users creation, and its subsequent reads/edits.
 */
export default async function profilesRoute(app) {
  /**
   * POST /v1/profiles
   * Called once, immediately after a successful auth.users sign-up
   * (email+password, phone+password, or Google OAuth). Creates the
   * initial profiles row and generates the Profile ID.
   *
   * Idempotent by auth user id: if a profile already exists for this
   * authUser (e.g. a retried request after a network drop), returns the
   * existing row instead of erroring or duplicating.
   */
  app.post('/v1/profiles', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { displayName, phone } = request.body ?? {};
      const authUser = request.authUser;
      const supabase = getSupabaseClient();

      const { data: existing, error: existingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (existingError) {
        throw new ApiError(500, 'profile_lookup_failed', 'Could not check for an existing profile.', undefined, existingError);
      }
      if (existing) {
        return reply.status(200).send({ profile: existing });
      }

      if (!displayName || !displayName.trim()) {
        throw new ApiError(422, 'display_name_required', 'Display Name is required.', 'displayName');
      }

      const countryCode = await resolveActiveCountryCode();
      const profileId = await generateUniqueProfileId();

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          profile_id: profileId,
          display_name: displayName.trim(),
          phone: phone?.trim() || null,
          country_code: countryCode,
          kyc_verified: false,
        })
        .select()
        .single();

      if (insertError) {
        throw new ApiError(500, 'profile_create_failed', 'Could not create your profile. Please try again.', undefined, insertError);
      }

      await createNotification({
        recipientId: created.id,
        type: 'profile_created',
        title: 'Welcome to AgroLease',
        body: `Your Profile ID is ${created.profile_id}.`,
      });

      return reply.status(201).send({ profile: created });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/profiles/check-id?profileId=xyz
   * Live availability check as a user types a new Profile ID, so they
   * find out it's taken (or invalid) before hitting Save - per
   * explicit instruction ("right now until you hit sat/save before you
   * can know"). Read-only, never reserves/changes anything - safe to
   * call on every keystroke (debounced client-side). Excludes the
   * caller's OWN current Profile ID from counting as "taken," same
   * exclusion the real save path already uses.
   */
  app.get('/v1/profiles/check-id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { profileId } = request.query ?? {};
      if (!profileId) {
        throw new ApiError(422, 'profile_id_required', 'Provide a profileId to check.', 'profileId');
      }

      const result = await checkProfileIdAvailability(profileId, request.authUser.id);
      return reply.send(result);
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/profiles/me
   * Backs the Profile screen (Step 9): Display Name, Email, Phone,
   * Profile ID. Email comes from auth.users (Supabase Auth), not
   * profiles - joined here so the app doesn't need a second call.
   */
  app.get('/v1/profiles/me', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.authUser.id)
        .maybeSingle();

      if (error) {
        throw new ApiError(500, 'profile_lookup_failed', 'Could not load your profile.', undefined, error);
      }
      if (!profile) {
        throw new ApiError(404, 'profile_not_found', 'No profile exists for this account yet.');
      }

      return reply.send({
        profile: {
          ...profile,
          email: request.authUser.email ?? null,
        },
      });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * PATCH /v1/profiles/me
   * Backs Edit Profile (Step 10): Display Name, Email, Phone. Email
   * changes go through Supabase Auth's own update-email flow from the
   * app (auth.updateUser), not this route - this only updates the
   * `profiles` table's own fields (display_name, phone). Optionally
   * accepts a new profileId for the Welcome screen's inline [edit].
   */
  app.patch('/v1/profiles/me', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { displayName, phone, profileId } = request.body ?? {};
      const supabase = getSupabaseClient();

      const updates = {};
      if (displayName !== undefined) {
        if (!displayName.trim()) {
          throw new ApiError(422, 'display_name_required', 'Display Name cannot be empty.', 'displayName');
        }
        updates.display_name = displayName.trim();
      }
      if (phone !== undefined) {
        updates.phone = phone?.trim() || null;
      }
      if (profileId !== undefined) {
        updates.profile_id = await validateAndReserveProfileId(profileId, request.authUser.id);
      }

      if (Object.keys(updates).length === 0) {
        throw new ApiError(422, 'no_updates_provided', 'No fields were provided to update.');
      }

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', request.authUser.id)
        .select()
        .single();

      if (error) {
        throw new ApiError(500, 'profile_update_failed', 'Could not save your changes. Please try again.', undefined, error);
      }

      return reply.send({ profile: updated });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * DELETE /v1/profiles/me
   * Deletes the authenticated user's account entirely - the `profiles`
   * row (hard-deleted here since it's identity data intrinsically tied
   * to one auth.users row being removed, not a business record covered
   * by the Constitution's soft-delete convention) and the underlying
   * auth.users row itself via the Auth Admin API (requires the
   * service-role client already used elsewhere in this file - the
   * anon/session-scoped client cannot delete an auth.users row).
   *
   * Called from the app's hamburger menu ("Delete Account"). There is
   * no undo - the app is expected to confirm with the user before
   * calling this, same as any other destructive action.
   */
  app.delete('/v1/profiles/me', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const userId = request.authUser.id;

      const { error: profileDeleteError } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileDeleteError) {
        throw new ApiError(500, 'profile_delete_failed', 'Could not delete your profile. Please try again.', undefined, profileDeleteError);
      }

      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      if (authDeleteError) {
        throw new ApiError(500, 'account_delete_failed', 'Could not delete your account. Please try again.', undefined, authDeleteError);
      }

      return reply.status(204).send();
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
