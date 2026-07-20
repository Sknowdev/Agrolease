import React from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../../constants/colors';

/**
 * Shared shell for every pre-auth screen (Login, Sign Up, Verification,
 * Security Access, Security Details, Forgot Password, Reset
 * Verification, New Password) - matches app_refrence.png's real mobile
 * mockups (IMG_1308-1313): a white outer page with the AgroLease logo/
 * wordmark sitting directly on white, and a solid deep-green rounded
 * card underneath holding the actual form. Anything that appears
 * *outside* the green card in the reference (back-to-login links,
 * "Don't have an account?", "+ Add phone number") is rendered via the
 * `belowCard` / `footer` slots below, never inside `children`.
 *
 * The Welcome screen is the deliberate exception: per the brief, it's
 * "a transition screen...visual language changes to the main app shell
 * from here on" - Welcome uses AppShell, not this component.
 */
export function AuthShell({
  children,
  showLogo = true,
  backLink,
  footer,
  belowCard,
  linkRow,
}: {
  children: React.ReactNode;
  showLogo?: boolean;
  /** "← Back to Login" - rendered centered, below the card, on white (see Forgot Password / Security Access). */
  backLink?: { label: string; onPress: () => void };
  /** "Don't have an account? >" style row - rendered below the card, on white. */
  footer?: React.ReactNode;
  /** Content between the card and the footer/back-link, still on white (e.g. "+ Add phone number"). */
  belowCard?: React.ReactNode;
  /** A single centered link below the card, on white (e.g. "Forgot Password?" on Login). */
  linkRow?: { label: string; onPress: () => void };
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
            </View>
          ) : null}
          <View style={styles.card}>{children}</View>
          {belowCard}
          {linkRow ? (
            <Pressable onPress={linkRow.onPress} style={styles.linkRowWrap}>
              <Text style={styles.linkRowText}>{linkRow.label}</Text>
            </Pressable>
          ) : null}
          {backLink ? (
            <Pressable onPress={backLink.onPress} style={styles.backLinkRow}>
              <Text style={styles.backLinkText}>← {backLink.label}</Text>
            </Pressable>
          ) : null}
          {footer}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    // ~10% larger than the previous 64x64 baseline, per feedback that
    // the logo read too small relative to the card below it.
    width: 70,
    height: 70,
  },
  card: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    // Prevent any child (button row text, long labels) from ever
    // rendering wider than the card itself and bleeding past its
    // rounded corners - every screen's content must stay inside this
    // bound regardless of device width.
    overflow: 'hidden',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backLinkRow: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  backLinkText: {
    color: Colors.accentDark,
    fontSize: 15,
    fontWeight: '600',
  },
  linkRowWrap: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  linkRowText: {
    color: Colors.accentDark,
    fontSize: 15,
    fontWeight: '600',
  },
});
