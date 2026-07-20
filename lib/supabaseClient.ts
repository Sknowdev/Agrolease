import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

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
 *
 * `detectSessionInUrl` MUST be true on web: after a Google OAuth
 * redirect (or a Forgot Password recovery link) lands back on the
 * app, the session sits in the URL as a `#access_token=...` fragment -
 * on web there is no other mechanism that ever reads it. With this
 * set to false (as it was previously, copied from the native-only
 * pattern below), the app silently never established a session at
 * all after the OAuth redirect - Splash's `useAuth` correctly saw no
 * session and sent the user back to Login, which looked like Google
 * sign-in "worked" (real redirect to Google, real redirect back) but
 * then bounced to Login instead of Welcome. On native, this must stay
 * false - there is no browser URL to parse; expo-linking's deep-link
 * handler (see app/_layout.tsx) is the actual mechanism there, and a
 * native app enabling this would break resolving `agrolease://` links.
 */
export const supabase = createClient(Config.supabaseUrl, Config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
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
