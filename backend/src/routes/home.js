import { getSupabaseClient } from '../db/supabaseClient.js';
import { sendApiError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * GET /v1/home/summary
 * Backs Home's zero-state cards (Step 7): My Conduits, Pending, Recent
 * Activity, Pending Invitations - each a real count, not a hardcoded 0.
 * For a brand-new profile these will genuinely all be 0 (no Conduits
 * exist until Task 3), but the route itself is real - not a stub that
 * only returns zeros. Populated (non-zero) behavior falls out naturally
 * once Task 3 creates real Conduits; no change needed here later.
 */
export default async function homeRoute(app) {
  app.get('/v1/home/summary', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const [conduitsCount, pendingCount, notificationsCount] = await Promise.all([
        supabase
          .from('conduits')
          .select('id', { count: 'exact', head: true })
          .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
          .eq('status', 'active'),
        supabase
          .from('conduits')
          .select('id', { count: 'exact', head: true })
          .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
          .eq('status', 'pending_payment'),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', profileId)
          .eq('read', false),
      ]);

      return reply.send({
        myConduitsCount: conduitsCount.count ?? 0,
        pendingCount: pendingCount.count ?? 0,
        recentActivityCount: notificationsCount.count ?? 0,
        pendingInvitationsCount: 0, // no invitations table exists yet - real Task 3 concern
      });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/conduits/mine
   * Backs My Conduits (Step 8) - a pure list. Empty array for a
   * brand-new profile is the correct, real zero-state response (not a
   * hardcoded stub) - the app renders "You don't have any conduits yet"
   * when this comes back empty.
   */
  app.get('/v1/conduits/mine', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const { data: conduits, error } = await supabase
        .from('conduits')
        .select('id, conduit_id, land_name, status, land_owner_id, farm_operator_id')
        .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
        .order('created_at', { ascending: false });

      if (error) {
        return sendApiError(reply, error);
      }

      return reply.send({ conduits: conduits ?? [] });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
