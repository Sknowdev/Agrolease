import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../../constants/colors';

/**
 * Shared dark-green background shell for every pre-auth screen (Splash,
 * Login, Sign Up, Verification, Security Access, Forgot Password) -
 * matches app_refrence.png's auth-screen visual language. The Welcome
 * screen is the deliberate exception: per the brief, it's "a transition
 * screen...visual language changes to the main app shell from here on" -
 * Welcome uses AppShell, not this component.
 */
export function AuthShell({
  children,
  showLogo = true,
}: {
  children: React.ReactNode;
  showLogo?: boolean;
}) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {showLogo ? (
            <View style={styles.logoRow}>
              <Image source={require('../../logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.brand}>AgroLease</Text>
            </View>
          ) : null}
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  logo: {
    width: 56,
    height: 56,
  },
  brand: {
    color: Colors.textOnDark,
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.lg,
  },
});
