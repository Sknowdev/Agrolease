import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

/**
 * The scraper always writes with the service role key because it needs to
 * insert into commodity_prices and scraper_run_logs, which are not writable
 * by the public anon key (RLS blocks anonymous writes - see
 * supabase/migrations/0001_init.sql).
 *
 * Environment selection:
 *   SCRAPER_ENV=production node src/index.js ...   -> writes to the production project
 *   (default)                                       -> writes to the staging project
 */
function resolveCredentials() {
  const isProduction = process.env.SCRAPER_ENV === 'production';

  const url = isProduction
    ? process.env.SUPABASE_URL_PRODUCTION
    : process.env.SUPABASE_URL;

  const key = isProduction
    ? process.env.SUPABASE_SERVICE_ROLE_KEY_PRODUCTION
    : process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Missing Supabase credentials for ${isProduction ? 'production' : 'staging'}. ` +
        'Copy .env.example to .env at the repo root and fill in SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return { url, key, isProduction };
}

let cachedClient = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const { url, key, isProduction } = resolveCredentials();
  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  console.log(`[supabase] connected to ${isProduction ? 'PRODUCTION' : 'staging'} project`);
  return cachedClient;
}
