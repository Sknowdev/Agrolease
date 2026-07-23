import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { notify } from '../lib/confirm';
import { supabase } from '../lib/supabaseClient';

/**
 * Forgot Password - entry screen (Task 2, Step 13).
 *
 * "No worries! Enter your email and we'll send you a reset link."
 * Matches app_refrence.png IMG_1311: green card holds the form, "←
 * Back to Login" sits outside/below it on white.
 *
 * On success, shows a "Check your email" confirmation in place (not a
 * navigation to a code-entry screen) - confirmed against this
 * project's real Supabase setup that the "Reset Password" email
 * template is the same free-tier default as "Confirm signup"
 * (link-only, {{ .ConfirmationURL }}, no custom SMTP to change it to
 * {{ .Token }}). Building a typed-code entry screen for this exact
 * same reason it was removed from email confirmation (see
 * app/verification.tsx) would never work for a real user - the email
 * never contains a code to type. Clicking the link establishes a
 * recovery session directly (Supabase's client picks it up from the
 * URL fragment once the app is foregrounded) and the user lands on
 * New Password automatically from there - see app/_layout.tsx's
 * onAuthStateChange handling and app/new-password.tsx.
 *
 * "Reset via SMS" is disabled with a clear "Coming soon" message -
 * phone is optional at signup (many accounts have none on file) and
 * no SMS provider is confirmed configured in Supabase yet.
 */
export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSendReset() {
    if (!identifier.trim()) {
      setError('Enter your email.');
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      const trimmed = identifier.trim();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed);
      if (resetError) {
        notify('Could not send reset link', resetError.message);
        return;
      }
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSmsPress() {
    notify(
      'Coming soon',
      'Password reset via SMS isn\u2019t available yet - use email for now.'
    );
  }

  if (isSent) {
    return (
      <AuthShell backLink={{ label: 'Back to Login', onPress: () => router.replace('/login') }}>
        <Ionicons name="mail-outline" size={40} color={Colors.accent} style={styles.icon} />
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.subheading}>
          We&apos;ve sent a password reset link to {identifier}. Tap it to set a new password.
        </Text>
        <Button label="Resend" onPress={handleSendReset} variant="outlineOnDark" loading={isSubmitting} />
      </AuthShell>
    );
  }

  return (
    <AuthShell backLink={{ label: 'Back to Login', onPress: () => router.push('/login') }}>
      <Text style={styles.heading}>Forgot Password?</Text>
      <Text style={styles.subheading}>
        No worries! Enter your email and we&apos;ll send you a reset link.
      </Text>

      <TextField
        onDark
        placeholder="Email"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
        error={error}
      />

      <Button label="Send Reset Link" onPress={handleSendReset} loading={isSubmitting} />
      <Button label="Reset via SMS (Coming soon)" onPress={handleSmsPress} variant="outlineOnDark" />
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
