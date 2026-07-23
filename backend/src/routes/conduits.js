import { getSupabaseClient } from '../db/supabaseClient.js';
import { ApiError, sendApiError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';
import {
  generateUniqueConduitId,
  isInvitationExpired,
  oppositeSide,
  resolveConduitCountryCode,
  resolveInvitationExpiry,
  sideToColumn,
} from '../services/conduitService.js';

const BOUNDARY_TYPES = ['pin', 'coords', 'polygon', 'gps'];

function assertOwnsConduit(conduit, profileId) {
  if (conduit.land_owner_id !== profileId && conduit.farm_operator_id !== profileId) {
    throw new ApiError(403, 'not_a_conduit_party', 'You are not a party on this Conduit.');
  }
}

async function loadConduitOr404(supabase, id) {
  const { data: conduit, error } = await supabase.from('conduits').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw new ApiError(500, 'conduit_lookup_failed', 'Could not load this Conduit.', undefined, error);
  }
  if (!conduit) {
    throw new ApiError(404, 'conduit_not_found', 'No such Conduit.');
  }
  return conduit;
}

/**
 * Conduit Creation + Invitation routes (Task 3).
 *
 * Every route requires an authenticated caller except the Accept
 * Invitation lookup/accept pair, which mirrors Task 2's Security
 * Access pattern: a partner reached via a raw Conduit ID or the
 * agrolease://conduit/{id} deep link should be able to look up the
 * invitation before necessarily having signed in on this device -
 * however, accepting still requires an authenticated profile, since
 * accepting means "link *my* profile to this Conduit's other side."
 */
export default async function conduitsRoute(app) {
  /**
   * POST /v1/conduits
   * Step 2-3 combined: creates a draft Conduit row with the creator's
   * chosen side + the Land Label form's three mandatory fields, in one
   * call (the app collects both screens' inputs before submitting -
   * there is no partially-created Conduit sitting in the database
   * between Side Selection and the Land Label form being finished).
   * Conduit ID is generated here as CON-{country_code}-{6 digits},
   * country_code resolved dynamically per Task 3's explicit warning.
   */
  app.post('/v1/conduits', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { side, landName, landSizeHectares, landLocation } = request.body ?? {};
      const profileId = request.authUser.id;
      const supabase = getSupabaseClient();

      if (!landName || !landName.trim()) {
        throw new ApiError(422, 'land_name_required', 'Land Name / Reference is required.', 'landName');
      }
      if (landSizeHectares === undefined || landSizeHectares === null || landSizeHectares === '') {
        throw new ApiError(422, 'land_size_required', 'Size in hectares is required.', 'landSizeHectares');
      }
      const sizeNumber = Number(landSizeHectares);
      if (!Number.isFinite(sizeNumber) || sizeNumber <= 0) {
        throw new ApiError(422, 'land_size_invalid', 'Size in hectares must be a positive number.', 'landSizeHectares');
      }
      if (!landLocation || !landLocation.trim()) {
        throw new ApiError(422, 'land_location_required', 'Location is required.', 'landLocation');
      }

      const column = sideToColumn(side); // throws 422 if invalid

      const countryCode = await resolveConduitCountryCode();
      const conduitId = await generateUniqueConduitId(countryCode);

      const insertRow = {
        conduit_id: conduitId,
        status: 'draft',
        land_name: landName.trim(),
        land_size_hectares: sizeNumber,
        land_location: landLocation.trim(),
        country_code: countryCode,
        // Both FK columns start null; only the creator's chosen side is
        // set here. The other side is filled in on acceptance (Step 7).
        land_owner_id: null,
        farm_operator_id: null,
      };
      insertRow[column] = profileId;

      // land_owner_id is NOT NULL on the conduits table (see
      // 0004_mobile_app_schema.sql) - if the creator chose Farm
      // Operator, land_owner_id must still get a real value from
      // somewhere. Since nobody has been invited yet, the *creator's
      // own* profile temporarily occupies land_owner_id as a
      // placeholder ONLY when they chose farm_operator, and gets
      // overwritten with the real partner's id on acceptance. This is
      // an artifact of the schema's NOT NULL constraint, not a design
      // choice about who "the" owner is - farm_operator_id (the
      // column the creator actually chose) is the authoritative signal
      // for which side the creator is on, always.
      if (column === 'farm_operator_id') {
        insertRow.land_owner_id = profileId;
      }

      const { data: created, error: insertError } = await supabase
        .from('conduits')
        .insert(insertRow)
        .select()
        .single();

      if (insertError) {
        throw new ApiError(500, 'conduit_create_failed', 'Could not create your Conduit. Please try again.', undefined, insertError);
      }

      return reply.status(201).send({ conduit: created });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * PATCH /v1/conduits/:id/land
   * Backs the Land Information card's plain "Edit" affordance (Step 10)
   * on the Conduit Workspace - routes back to a form pre-filled with
   * the same three Land Label fields from creation. Only a party on
   * the Conduit may edit it.
   */
  app.patch('/v1/conduits/:id/land', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { landName, landSizeHectares, landLocation } = request.body ?? {};
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const conduit = await loadConduitOr404(supabase, id);
      assertOwnsConduit(conduit, profileId);

      const updates = {};
      if (landName !== undefined) {
        if (!landName.trim()) {
          throw new ApiError(422, 'land_name_required', 'Land Name / Reference cannot be empty.', 'landName');
        }
        updates.land_name = landName.trim();
      }
      if (landSizeHectares !== undefined) {
        const sizeNumber = Number(landSizeHectares);
        if (!Number.isFinite(sizeNumber) || sizeNumber <= 0) {
          throw new ApiError(422, 'land_size_invalid', 'Size in hectares must be a positive number.', 'landSizeHectares');
        }
        updates.land_size_hectares = sizeNumber;
      }
      if (landLocation !== undefined) {
        if (!landLocation.trim()) {
          throw new ApiError(422, 'land_location_required', 'Location cannot be empty.', 'landLocation');
        }
        updates.land_location = landLocation.trim();
      }

      if (Object.keys(updates).length === 0) {
        throw new ApiError(422, 'no_updates_provided', 'No fields were provided to update.');
      }

      const { data: updated, error } = await supabase
        .from('conduits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiError(500, 'conduit_update_failed', 'Could not save your changes. Please try again.', undefined, error);
      }

      return reply.send({ conduit: updated });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * PATCH /v1/conduits/:id/boundary
   * Step 4 - Farm Boundary capture. Fully optional/skippable: the app
   * never has to call this at all for a given Conduit. Stores
   * farm_boundary_coords (jsonb) + farm_boundary_type, exactly the two
   * columns Task 1's schema already has - no Turf.js, no locked
   * hectares, no sub-parcel logic, per the brief's explicit warning.
   */
  app.patch('/v1/conduits/:id/boundary', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { boundaryType, boundaryCoords } = request.body ?? {};
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const conduit = await loadConduitOr404(supabase, id);
      assertOwnsConduit(conduit, profileId);

      if (!BOUNDARY_TYPES.includes(boundaryType)) {
        throw new ApiError(
          422,
          'invalid_boundary_type',
          `Boundary type must be one of ${BOUNDARY_TYPES.join(', ')}.`,
          'boundaryType'
        );
      }
      if (boundaryCoords === undefined || boundaryCoords === null) {
        throw new ApiError(422, 'boundary_coords_required', 'Boundary coordinates are required.', 'boundaryCoords');
      }

      const { data: updated, error } = await supabase
        .from('conduits')
        .update({ farm_boundary_type: boundaryType, farm_boundary_coords: boundaryCoords })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiError(500, 'conduit_boundary_update_failed', 'Could not save the farm boundary. Please try again.', undefined, error);
      }

      return reply.send({ conduit: updated });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * POST /v1/conduits/:id/invitation
   * Step 5-6 - sets the invitation expiry setting and (re)generates
   * the shareable Conduit ID's countdown. Also used for Step 7's
   * "one-tap regeneration" after an invitation has expired: generates
   * a fresh Conduit ID and recycles the old one, per the brief
   * ("old one recycled" - the same Conduit row keeps its database id,
   * only conduit_id/invitation_expiry are replaced, so the old public
   * ID stops resolving to anything and a party who kept the old code
   * gets a clear "expired" response rather than a stale success).
   */
  app.post('/v1/conduits/:id/invitation', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { expirySetting, regenerateId } = request.body ?? {};
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const conduit = await loadConduitOr404(supabase, id);
      assertOwnsConduit(conduit, profileId);

      // Regeneration (Step 7's "one-tap regeneration") is the one case
      // that must work from 'expired', not just 'draft' - an expired
      // invitation is exactly the scenario regeneration exists to
      // recover from. Any other status (already accepted, active,
      // cancelled) genuinely has no use for a fresh invitation.
      const isRegeneratingExpired = regenerateId && conduit.status === 'expired';
      if (conduit.status !== 'draft' && !isRegeneratingExpired) {
        throw new ApiError(
          409,
          'conduit_not_draft',
          'This Conduit already has a partner and no longer needs an invitation.'
        );
      }

      const { setting, expiresAt } = resolveInvitationExpiry(expirySetting);

      const updates = {
        invitation_expiry_setting: setting,
        invitation_expiry: expiresAt,
      };

      if (isRegeneratingExpired) {
        // Recycle: the old conduit_id stops resolving (a party who
        // kept it gets a clean 404/expired response), and the Conduit
        // is back in play for a partner to accept.
        updates.status = 'draft';
      }

      if (regenerateId) {
        updates.conduit_id = await generateUniqueConduitId(conduit.country_code);
      }

      const { data: updated, error } = await supabase
        .from('conduits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiError(500, 'invitation_update_failed', 'Could not generate the invitation. Please try again.', undefined, error);
      }

      return reply.send({ conduit: updated });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/conduits/lookup/:conduitId
   * Step 7 - Accept Invitation's "enter/confirm the Conduit ID" step.
   * Looks up by the public conduit_id (not the database id), and
   * validates existence + draft status + expiry up front so the app
   * can show the correct message before the partner commits to
   * accepting. No auth required to look up (mirrors Task 2's Security
   * Access "verify code" pattern) - accepting itself does require auth.
   */
  app.get('/v1/conduits/lookup/:conduitId', async (request, reply) => {
    try {
      const { conduitId } = request.params;
      const supabase = getSupabaseClient();

      const { data: conduit, error } = await supabase
        .from('conduits')
        .select('id, conduit_id, land_name, land_location, land_size_hectares, status, invitation_expiry, land_owner_id, farm_operator_id')
        .eq('conduit_id', conduitId)
        .maybeSingle();

      if (error) {
        throw new ApiError(500, 'conduit_lookup_failed', 'Could not look up this Conduit ID.');
      }
      if (!conduit) {
        throw new ApiError(404, 'conduit_not_found', 'No Conduit found with that ID.', 'conduitId');
      }
      if (conduit.status !== 'draft') {
        throw new ApiError(409, 'conduit_not_pending', 'This invitation has already been accepted or is no longer active.', 'conduitId');
      }
      if (isInvitationExpired(conduit)) {
        throw new ApiError(410, 'invitation_expired', 'Invitation expired. Ask your partner to regenerate.', 'conduitId');
      }

      return reply.send({ conduit });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * POST /v1/conduits/lookup/:conduitId/accept
   * Step 7 - accepting a valid invitation. Links the authenticated
   * caller to whichever side the creator didn't take (they are never
   * asked, per the brief), moves status -> 'pending_payment'. Re-runs
   * every validation from the lookup route server-side (never trusts a
   * client-side "it looked valid a moment ago").
   */
  app.post('/v1/conduits/lookup/:conduitId/accept', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { conduitId } = request.params;
      const profileId = request.authUser.id;
      const supabase = getSupabaseClient();

      const { data: conduit, error } = await supabase
        .from('conduits')
        .select('*')
        .eq('conduit_id', conduitId)
        .maybeSingle();

      if (error) {
        throw new ApiError(500, 'conduit_lookup_failed', 'Could not look up this Conduit ID.');
      }
      if (!conduit) {
        throw new ApiError(404, 'conduit_not_found', 'No Conduit found with that ID.', 'conduitId');
      }
      if (conduit.status !== 'draft') {
        throw new ApiError(409, 'conduit_not_pending', 'This invitation has already been accepted or is no longer active.', 'conduitId');
      }
      if (isInvitationExpired(conduit)) {
        throw new ApiError(410, 'invitation_expired', 'Invitation expired. Ask your partner to regenerate.', 'conduitId');
      }

      // Whichever FK slot the creator already occupies determines the
      // creator's side; the acceptor takes the opposite slot. When the
      // creator chose Farm Operator at creation, land_owner_id was
      // temporarily set to the creator's OWN id as a placeholder (see
      // POST /v1/conduits's note, required by the NOT NULL constraint
      // on that column) - detected here by land_owner_id and
      // farm_operator_id both pointing at the same profile - and that
      // placeholder must be OVERWRITTEN by the acceptor's real id, not
      // treated as "already taken." Only a genuinely different id in
      // the acceptor's slot means the Conduit truly already has a
      // partner.
      const creatorChoseOperator = conduit.farm_operator_id !== null && conduit.farm_operator_id === conduit.land_owner_id;
      const creatorSide = creatorChoseOperator ? 'farm_operator' : conduit.land_owner_id ? 'land_owner' : 'farm_operator';
      const acceptorSide = oppositeSide(creatorSide);
      const acceptorColumn = sideToColumn(acceptorSide);

      const acceptorSlotIsPlaceholder = creatorChoseOperator && acceptorColumn === 'land_owner_id';
      if (conduit[acceptorColumn] && conduit[acceptorColumn] !== profileId && !acceptorSlotIsPlaceholder) {
        throw new ApiError(409, 'conduit_side_taken', 'This Conduit already has a partner.', 'conduitId');
      }
      if (conduit.land_owner_id === profileId || conduit.farm_operator_id === profileId) {
        throw new ApiError(409, 'cannot_accept_own_conduit', 'You cannot accept your own invitation.', 'conduitId');
      }

      const updates = { status: 'pending_payment' };
      updates[acceptorColumn] = profileId;

      const { data: updated, error: updateError } = await supabase
        .from('conduits')
        .update(updates)
        .eq('id', conduit.id)
        .select()
        .single();

      if (updateError) {
        throw new ApiError(500, 'conduit_accept_failed', 'Could not accept this invitation. Please try again.', undefined, updateError);
      }

      const creatorId = creatorSide === 'land_owner' ? conduit.land_owner_id : conduit.farm_operator_id;
      await createNotification({
        recipientId: creatorId,
        conduitId: conduit.id,
        type: 'conduit_invitation_accepted',
        title: 'Your Conduit invitation was accepted',
        body: `${updated.conduit_id} now has a partner and is awaiting payment.`,
      });

      return reply.send({ conduit: updated });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/conduits/:id
   * Backs the Conduit Workspace (Step 10) - header, partner info,
   * Land Information card. Only a party on the Conduit may view it.
   * Partner's display_name is joined in here so the app doesn't need a
   * second round trip.
   */
  app.get('/v1/conduits/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params;
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const conduit = await loadConduitOr404(supabase, id);
      assertOwnsConduit(conduit, profileId);

      const partnerId = conduit.land_owner_id === profileId ? conduit.farm_operator_id : conduit.land_owner_id;
      let partner = null;
      if (partnerId && partnerId !== profileId) {
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('id, display_name, profile_id')
          .eq('id', partnerId)
          .maybeSingle();
        partner = partnerProfile ?? null;
      }

      return reply.send({ conduit, partner });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/conduits/mine
   * Step 8/9 - the real My Conduits list AND the source of Home's
   * card counts. Supersedes the zero-state-only version of this route
   * that lived in routes/home.js (Task 2) - kept at the same path so
   * no client change is needed beyond the response now genuinely
   * returning rows. Includes the partner's display name and a
   * computed `isAwaitingPartner` flag so the app doesn't need to
   * re-derive Conduit state from raw FK columns itself.
   */
  app.get('/v1/conduits/mine', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const { data: conduits, error } = await supabase
        .from('conduits')
        .select('id, conduit_id, land_name, land_location, status, invitation_expiry, land_owner_id, farm_operator_id, created_at')
        .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new ApiError(500, 'conduits_lookup_failed', 'Could not load your conduits.', undefined, error);
      }

      const partnerIds = Array.from(
        new Set(
          (conduits ?? [])
            .map((c) => (c.land_owner_id === profileId ? c.farm_operator_id : c.land_owner_id))
            .filter((pid) => pid && pid !== profileId)
        )
      );

      let partnersById = {};
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from('profiles')
          .select('id, display_name, profile_id')
          .in('id', partnerIds);
        partnersById = Object.fromEntries((partners ?? []).map((p) => [p.id, p]));
      }

      const enriched = (conduits ?? []).map((c) => {
        // A Conduit is a "placeholder self" case (see POST /v1/conduits's
        // note) when both FK columns point at the caller themselves -
        // that's still awaiting a real partner, not a self-partnership.
        const otherSideId = c.land_owner_id === profileId ? c.farm_operator_id : c.land_owner_id;
        const isAwaitingPartner = c.status === 'draft' || !otherSideId || otherSideId === profileId;
        const partner = isAwaitingPartner ? null : partnersById[otherSideId] ?? null;
        return {
          ...c,
          partner,
          isAwaitingPartner,
        };
      });

      return reply.send({ conduits: enriched });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * DELETE /v1/conduits/:id
   * Backs the per-row 3-dot menu's Delete action on My Conduits. Only
   * a party on the Conduit may delete it. Hard-deletes the row -
   * Conduits this early in their lifecycle (draft/pending_payment,
   * before any real activity - harvest records, invoices, security
   * officers - can exist against them) have nothing else referencing
   * them yet, so a hard delete is safe and matches what "delete this
   * conduit" actually means to the user, rather than a soft-cancel
   * that would still show up somewhere.
   *
   * Real bug fix (found live, full end-to-end verification pass): a
   * Conduit that had already been accepted (status pending_payment+)
   * has at least one real `notifications` row referencing it (e.g.
   * `conduit_invitation_accepted`, written by the accept route above) -
   * `notifications.conduit_id` has a foreign key back to `conduits.id`
   * with no ON DELETE CASCADE, so deleting the Conduit directly failed
   * with a real Postgres FK violation (23503) on any Conduit that had
   * gotten far enough to generate a notification. A still-draft
   * Conduit with zero notifications yet deleted fine, which is why
   * this task's own earlier testing (which only ever exercised delete
   * against fresh drafts) never caught it. Fixed two ways:
   *   1. `notifications` rows for this Conduit are deleted first, in
   *      the same request - purely informational, always safe to
   *      discard alongside the Conduit itself.
   *   2. Every OTHER table that references conduits(id) per the schema
   *      (security_officers, link_codes, harvest_records, invoices,
   *      disputes, messages, agreement_change_log,
   *      fixed_term_overwrites, trust_scores, satellite_reports,
   *      conduit_sub_parcels, land_utilization_snapshots) is checked
   *      first - if ANY of these already has a real row for this
   *      Conduit (e.g. a security officer linked via Task 2's already-
   *      live Security Access flow), the delete is BLOCKED with a
   *      clear message rather than either silently cascading through
   *      data this task doesn't own, or failing with an opaque 500.
   *      None of these tables have any real write path from Task 3
   *      itself, but Task 2's Security Access flow can write to
   *      security_officers/link_codes against a real Conduit today, so
   *      this defensive check is not hypothetical.
   */
  app.delete('/v1/conduits/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { id } = request.params;
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const conduit = await loadConduitOr404(supabase, id);
      assertOwnsConduit(conduit, profileId);

      const dependentTables = [
        'security_officers',
        'link_codes',
        'harvest_records',
        'invoices',
        'disputes',
        'messages',
        'agreement_change_log',
        'fixed_term_overwrites',
        'trust_scores',
        'satellite_reports',
        'conduit_sub_parcels',
        'land_utilization_snapshots',
      ];

      for (const table of dependentTables) {
        const { count, error: checkError } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('conduit_id', id);
        if (checkError) {
          throw new ApiError(500, 'conduit_delete_check_failed', 'Could not verify this Conduit has no linked records.', undefined, checkError);
        }
        if (count && count > 0) {
          throw new ApiError(
            409,
            'conduit_has_dependent_records',
            'This Conduit has linked records (e.g. security officers, harvest records) and cannot be deleted.'
          );
        }
      }

      const { error: notificationsDeleteError } = await supabase.from('notifications').delete().eq('conduit_id', id);
      if (notificationsDeleteError) {
        throw new ApiError(
          500,
          'conduit_delete_failed',
          'Could not delete this Conduit. Please try again.',
          undefined,
          notificationsDeleteError
        );
      }

      const { error } = await supabase.from('conduits').delete().eq('id', id);
      if (error) {
        throw new ApiError(500, 'conduit_delete_failed', 'Could not delete this Conduit. Please try again.', undefined, error);
      }

      return reply.status(204).send();
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * POST /v1/conduits/expire-drafts
   * Step 11 - the hourly expiry sweep. Finds every draft Conduit whose
   * invitation_expiry has passed, flips status -> 'expired', and writes
   * a notification row for the creator (schema already exists from
   * Task 1) - actual push delivery is Task 10's job, this only
   * guarantees the record exists, per the brief.
   *
   * IMPORTANT - this route exists to make the expiry sweep callable at
   * all; it does NOT schedule itself. Railway (the platform the brief's
   * wording assumes) was dropped project-wide - see
   * docs/CHANGE_LOG_PRODUCT_PLAN.md - so there is currently no cron
   * infrastructure anywhere in this repo to call this on an hourly
   * schedule. Wiring an actual scheduler (a hosted cron service, a
   * platform's own scheduled-job feature, or a self-hosted node-cron
   * process) is an infrastructure decision outside this repo's current
   * deploy target and is flagged, not silently assumed - see
   * task_app_progress.md's Task 3 status.
   */
  app.post('/v1/conduits/expire-drafts', async (_request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const nowIso = new Date().toISOString();

      const { data: expiredConduits, error } = await supabase
        .from('conduits')
        .select('id, conduit_id, land_owner_id, farm_operator_id')
        .eq('status', 'draft')
        .not('invitation_expiry', 'is', null)
        .lt('invitation_expiry', nowIso);

      if (error) {
        throw new ApiError(500, 'expire_drafts_lookup_failed', 'Could not look up expired drafts.', undefined, error);
      }

      const ids = (expiredConduits ?? []).map((c) => c.id);
      if (ids.length === 0) {
        return reply.send({ expiredCount: 0 });
      }

      const { error: updateError } = await supabase.from('conduits').update({ status: 'expired' }).in('id', ids);
      if (updateError) {
        throw new ApiError(500, 'expire_drafts_update_failed', 'Could not mark drafts as expired.', undefined, updateError);
      }

      await Promise.all(
        (expiredConduits ?? []).map((c) => {
          // Creator is whichever FK slot is actually set on a still-draft
          // Conduit (the other slot is null until acceptance).
          const creatorId = c.land_owner_id ?? c.farm_operator_id;
          return createNotification({
            recipientId: creatorId,
            conduitId: c.id,
            type: 'conduit_invitation_expired',
            title: 'Your Conduit invitation expired',
            body: `${c.conduit_id}'s invitation expired with no partner. You can regenerate it from My Conduits.`,
          });
        })
      );

      return reply.send({ expiredCount: ids.length });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
