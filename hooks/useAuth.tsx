import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAuthEvent, setLastAuthEvent] = useState<AuthChangeEvent | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
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
