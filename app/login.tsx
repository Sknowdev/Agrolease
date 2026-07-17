import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../components/ui/AuthShell';
import { Button, ButtonRow } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { supabase } from '../lib/supabaseClient';

/**
 * Login Screen (Task 2, Step 3).
 *
 * Single "Email or Phone" field - detected client-side by format
 * (contains '@' -> email, else -> phone), per the brief. Google and
 * Security Access sit in the same row with equal visual weight.
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
        options: { redirectTo: 'agrolease://' },
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
    <AuthShell>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.subheading}>Sign in to continue</Text>

      <TextField
        label="Email or Phone"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={identifier}
        onChangeText={setIdentifier}
        error={errors.identifier}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <Button label="Sign In" onPress={handleSignIn} loading={isSubmitting} />

      <ButtonRow>
        <Button label="Continue with Google" onPress={handleGoogleSignIn} variant="outline" />
        <Button
          label="Security Access"
          onPress={() => router.push('/security/access')}
          variant="outline"
        />
      </ButtonRow>

      <Link href="/forgot-password" style={styles.link}>
        Forgot Password
      </Link>
      <Text style={styles.footerText}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={styles.linkInline}>
          Sign Up
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
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: Spacing.lg,
  },
  link: {
    color: Colors.accentDark,
    fontSize: 14,
    marginTop: Spacing.md,
    textAlign: 'center',
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
