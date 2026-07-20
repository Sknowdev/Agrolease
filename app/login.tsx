import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button, ButtonRow } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { getOAuthRedirectUrl } from '../constants/config';
import { apiPost } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

/**
 * Login Screen (Task 2, Step 3).
 *
 * Single "Email or Phone" field - detected client-side by format
 * (contains '@' -> email, else -> phone), per the brief. Google and
 * Security Access sit in the same row with equal visual weight.
 * Layout matches app_refrence.png IMG_1308 exactly: white page, green
 * card with the form, "Forgot Password?" inside the card, "Don't have
 * an account?" outside it on white.
 */
export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function isEmail(value: string) {
    return value.includes('@');
  }

  async function handleSignIn() {
    const nextErrors: typeof errors = {};
    if (!identifier.trim()) nextErrors.identifier = 'Enter your email or phone.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const trimmed = identifier.trim();
      const { error } = isEmail(trimmed)
        ? await supabase.auth.signInWithPassword({ email: trimmed, password })
        : await supabase.auth.signInWithPassword({ phone: trimmed, password });

      if (error) {
        Alert.alert('Sign in failed', error.message);
        return;
      }

      // Self-healing profile creation: a user who confirmed their
      // email via Supabase's link-based flow (no way around this on
      // the free tier - see app/verification.tsx) and then logs in
      // here directly, rather than being auto-signed-in right after
      // Sign Up, would otherwise never get a `profiles` row written at
      // all - Sign Up's own POST /v1/profiles call only ever fires on
      // its own immediate-session path. POST /v1/profiles is already
      // idempotent (returns the existing row if one exists - see
      // backend/src/routes/profiles.js) so calling it here on every
      // login is always safe, not just on a first-ever login. Falls
      // back to the email's local-part as a placeholder Display Name
      // when creating for the first time - same placeholder pattern
      // already used to backfill the two real accounts that hit this
      // exact gap earlier in this session.
      try {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData.user?.email;
        const fallbackName = email ? email.split('@')[0] : 'New User';
        await apiPost('/v1/profiles', { displayName: fallbackName });
      } catch {
        // Non-fatal - Home/Profile already handle a missing profile
        // gracefully, and this never blocks a successful login.
      }

      router.replace('/home');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getOAuthRedirectUrl() },
      });
      if (error) {
        Alert.alert('Google sign-in failed', error.message);
      }
      // Session change is picked up by useAuth's onAuthStateChange
      // listener and routed from app/index.tsx / _layout - no
      // navigation call needed here for the success path.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      linkRow={{ label: 'Forgot Password?', onPress: () => router.push('/forgot-password') }}
      footer={
        <Pressable style={styles.footerRow} onPress={() => router.push('/signup')}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Text style={styles.footerChevron}>{'>'}</Text>
        </Pressable>
      }
    >
      <Text style={styles.heading}>Sign In</Text>
      <Text style={styles.subheading}>Sign in to continue</Text>

      <TextField
        onDark
        placeholder="Email or Phone"
        autoCapitalize="none"
        keyboardType="email-address"
        value={identifier}
        onChangeText={setIdentifier}
        error={errors.identifier}
      />
      <TextField
        onDark
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <Button label="Sign In" onPress={handleSignIn} loading={isSubmitting} />

      <ButtonRow>
        <Button
          label="Google"
          onPress={handleGoogleSignIn}
          variant="outlineOnDark"
          icon={<FontAwesome name="google" size={16} color="#fff" />}
        />
        <Button
          label="Security"
          onPress={() => router.push('/security/access')}
          variant="outlineOnDark"
          icon={<Ionicons name="shield-checkmark-outline" size={16} color="#fff" />}
        />
      </ButtonRow>
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 15,
    color: Colors.text,
  },
  footerChevron: {
    fontSize: 16,
    color: Colors.muted,
  },
});
