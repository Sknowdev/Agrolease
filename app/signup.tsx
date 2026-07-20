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

type FormErrors = Partial<
  Record<'displayName' | 'email' | 'password' | 'confirmPassword' | 'phone', string>
>;

/**
 * Sign Up Screen (Task 2, Step 4) - collapsed/expanded, same screen,
 * no new page. "+ Add Phone Number" sits OUTSIDE the green card (see
 * app_refrence.png IMG_1309/1310) and slides the Phone field open
 * inside the card via local state - no navigation ever happens for
 * that expansion.
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
        options: {
          // Real bug fixed here: when email confirmation is required
          // (this project's actual Supabase setup - free tier, no
          // custom SMTP), Continue used to just discard displayName/
          // phone and route to "check your email" - Login's later
          // self-healing POST /v1/profiles call then created the
          // profile with a placeholder name (the email's local-part),
          // never what the user actually typed here. Supabase's own
          // user_metadata survives independently of any session/device -
          // it's attached to auth.users at signUp() time regardless of
          // whether a session comes back immediately, and is readable
          // via getUser() from ANY later session (a different browser
          // tab, a different device, days later) once confirmed. This
          // is the fix: stash the real typed name/phone here, and read
          // it back at the point a profile actually gets created
          // (Login's handleSignIn, and Welcome's own setup form) so the
          // real value is used instead of a fallback.
          data: {
            pending_display_name: displayName.trim(),
            pending_phone: isPhoneExpanded && phone.trim() ? phone.trim() : null,
          },
        },
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      if (data.session) {
        // A session came back immediately (email confirmation is off
        // for this project) - safe to call the backend now.
        await apiPost('/v1/profiles', {
          displayName: displayName.trim(),
          phone: isPhoneExpanded && phone.trim() ? phone.trim() : undefined,
        });
        router.replace('/verification');
        return;
      }

      // No session yet - Supabase requires email/phone confirmation
      // before a session exists. Do NOT attempt signInWithPassword
      // here: it will reliably fail with 400 (email not confirmed)
      // and risks tripping Supabase's signup rate limit (429) on
      // repeated attempts. Route to the "check your email" screen
      // (app/verification.tsx) - this project's Supabase tier sends a
      // confirmation LINK, not a typed code (free tier, no custom SMTP,
      // template can't be changed to {{ .Token }}). The profile row is
      // created after the user actually confirms and signs in for the
      // first time instead - see the post-confirmation routing in
      // app/_layout.tsx, which calls POST /v1/profiles once a real
      // session exists if one hasn't been created yet.
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
        options: { redirectTo: getOAuthRedirectUrl() },
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
    <AuthShell
      belowCard={
        !isPhoneExpanded ? (
          <Pressable onPress={() => setIsPhoneExpanded(true)} style={styles.addPhoneRow}>
            <Text style={styles.addPhoneText}>+ Add phone number</Text>
          </Pressable>
        ) : null
      }
      footer={
        <Pressable style={styles.footerRow} onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text style={styles.footerChevron}>{'>'}</Text>
        </Pressable>
      }
    >
      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subheading}>Let&apos;s get you started</Text>

      <TextField
        onDark
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        error={errors.displayName}
      />
      <TextField
        onDark
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <TextField
        onDark
        placeholder="Password"
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

      {isPhoneExpanded ? (
        <TextField
          onDark
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
        />
      ) : null}

      <Button label="Create Account" onPress={handleContinue} loading={isSubmitting} />

      <ButtonRow>
        <Button
          label="Google"
          onPress={handleGoogleSignUp}
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
  addPhoneRow: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  addPhoneText: {
    color: Colors.accentDark,
    fontWeight: '600',
    fontSize: 15,
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
