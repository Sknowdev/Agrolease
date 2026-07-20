import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { supabase } from '../lib/supabaseClient';

/**
 * Central auth/session context for the mobile app.
 *
 * Backs Task 2's Splash routing rule ("Routes to Login (no session) or
 * Home (active session)") and "Returning user with an active session
 * goes straight to Home, never back through auth." Every screen that
 * needs to know whether someone is logged in reads from this context
 * instead of re-querying Supabase directly.
 *
 * Also exposes `lastAuthEvent` so Splash can distinguish a real login
 * session from a PASSWORD_RECOVERY session - Supabase's Forgot
 * Password email link (see app/forgot-password.tsx) establishes a
 * genuine session directly via the URL fragment once clicked, and
 * without this distinction Splash would route a just-clicked recovery
 * link straight to Home (since a session now exists) instead of New
 * Password, skipping the actual password-reset step entirely.
 *
 * On web, if the URL still carries an auth fragment
 * (`#access_token=...`) when this mounts, `getSession()`'s own promise
 * can resolve with `session: null` a moment BEFORE Supabase's async
 * URL-parsing finishes and fires the real SIGNED_IN event (both run
 * concurrently; `getSession()` doesn't wait for URL detection). That
 * false-negative briefly set `isLoading: false` with no session,
 * which sent Splash to Login for one render before the real event
 * corrected it a moment later - the "sometimes it works, sometimes it
 * bounces to Login" behavior this was built to fix. Now: if the URL
 * still has an auth fragment on mount (web only), skip resolving
 * `isLoading` from `getSession()` entirely and wait for the real
 * `onAuthStateChange` event instead - avoids the race outright rather
 * than trying to win it.
 */
type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  lastAuthEvent: AuthChangeEvent | null;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  lastAuthEvent: null,
});

function urlHasAuthFragment(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const hash = window.location.hash;
  return hash.includes('access_token=') || hash.includes('error=');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAuthEvent, setLastAuthEvent] = useState<AuthChangeEvent | null>(null);

  useEffect(() => {
    let mounted = true;
    const awaitingUrlSession = urlHasAuthFragment();

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      // Don't let a same-tick "no session yet" resolve isLoading if
      // the URL is still carrying a token Supabase hasn't finished
      // parsing - the onAuthStateChange listener below will resolve
      // this correctly once it actually lands.
      if (awaitingUrlSession && !data.session) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setLastAuthEvent(event);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, lastAuthEvent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
