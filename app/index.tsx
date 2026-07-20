import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';

/**
 * Splash Screen (Task 2, Step 1).
 *
 * Logo, "AgroLease", "Loading..." - brief branded loading state while
 * the session check resolves. Routes to Login (no session) or Home
 * (active session) - never leaves the user stuck here once useAuth
 * resolves, and a returning user with an active session never sees
 * the auth flow again.
 *
 * Two exceptions to the plain "session -> Home" rule, both routing
 * elsewhere based on the specific Supabase auth event that just fired
 * (see hooks/useAuth.tsx's `lastAuthEvent`), not just session presence:
 * - PASSWORD_RECOVERY: a Forgot Password link was just clicked - route
 *   to New Password, not Home (see app/forgot-password.tsx).
 * - A freshly-completed SIGNED_IN via Google OAuth: per the brief,
 *   "Google sign-in...skips Verification entirely...then straight to
 *   Welcome" - a first-time Google sign-in has no `profiles` row yet
 *   (only Sign Up's/Login's own code paths ever call POST
 *   /v1/profiles, and neither runs for the OAuth redirect path), so
 *   sending it straight to Home would show a broken/empty profile.
 *   Welcome itself now handles the "no profile yet" case by prompting
 *   for Display Name (see app/welcome.tsx) - Splash's job is just to
 *   route a fresh OAuth sign-in there instead of Home. A *returning*
 *   Google user (session restored from storage, not a fresh sign-in)
 *   still goes straight to Home as normal - `lastAuthEvent` is null on
 *   a restored session, only set on an actual state-change event.
 */
export default function Splash() {
  const { session, isLoading, lastAuthEvent } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (lastAuthEvent === 'PASSWORD_RECOVERY') {
      router.replace('/new-password');
      return;
    }
    const isGoogleProvider = session.user.app_metadata?.provider === 'google';
    if (lastAuthEvent === 'SIGNED_IN' && isGoogleProvider) {
      router.replace('/welcome');
      return;
    }
    router.replace('/home');
  }, [isLoading, session, lastAuthEvent]);

  return (
    <View style={styles.container}>
      <Image source={require('../logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>AgroLease</Text>
      <ActivityIndicator color={Colors.accent} style={styles.spinner} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDark,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedOnDark,
  },
});
