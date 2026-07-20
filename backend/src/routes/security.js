import { getSupabaseClient } from '../db/supabaseClient.js';
import { ApiError, sendApiError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Security Access routes for Task 2 (Steps 10-12).
 *
 * This is a fully independent flow reachable from both Login and
 * Sign Up, and via the agrolease://link/{code} deep link. It creates a
 * `security_officers` row but does NOT implement the full two-party
 * approval workflow yet - per the brief, that's Task 5. This task only
 * needs the row created with status = pending_approval and the
 * "Waiting for Approval" screen's read reachable.
 */
export default async function securityRoute(app) {
  /**
   * GET /v1/security/link-codes/:code
   * Backs the "Verify Your Access" screen (Step 10) - both manual entry
   * and the deep-link/QR-scan path (agrolease://link/{code}) resolve the
   * code the same way, landing on Security Details with the code
   * pre-filled/validated. No auth required - a brand-new security
   * officer with no account at all can reach this (per the brief:
   * "Security Access...not nested inside Sign Up").
   */
  app.get('/v1/security/link-codes/:code', async (request, reply) => {
    try {
      const { code } = request.params;
      const supabase = getSupabaseClient();

      const { data: linkCode, error } = await supabase
        .from('link_codes')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        throw new ApiError(500, 'link_code_lookup_failed', 'Could not verify this access code.');
      }
      if (!linkCode) {
        throw new ApiError(404, 'link_code_invalid', 'This access code is invalid or has expired.', 'code');
      }
      if (linkCode.expires_at && new Date(linkCode.expires_at) < new Date()) {
        throw new ApiError(410, 'link_code_expired', 'This access code has expired.', 'code');
      }

      return reply.send({ linkCode });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * POST /v1/security/officers
   * Backs Security Details (Step 11) - full name + phone, cannot be
   * skipped (enforced client-side by disabling submit, and here
   * server-side too, since the Constitution's file-upload-photo
   * enforcement pattern - "enforced at the UI level AND the API level" -
   * is the right model for any other mandatory-field flow like this
   * one). Creates a security_officers row with status = pending_approval
   * and device_info captured from the request, per the brief.
   *
   * Works with or without an authenticated caller: a brand-new officer
   * with no account at all can submit this (linkedBy stays null), and a
   * logged-in account holder completing Security Access on their own
   * Conduit also works (linkedBy = their profile id) - per the brief's
   * explicit "no blocking logic" requirement for that second case.
   */
  app.post('/v1/security/officers', async (request, reply) => {
    try {
      const { linkCode, fullName, phone, deviceInfo } = request.body ?? {};

      if (!fullName || !fullName.trim()) {
        throw new ApiError(422, 'full_name_required', 'Full name is required.', 'fullName');
      }
      if (!phone || !phone.trim()) {
        throw new ApiError(422, 'phone_required', 'Phone number is required.', 'phone');
      }
      if (!linkCode) {
        throw new ApiError(422, 'link_code_required', 'A valid access code is required.', 'linkCode');
      }

      const supabase = getSupabaseClient();

      const { data: resolvedCode, error: codeError } = await supabase
        .from('link_codes')
        .select('*')
        .eq('code', linkCode)
        .eq('active', true)
        .maybeSingle();

      if (codeError) {
        throw new ApiError(500, 'link_code_lookup_failed', 'Could not verify this access code.');
      }
      if (!resolvedCode) {
        throw new ApiError(404, 'link_code_invalid', 'This access code is invalid or has expired.', 'linkCode');
      }

      // Optional: if the caller is authenticated (a logged-in account
      // holder completing Security Access on their own Conduit), attach
      // their profile id to linked_by - never a hard requirement.
      let linkedBy = null;
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const { data } = await supabase.auth.getUser(authHeader.slice('Bearer '.length).trim());
        linkedBy = data?.user?.id ?? null;
      }

      const { data: officer, error: insertError } = await supabase
        .from('security_officers')
        .insert({
          conduit_id: resolvedCode.conduit_id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          device_info: deviceInfo ?? null,
          linked_by: linkedBy,
          status: 'pending_approval',
          link_code_used: linkCode,
        })
        .select()
        .single();

      if (insertError) {
        throw new ApiError(500, 'security_officer_create_failed', 'Could not submit your details. Please try again.');
      }

      // Notify both parties on the Conduit - resolved via the Conduit's
      // owner/operator ids, per the Constitution's "every route that
      // creates a relevant event calls the notification service" rule.
      const { data: conduit } = await supabase
        .from('conduits')
        .select('land_owner_id, farm_operator_id')
        .eq('id', resolvedCode.conduit_id)
        .maybeSingle();

      if (conduit) {
        const recipients = [conduit.land_owner_id, conduit.farm_operator_id].filter(Boolean);
        await Promise.all(
          recipients.map((recipientId) =>
            createNotification({
              recipientId,
              conduitId: resolvedCode.conduit_id,
              type: 'security_officer_pending_approval',
              title: 'New security officer awaiting approval',
              body: `${officer.full_name} has requested access and is waiting for your approval.`,
            })
          )
        );
      }

      return reply.status(201).send({ securityOfficer: officer });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/security/officers/:id
   * Backs the "Waiting for Approval" screen (Step 12) - polls the
   * officer's current status so the app can show "You're linked.
   * Waiting for approval from both parties." until status flips (the
   * actual approval workflow itself is Task 5 - this route only reads
   * whatever status already exists).
   */
  app.get('/v1/security/officers/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const supabase = getSupabaseClient();

      const { data: officer, error } = await supabase
        .from('security_officers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new ApiError(500, 'security_officer_lookup_failed', 'Could not load status.');
      }
      if (!officer) {
        throw new ApiError(404, 'security_officer_not_found', 'No such security officer record.');
      }

      return reply.send({ securityOfficer: officer });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
