import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';

/**
 * Verification Screen (Task 2, Step 5).
 *
 * "Enter 6-digit code" for email, standard OTP entry for phone - the
 * method used is whichever contact route the user actually signed up
 * with (auth.users already reflects this; determined here from the
 * current session's user record rather than re-asking). On success,
 * routes to Welcome. Google sign-ins never reach this screen at all
 * (see app/_layout.tsx's routing note).
 */
export default function Verification() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify() {
    if (!code.trim() || code.trim().length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError(undefined);
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const { error: verifyError } = user?.email
        ? await supabase.auth.verifyOtp({ email: user.email, token: code.trim(), type: 'email' })
        : await supabase.auth.verifyOtp({
            phone: user?.phone ?? '',
            token: code.trim(),
            type: 'sms',
          });

      if (verifyError) {
        Alert.alert('Verification failed', verifyError.message);
        return;
      }

      router.replace('/welcome');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Text style={styles.heading}>Verify your account</Text>
      <Text style={styles.subheading}>Enter the 6-digit code we sent you.</Text>

      <TextField
        label="Verification Code"
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
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
