import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Public (anon-key) Supabase client for the Next.js app.
 *
 * Only used for reads (country_config, commodity_prices) and the single
 * public insert allowed by RLS (early_access_signups). Never uses the
 * service_role key - that only exists in the scraper's environment.
 */
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copy web/.env.example to web/.env.local and fill in your Supabase project values.'
    );
  }

  cachedClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
