import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Colors, Spacing } from '../../constants/colors';
import { notify } from '../../lib/confirm';
import { supabase } from '../../lib/supabaseClient';

/**
 * Password screen, reached from My Profile (Task 2/3 additions,
 * explicit founder request).
 *
 * Two distinct modes depending on whether the signed-in account
 * already has a password set:
 *
 * - No password yet (e.g. signed up via Google only): shows just New
 *   Password + Confirm Password. Confirmed live against real Supabase
 *   Auth that `updateUser({ password })` succeeds using only the
 *   current session - no re-auth, no email link, no extra
 *   verification step needed. The more elaborate flow floated as an
 *   alternative (set on web, get a verification link, prompt in-app
 *   once detected) is NOT needed - this simpler path works end to end
 *   already, confirmed via a real disposable-account test (create
 *   with no password -> updateUser({password}) -> signInWithPassword
 *   with the new password, all succeeded).
 * - Already has a password: requires Current Password + New Password +
 *   Confirm Password. Supabase's own `updateUser({ password })` API
 *   has NO current-password parameter at all - it only checks that the
 *   caller holds a valid session, confirmed live (changed a real test
 *   account's password with no old-password check from Supabase's
 *   side whatsoever). To actually enforce "you must know your current
 *   password to change it," this screen re-authenticates with
 *   `signInWithPassword` using the entered current password FIRST, and
 *   only calls `updateUser` if that succeeds - this is this app's own
 *   verification step, not something Supabase does automatically.
 *
 * "Has a password" itself is detected from
 * `session.user.app_metadata.providers` (a normal, non-admin field
 * every authenticated session already has) - confirmed live against a
 * real Google-only test account in this project's own database
 * (`providers: ["google"]`, no "email") vs. a real email+password
 * account (`providers: ["email"]`) vs. an account with both linked
 * (`providers: ["email", "google"]`). The rule: has a password if
 * `providers` includes "email" - the Supabase Admin API's
 * `encrypted_password` column is NOT exposed via the client SDK at
 * all (confirmed - the full user object never includes it, even to
 * the service-role key), so `providers` is the correct, only
 * available signal, not a guess.
 */
export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const providers = (data.user?.app_metadata?.providers as string[] | undefined) ?? [];
      setHasPassword(providers.includes('email'));
      setEmail(data.user?.email ?? null);
      setIsLoading(false);
    });
  }, []);

  async function handleSave() {
    const nextErrors: typeof errors = {};
    if (hasPassword && !currentPassword) {
      nextErrors.currentPassword = 'Enter your current password.';
    }
    if (!newPassword) {
      nextErrors.newPassword = hasPassword ? 'Enter a new password.' : 'Enter a password.';
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (hasPassword && newPassword && currentPassword === newPassword) {
      nextErrors.newPassword = 'New password must be different from your current password.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      if (hasPassword) {
        if (!email) {
          setErrors({ currentPassword: 'Could not verify your account. Please sign in again.' });
          return;
        }
        // Supabase's updateUser({password}) has no current-password
        // check of its own (confirmed live) - re-authenticate here
        // first so "current password" is actually enforced, not just
        // collected and ignored.
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (reauthError) {
          setErrors({ currentPassword: 'Current password is incorrect.' });
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        notify('Could not save password', error.message);
        return;
      }

      notify(
        hasPassword ? 'Password changed' : 'Password set',
        hasPassword ? 'Your password has been updated.' : 'You can now sign in with your email and this password.'
      );
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title={hasPassword ? 'Change Password' : 'Set a Password'} showBackButton hideMenu>
      {isLoading ? (
        <Text style={styles.mutedText}>Loading...</Text>
      ) : (
        <>
          {!hasPassword ? (
            <Text style={styles.helperText}>
              Your account currently signs in with Google only. Set a password below to also be able to
              sign in with your email and password.
            </Text>
          ) : null}

          {hasPassword ? (
            <TextField
              label="Current Password"
              placeholder="Your current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              error={errors.currentPassword}
            />
          ) : null}

          <TextField
            label={hasPassword ? 'New Password' : 'Password'}
            placeholder={hasPassword ? 'Your new password' : 'Choose a password'}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            error={errors.newPassword}
          />
          <TextField
            label="Confirm Password"
            placeholder="Re-enter the same password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <Button
            label={hasPassword ? 'Change Password' : 'Set Password'}
            onPress={handleSave}
            loading={isSaving}
          />
        </>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    fontSize: 13,
    color: Colors.muted,
  },
  helperText: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
});
