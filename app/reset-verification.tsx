import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';

/**
 * Forgot Password - Reset Verification Code screen (Task 2, Step 14).
 *
 * Enter the code sent in the previous step. For an email reset, the
 * "code" is actually the recovery link Supabase emails (which deep
 * links back into the app already carrying a session) - for the phone
 * path, it's a real OTP verified here directly. Both converge on New
 * Password (Step 15) once the identity check passes.
 */
export default function ResetVerification() {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmail = (identifier ?? '').includes('@');

  async function handleVerify() {
    if (!code.trim()) {
      setError('Enter the code you received.');
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      if (isEmail) {
        // Email recovery flow: Supabase's magic-link email establishes
        // a session automatically via the app's deep link handler (see
        // app/_layout.tsx) rather than a typed code - this screen still
        // accepts a manually-entered code for the case where Supabase's
        // email template is configured to send a numeric OTP instead of
        // a tappable link (both are valid Supabase configurations).
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: identifier,
          token: code.trim(),
          type: 'recovery',
        });
        if (verifyError) {
          Alert.alert('Invalid code', verifyError.message);
          return;
        }
      } else {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: identifier,
          token: code.trim(),
          type: 'sms',
        });
        if (verifyError) {
          Alert.alert('Invalid code', verifyError.message);
          return;
        }
      }
      router.replace('/new-password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell backLink={{ label: 'Back to Login', onPress: () => router.replace('/login') }}>
      <Text style={styles.heading}>Enter Reset Code</Text>
      <Text style={styles.subheading}>Enter the code we sent to {identifier}.</Text>

      <TextField
        onDark
        placeholder="Verification Code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
        error={error}
      />

      <Button label="Verify" onPress={handleVerify} loading={isSubmitting} />
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
