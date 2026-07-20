import { getSupabaseClient } from '../db/supabaseClient.js';

/**
 * Per the Engineering Constitution: "Every backend route that creates a
 * relevant event calls the notification service before returning its
 * response. Notifications are not an afterthought."
 *
 * Task 2 scope: writes a row to `notifications` (created in Task 1's
 * migration). Actual push delivery (Expo push token dispatch) is a
 * later task's concern - this only guarantees the event itself is
 * durably recorded, which is the part every future task builds on.
 */
export async function createNotification({ recipientId, conduitId = null, type, title, body, data = null }) {
  if (!recipientId) return null; // nothing to notify - not an error, just a no-op

  const supabase = getSupabaseClient();
  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      conduit_id: conduitId,
      type,
      title,
      body,
      data,
    })
    .select()
    .single();

  if (error) {
    // Never let a notification-write failure break the primary action
    // (e.g. Security Details submission) - log and continue. The
    // primary business record (security_officers, etc.) is the source
    // of truth; a missed notification row is recoverable, a failed
    // submission is not.
    console.error('createNotification failed:', error.message);
    return null;
  }

  return row;
}
