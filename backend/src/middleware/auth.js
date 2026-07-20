import { getSupabaseClient } from '../db/supabaseClient.js';
import { ApiError } from '../lib/errors.js';

/**
 * Verifies the Supabase Auth JWT sent in the Authorization header
 * (`Bearer <access_token>`, the session token from supabase-js after
 * sign-up/sign-in on the app side) and attaches the resolved auth user
 * to `request.authUser`.
 *
 * This does NOT replace Supabase Auth with custom logic - per Task 2's
 * "Before You Start" note, Supabase Auth handles credentials natively.
 * This middleware only confirms a request is carrying a valid session
 * before letting it reach a route that touches `profiles` or any other
 * business table - the actual sign-up/sign-in/OAuth/OTP calls happen
 * directly against Supabase Auth from the app (lib/supabaseClient.ts),
 * never through this backend.
 *
 * Fastify `preHandler` usage: app.get('/path', { preHandler: requireAuth }, handler)
 */
export async function requireAuth(request, _reply) {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'unauthenticated', 'Missing or malformed Authorization header.');
  }

  const token = header.slice('Bearer '.length).trim();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    throw new ApiError(401, 'unauthenticated', 'Invalid or expired session.');
  }

  request.authUser = data.user;
}
