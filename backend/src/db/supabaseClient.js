import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Loaded the same way server.js does - resolved relative to this file's
// own location, not process.cwd(), so this works regardless of which
// directory the backend is started from (same fix as PR #18's scraper
// dotenv bug).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient = null;

/**
 * Service-role Supabase client for the backend only.
 *
 * Per the Engineering Constitution ("mobile app never calls Supabase
 * directly for business logic - everything routes through the Fastify
 * API"), this client is used exclusively by backend routes/services.
 * The mobile app's own lib/supabaseClient.ts uses the anon key and is
 * scoped to auth-session handling only - it never touches this key.
 *
 * Throws loudly (not a silent undefined client) if credentials are
 * missing, since every Task 2 route depends on this actually working -
 * matches this repo's existing convention (see scraper/src/lib) of
 * failing fast on a missing config rather than limping along.
 */
export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY - copy .env.example to .env at the repo root and fill in real values before starting the backend.'
    );
  }

  cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedClient;
}
