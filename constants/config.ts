import { Platform } from 'react-native';

/**
 * Runtime configuration for the AgroLease mobile app.
 *
 * Per the Engineering Constitution, the mobile app never calls Supabase
 * directly for writes/business logic - it talks to the Fastify backend
 * (see /backend). EXPO_PUBLIC_SUPABASE_* values below are wired through
 * lib/supabaseClient.ts for the narrow cases the app is allowed to read
 * directly (e.g. auth session), not as a general-purpose DB client.
 */

/**
 * Resolves the backend's base URL.
 *
 * On web, this deliberately points at the CURRENT browser origin (the
 * same host/port the web app itself was loaded from) rather than
 * EXPO_PUBLIC_API_BASE_URL directly - Metro's own dev server (see
 * metro.config.js) proxies /health and /v1/* through to the real
 * backend on that same origin. This exists specifically because, in
 * GitHub Codespaces, the backend's own port needs a SEPARATE forwarded
 * port manually set to Public after every restart - a step that's easy
 * to miss and produces a confusing CORS/ERR_FAILED error that looks
 * like an app bug. Routing through Metro's own already-public origin
 * removes that manual step for web development entirely.
 *
 * Native (iOS/Android) builds never go through Metro's dev server at
 * request time and have no "current origin" concept - they always use
 * EXPO_PUBLIC_API_BASE_URL directly, unaffected by any of this.
 */
function resolveApiBaseUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
}

export const Config = {
  apiBaseUrl: resolveApiBaseUrl(),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

/**
 * OAuth redirect target for Supabase's signInWithOAuth (Google).
 *
 * The custom scheme `agrolease://` only means anything on a native
 * iOS/Android build with that scheme actually registered by the OS -
 * a browser tab (this project's `expo start --web` testing path, or
 * any future web build) cannot follow a redirect to a custom scheme
 * as the final hop back from Google's consent screen. Using the
 * browser's own origin on web, and the app scheme on native, is the
 * correct redirect for each runtime - not a workaround.
 *
 * This does NOT fix a 400 from Supabase's own /auth/v1/authorize
 * endpoint if the Google provider itself isn't enabled (Client ID/
 * Secret configured) in the Supabase dashboard - that is a dashboard
 * configuration step, not something any redirect URL value can work
 * around. See task_app_progress.md's Task 2 status for that open item.
 */
export function getOAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'agrolease://';
}
