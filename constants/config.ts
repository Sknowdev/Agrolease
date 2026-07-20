/**
 * Runtime configuration for the AgroLease mobile app.
 *
 * Per the Engineering Constitution, the mobile app never calls Supabase
 * directly for writes/business logic - it talks to the Fastify backend
 * (see /backend). EXPO_PUBLIC_SUPABASE_* values below are wired through
 * lib/supabaseClient.ts for the narrow cases the app is allowed to read
 * directly (e.g. auth session), not as a general-purpose DB client.
 */
export const Config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
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
