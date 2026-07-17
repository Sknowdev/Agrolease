import { createClient } from '@supabase/supabase-js';

import { Config } from '../constants/config';

/**
 * Supabase client for the mobile app.
 *
 * Scope note (Constitution): the mobile app does not use this for
 * business-logic reads/writes - all of that goes through the Fastify
 * backend (see /backend and lib/apiClient.ts). This client exists only
 * for what Supabase's own client SDK is meant for on mobile (e.g. auth
 * session handling in a later task) - not a general database client.
 *
 * Task 1 scope: wiring only, no calls are made anywhere yet.
 */
export const supabase = createClient(Config.supabaseUrl, Config.supabaseAnonKey);
