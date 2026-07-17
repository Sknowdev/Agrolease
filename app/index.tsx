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
 */
export default function Splash() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (session) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [isLoading, session]);

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
