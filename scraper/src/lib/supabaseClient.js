import { createClient } from '@supabase/supabase-js';
import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Bug fix (2026-07-11): plain `import 'dotenv/config'` resolves `.env`
 * relative to the current working directory the process was launched
 * from - not this file's location. The real `.env` lives at the repo
 * root, but every npm script in this package (`scrape:nigeria`, etc.)
 * runs with `scraper/` as the cwd, so dotenv silently found nothing and
 * every source failed with "Missing Supabase credentials" even though
 * real credentials exist. Load `.env` from the repo root explicitly
 * (two directories up from this file: scraper/src/lib -> repo root),
 * so this works the same regardless of which directory the command is
 * actually run from.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT_ENV = path.resolve(__dirname, '..', '..', '..', '.env');
loadDotenv({ path: REPO_ROOT_ENV });

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
