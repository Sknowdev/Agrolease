import { router } from 'expo-router';

import { Config } from '../constants/config';
import { supabase } from './supabaseClient';

/**
 * Thin fetch wrapper for talking to the AgroLease Fastify backend
 * (see /backend). Per the Engineering Constitution, this is the ONLY
 * path the mobile app uses for business logic - never a direct
 * Supabase call for anything beyond auth session handling.
 *
 * Task 2 adds authenticated GET/POST/PATCH, using the current Supabase
 * Auth session's access token as the Bearer token the backend's
 * requireAuth middleware expects (see backend/src/middleware/auth.js).
 */

/**
 * Standard error shape the backend returns on failure, per the
 * Constitution's "standard error format on every API response" rule.
 * The app is expected to branch on `.error.code`, never on parsing
 * `.error.message` strings.
 */
export class ApiClientError extends Error {
  code: string;
  field?: string;
  status: number;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Real bug fix (found live, 2026-07-20): a Supabase session whose
 * refresh token has been invalidated server-side (revoked, expired
 * past its refresh window, or from switching between two accounts in
 * the same session) makes `supabase.auth.getSession()` keep returning
 * a *stale but non-null* session forever - it does not clear itself or
 * throw. Every backend call then sends a dead access token and gets a
 * 401 from `requireAuth` (backend/src/middleware/auth.js), but nothing
 * client-side ever recognized that as "you are actually logged out
 * now" - every screen just displayed the 401's error banner and told
 * the user to open the menu and refresh, which re-sends the exact same
 * dead token and 401s again, forever, surviving even a full page
 * reload since the dead session is what's in AsyncStorage/localStorage.
 * Reported directly: infinite 401s after attempting to link two
 * Conduit accounts together, and `supabase.auth.signOut()` itself
 * returning 403 (Supabase's own server-side signOut call also rejects
 * an already-invalid refresh token) - i.e. the user was stuck logged
 * in from the app's point of view with no way back to Login at all.
 *
 * Fix: any 401 from OUR backend (not a 401 from some unrelated third
 * party) is now treated as "the session is dead, full stop" - clears
 * whatever is left of it locally (ignoring signOut's own error, since
 * a session that's already invalid server-side has nothing left to
 * revoke) and hard-redirects to Login. This runs once per dead-session
 * detection, not per failed request, via `isHandlingSessionExpiry`.
 */
let isHandlingSessionExpiry = false;

async function handleSessionExpired() {
  if (isHandlingSessionExpiry) return;
  isHandlingSessionExpiry = true;
  try {
    await supabase.auth.signOut().catch(() => undefined);
  } finally {
    router.replace('/login');
    // Reset shortly after navigating - a genuinely fresh login should
    // be able to trigger this same handling again in the future if it
    // ever happens again, rather than being permanently disabled after
    // firing once per app session.
    setTimeout(() => {
      isHandlingSessionExpiry = false;
    }, 2000);
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = body?.error;
    if (res.status === 401) {
      void handleSessionExpired();
    }
    throw new ApiClientError(
      res.status,
      err?.code ?? 'unknown_error',
      err?.message ?? `Request failed with status ${res.status}`,
      err?.field
    );
  }

  return body as T;
}

export async function apiGet<T>(path: string, opts: { authenticated?: boolean } = {}): Promise<T> {
  const headers = opts.authenticated === false ? {} : await authHeaders();
  const res = await fetch(`${Config.apiBaseUrl}${path}`, { headers });
  return parseResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  opts: { authenticated?: boolean } = {}
): Promise<T> {
  const headers = opts.authenticated === false ? {} : await authHeaders();
  const res = await fetch(`${Config.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${Config.apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${Config.apiBaseUrl}${path}`, {
    method: 'DELETE',
    headers,
  });
  if (res.status === 204) {
    return undefined as T;
  }
  return parseResponse<T>(res);
}
