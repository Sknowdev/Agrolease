import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button, ButtonRow } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { apiPost } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

type FormErrors = Partial<
  Record<'displayName' | 'email' | 'password' | 'confirmPassword' | 'phone', string>
>;

/**
 * Sign Up Screen (Task 2, Step 4) - collapsed/expanded, same screen,
 * no new page. "+ Add Phone Number" slides open a Phone field inline
 * via local state - no navigation ever happens for that expansion.
 *
 * On Continue: creates auth.users (email+password), then calls the
 * backend to write the initial `profiles` row and generate the Profile
 * ID (revealed at Welcome), then routes to Verification.
 */
export default function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPhoneExpanded, setIsPhoneExpanded] = useState(false);
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    const nextErrors: FormErrors = {};
    if (!displayName.trim()) nextErrors.displayName = 'Display Name is required.';
    if (!email.trim()) nextErrors.email = 'Email is required.';
    if (!password) nextErrors.password = 'Password is required.';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        phone: isPhoneExpanded && phone.trim() ? phone.trim() : undefined,
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }
      if (!data.session) {
        // Supabase issued the account but there's no session yet
        // (e.g. email confirmation required before a session exists).
        // Sign in explicitly so the backend call below has a valid
        // Bearer token, matching Task 2's flow of profile-creation
        // happening immediately after account creation either way.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          Alert.alert('Sign up failed', signInError.message);
          return;
        }
      }

      await apiPost('/v1/profiles', {
        displayName: displayName.trim(),
        phone: isPhoneExpanded && phone.trim() ? phone.trim() : undefined,
      });

      router.replace('/verification');
    } catch (err) {
      Alert.alert('Sign up failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'agrolease://' },
      });
      if (error) {
        Alert.alert('Google sign-in failed', error.message);
      }
      // Per the brief: Google sign-in skips Verification entirely -
      // handled in app/_layout.tsx's auth-state routing, which sends a
      // freshly-OAuth'd session straight to Welcome instead of
      // Verification (see the routing note in _layout.tsx).
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Text style={styles.heading}>Create your account</Text>

      <TextField
        label="Display Name"
        placeholder="Your name or business name"
        value={displayName}
        onChangeText={setDisplayName}
        error={errors.displayName}
      />
      <TextField
        label="Email"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <TextField
        label="Confirm Password"
        placeholder="••••••••"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />

      {isPhoneExpanded ? (
        <TextField
          label="Phone Number (optional)"
          placeholder="+234..."
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
        />
      ) : (
        <Pressable onPress={() => setIsPhoneExpanded(true)} style={styles.addPhoneRow}>
          <Text style={styles.addPhoneText}>+ Add Phone Number</Text>
        </Pressable>
      )}

      <Button label="Continue" onPress={handleContinue} loading={isSubmitting} />

      <ButtonRow>
        <Button label="Continue with Google" onPress={handleGoogleSignUp} variant="outline" />
        <Button
          label="Security Access"
          onPress={() => router.push('/security/access')}
          variant="outline"
        />
      </ButtonRow>

      <Text style={styles.footerText}>
        Already have an account?{' '}
        <Link href="/login" style={styles.linkInline}>
          Log In
        </Link>
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  addPhoneRow: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addPhoneText: {
    color: Colors.accentDark,
    fontWeight: '600',
    fontSize: 15,
  },
  footerText: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  linkInline: {
    color: Colors.accentDark,
    fontWeight: '600',
  },
});
