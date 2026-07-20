import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button } from '../components/ui/Button';
import { Colors, Spacing } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';

/**
 * Verification Screen (Task 2, Step 5).
 *
 * Originally built for a typed 6-digit code (per the brief's literal
 * wording, "Enter 6-digit code"). Confirmed directly against this
 * project's real Supabase setup: it's on the free tier with no custom
 * SMTP, so the "Confirm signup" email template cannot be edited away
 * from Supabase's default `{{ .ConfirmationURL }}` link - there is no
 * way to make Supabase send a numeric code instead without a paid
 * plan/custom SMTP provider. Building a code-entry UI against a
 * link-only email would never work no matter how correct the app code
 * was - the mismatch is in Supabase's own account tier, not this app.
 *
 * This screen now reflects the real flow: "check your email and tap
 * the link," with a Resend action (uses Supabase's own resend API,
 * which re-sends that same default link email) and a manual
 * "I've verified - Continue" escape hatch, since clicking the link
 * confirms the account server-side but doesn't itself navigate this
 * already-open app tab anywhere - the user comes back here (or to
 * Login, if they closed this tab) and continues normally, exactly as
 * already verified working in this session (signup -> confirm via
 * email -> log in -> session -> Home).
 */
export default function Verification() {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  async function handleResend() {
    setIsResending(true);
    try {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) {
        Alert.alert('Could not resend', 'No email on file for this session.');
        return;
      }
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        Alert.alert('Could not resend', error.message);
        return;
      }
      Alert.alert('Email sent', 'Check your inbox for a new confirmation link.');
    } finally {
      setIsResending(false);
    }
  }

  async function handleContinue() {
    setIsChecking(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at || data.user?.phone_confirmed_at) {
        router.replace('/welcome');
        return;
      }
      Alert.alert(
        'Not verified yet',
        "We haven't seen your confirmation yet. Tap the link in your email, then try Continue again."
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <AuthShell>
      <Ionicons name="mail-outline" size={40} color={Colors.accent} style={styles.icon} />
      <Text style={styles.heading}>Check your email</Text>
      <Text style={styles.subheading}>
        We&apos;ve sent a confirmation link to your email. Tap it, then come back here and continue.
      </Text>

      <Button label="I've verified - Continue" onPress={handleContinue} loading={isChecking} />
      <Button
        label="Resend Email"
        onPress={handleResend}
        variant="outlineOnDark"
        loading={isResending}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textOnDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: 14,
    color: Colors.mutedOnDark,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
