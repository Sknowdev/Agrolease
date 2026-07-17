import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { Config } from '../constants/config';

/**
 * Supabase client for the mobile app.
 *
 * Scope note (Constitution): the mobile app does not use this for
 * business-logic reads/writes - all of that goes through the Fastify
 * backend (see /backend and lib/apiClient.ts). This client's job is
 * exactly what Supabase's own client SDK is meant for on mobile: auth
 * session handling (sign up, sign in, OAuth, OTP, password reset) per
 * Task 2's own explicit instruction that "Supabase Auth handles
 * credentials natively in auth.users, not in profiles." Every other
 * table (profiles, conduits, security_officers, etc.) is written/read
 * only through the backend - never directly from here.
 */
export const supabase = createClient(Config.supabaseUrl, Config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Per Supabase's own React Native guidance: pause/resume token
// auto-refresh based on app foreground state, so a backgrounded app
// doesn't keep refreshing a token nobody is using.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
