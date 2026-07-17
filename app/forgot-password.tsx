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
 * enters next, not an out-of-band link they tap.
 */
export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function isEmail(value: string) {
    return value.includes('@');
  }

  async function handleSendReset(method: 'link' | 'sms') {
    if (!identifier.trim()) {
      setError('Enter your email or phone.');
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      const trimmed = identifier.trim();
      if (method === 'link' || isEmail(trimmed)) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed);
        if (resetError) {
          Alert.alert('Could not send reset link', resetError.message);
          return;
        }
      } else {
        // Phone-based reset: Supabase sends an OTP via the phone
        // provider, entered on the next screen the same way sign-up
        // verification works.
        const { error: otpError } = await supabase.auth.signInWithOtp({ phone: trimmed });
        if (otpError) {
          Alert.alert('Could not send reset code', otpError.message);
          return;
        }
      }
      router.push({ pathname: '/reset-verification', params: { identifier: trimmed } });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Text style={styles.heading}>Forgot Password</Text>
      <Text style={styles.subheading}>
        No worries! Enter your email or phone and we&apos;ll send you a reset link.
      </Text>

      <TextField
        label="Email or Phone"
        placeholder="you@example.com"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
        error={error}
      />

      <Button label="Send Reset Link" onPress={() => handleSendReset('link')} loading={isSubmitting} />
      <Button
        label="Reset via SMS"
        onPress={() => handleSendReset('sms')}
        variant="outline"
        loading={isSubmitting}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: Spacing.lg,
  },
});
