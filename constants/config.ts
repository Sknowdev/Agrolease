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
