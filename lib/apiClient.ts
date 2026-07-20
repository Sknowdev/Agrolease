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

async function parseResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = body?.error;
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
