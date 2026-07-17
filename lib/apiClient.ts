import { Config } from '../constants/config';

/**
 * Thin fetch wrapper for talking to the AgroLease Fastify backend
 * (see /backend). Per the Engineering Constitution, this is the ONLY
 * path the mobile app uses for business logic - never a direct
 * Supabase call for anything beyond auth session handling.
 *
 * Task 1 scope: wiring only. The only real endpoint that exists on the
 * backend right now is GET /health - see backend/routes for the rest,
 * built in later tasks.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${Config.apiBaseUrl}${path}`);
  if (!res.ok) {
    throw new Error(`API GET ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
