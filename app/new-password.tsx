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
 * Forgot Password - New Password screen (Task 2, Step 15).
 *
 * Set + confirm -> back to Login. By this point the reset flow has
 * already established a valid recovery session (either via the email
 * magic-link's deep link, or the phone OTP verified on the previous
 * screen), so this only needs to call updateUser - no re-auth step.
 */
export default function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSetPassword() {
    const nextErrors: typeof errors = {};
    if (!password) nextErrors.password = 'Enter a new password.';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        notify('Could not update password', error.message);
        return;
      }
      await supabase.auth.signOut();
      router.replace('/login');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Text style={styles.heading}>Set a New Password</Text>

      <TextField
        onDark
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <TextField
        onDark
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />

      <Button label="Save Password" onPress={handleSetPassword} loading={isSubmitting} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textOnDark,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
