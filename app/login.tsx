import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

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
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function isEmail(value: string) {
    return value.includes('@');
  }

  /**
   * Real bug fix (found live): sign-in failures were reported as "the
   * button just spins and doesn't tell the user what's wrong." Root
   * cause was TWO separate, stacked bugs, not one:
   *
   * 1. `Alert.alert(...)` is a complete no-op on web (see
   *    lib/confirm.ts's own comment) - the error message was already
   *    being generated correctly, it just never reached the screen at
   *    all. Fixed by showing the error inline under the form instead
   *    of via Alert.
   * 2. Supabase's own `error.message` for a wrong password was the raw
   *    string "Invalid login credentials" - not wrong, but not a
   *    translated, user-facing message either. Explicit instruction
   *    was to distinguish "incorrect password" from "incorrect email"
   *    specifically - confirmed directly against live Supabase Auth
   *    (disposable test account, three real attempts) that Supabase
   *    intentionally returns the IDENTICAL error/code
   *    (`invalid_credentials`, "Invalid login credentials") for both a
   *    wrong password AND a non-existent email. This is deliberate
   *    security behavior on Supabase's part - distinguishing the two
   *    would let a login form be used to enumerate which emails have
   *    real accounts, a real vulnerability class. This app cannot
   *    build that distinction without either a security regression
   *    (a separate "does this email exist" check) or a change to
   *    Supabase's own behavior, neither of which is something to do
   *    silently - flagging here rather than faking a distinction Login
   *    can't actually know. What CAN be distinguished, and is: an
   *    unconfirmed account (`email_not_confirmed`, a genuinely
   *    different real code) - that gets its own real messages
   */
  function translateSignInError(code: string | undefined, message: string): string {
    if (code === 'email_not_confirmed') {
      return 'Please confirm your email before signing in - check your inbox for the confirmation link.';
    }
    if (code === 'invalid_credentials') {
      return 'Incorrect email/phone or password. Please check and try again.';
    }
    return message || 'Sign in failed. Please try again.';
  }

  async function handleSignIn() {
    const nextErrors: typeof errors = {};
    if (!identifier.trim()) nextErrors.identifier = 'Enter your email or phone.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const trimmed = identifier.trim();
      const { error } = isEmail(trimmed)
        ? await supabase.auth.signInWithPassword({ email: trimmed, password })
        : await supabase.auth.signInWithPassword({ phone: trimmed, password });

      if (error) {
        setFormError(translateSignInError(error.code, error.message));
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
      // login is always safe, not just on a first-ever login.
      //
      // Uses the REAL typed Display Name/Phone from user_metadata
      // (stashed at signUp() time - see app/signup.tsx) rather than a
      // placeholder - fixes a real bug where every profile created via
      // this path got the email's local-part as its name instead of
      // whatever the user actually typed at Sign Up, because that
      // value was previously discarded the moment email confirmation
      // was required. Only falls back to the email-derived placeholder
      // if user_metadata genuinely has nothing (e.g. an edge case that
      // reaches Login without ever going through this app's Sign Up).
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        const pendingName = user?.user_metadata?.pending_display_name as string | undefined;
        const pendingPhone = user?.user_metadata?.pending_phone as string | null | undefined;
        const fallbackName = user?.email ? user.email.split('@')[0] : 'New User';
        await apiPost('/v1/profiles', {
          displayName: pendingName?.trim() || fallbackName,
          phone: pendingPhone || undefined,
        });
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
    setFormError(undefined);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getOAuthRedirectUrl() },
      });
      if (error) {
        setFormError(error.message || 'Google sign-in failed. Please try again.');
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

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

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
  formError: {
    color: '#FF9B9B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.sm,
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
