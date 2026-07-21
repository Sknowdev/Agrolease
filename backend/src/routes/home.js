import { getSupabaseClient } from '../db/supabaseClient.js';
import { sendApiError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * GET /v1/home/summary
 * Backs Home's zero-state cards (Step 7), now populated for real
 * (Task 3, Step 9): My Conduits (active), Pending (draft/pending_payment),
 * Recent Activity (unread notifications), Pending Invitations (unaccepted
 * drafts this user created - i.e. still in 'draft' status with only this
 * user's side filled in).
 *
 * "Pending Invitations" is intentionally scoped to drafts the CALLER
 * created (their own side is set, the partner slot is still empty),
 * not every draft they can see - it answers "how many invitations am I
 * personally waiting on a partner for," matching Step 9's own wording.
 */
export default async function homeRoute(app) {
  app.get('/v1/home/summary', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const [conduitsCount, pendingCount, notificationsCount, pendingInvitations] = await Promise.all([
        supabase
          .from('conduits')
          .select('id', { count: 'exact', head: true })
          .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
          .eq('status', 'active'),
        supabase
          .from('conduits')
          .select('id', { count: 'exact', head: true })
          .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
          .in('status', ['draft', 'pending_payment']),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', profileId)
          .eq('read', false),
        supabase
          .from('conduits')
          .select('id, land_owner_id, farm_operator_id')
          .or(`land_owner_id.eq.${profileId},farm_operator_id.eq.${profileId}`)
          .eq('status', 'draft'),
      ]);

      // A draft only counts as "pending invitation I'm waiting on" when
      // the other FK slot is still genuinely empty or still points back
      // at the caller themselves (the creation-time placeholder for the
      // farm_operator-side creator case - see routes/conduits.js's
      // POST /v1/conduits note). Once a real partner exists the status
      // is no longer 'draft' anyway, so this mostly guards against that
      // placeholder self-reference.
      const pendingInvitationsCount = (pendingInvitations.data ?? []).filter((c) => {
        const otherSideId = c.land_owner_id === profileId ? c.farm_operator_id : c.land_owner_id;
        return !otherSideId || otherSideId === profileId;
      }).length;

      return reply.send({
        myConduitsCount: conduitsCount.count ?? 0,
        pendingCount: pendingCount.count ?? 0,
        recentActivityCount: notificationsCount.count ?? 0,
        pendingInvitationsCount,
      });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  /**
   * GET /v1/notifications
   * Backs Home's "Recent Activity" card - previously only a count
   * (recentActivityCount above), with no way to see what the activity
   * actually was. Returns the caller's own notifications, most recent
   * first, capped at 50 (per the Constitution's "no endpoint returns
   * unbounded lists" pagination convention - a full cursor-based
   * implementation is deferred until a real task needs more than one
   * page, this task's own checklist only requires the count to be
   * real, not a full notification center).
   */
  app.get('/v1/notifications', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const supabase = getSupabaseClient();
      const profileId = request.authUser.id;

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, type, title, body, read, created_at')
        .eq('recipient_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return sendApiError(reply, error);
      }

      return reply.send({ notifications: notifications ?? [] });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
