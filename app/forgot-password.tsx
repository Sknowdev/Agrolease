import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';

/**
 * Forgot Password - entry screen (Task 2, Step 13).
 *
 * "No worries! Enter your email or phone and we'll send you a reset
 * link." Field + Send Reset Link, or Reset via SMS - both lead to
 * Reset Verification Code (Step 14) since both are a code the user
 * enters next, not an out-of-band link they tap. Matches
 * app_refrence.png IMG_1311: green card holds the form, "← Back to
 * Login" sits outside/below it on white.
 *
 * "Reset via SMS" is disabled with a clear "Coming soon" message
 * rather than silently attempting an OTP send - phone is optional at
 * signup (many accounts have none on file) and no SMS provider is
 * confirmed configured in Supabase yet (see task_app_progress.md's
 * Task 2 status). Wiring this up fully needs both of those resolved
 * first, not a client-side fix.
 */
export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        Alert.alert('Could not send reset link', resetError.message);
        return;
      }
      router.push({ pathname: '/reset-verification', params: { identifier: trimmed } });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSmsPress() {
    Alert.alert(
      'Coming soon',
      'Password reset via SMS isn\u2019t available yet - use email for now.'
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
