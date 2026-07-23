import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '../../components/ui/AuthShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';
import { notify } from '../../lib/confirm';

/**
 * Security Access - entry screen (Task 2, Step 10).
 *
 * "Verify Your Access" - Security Access Code field + Continue, or Scan
 * Access QR Code. Reachable from both Login and Sign Up (equal-weight
 * button in that row), and via the deep link agrolease://link/{code}
 * (see app/_layout.tsx), which lands here directly with the code
 * pre-filled via the `code` route param. Matches app_refrence.png
 * IMG_1312: green card, "or" divider between Continue and Scan QR
 * Code, a light restricted-access notice card and "← Back to Login"
 * both outside/below the green card on white.
 */
export default function SecurityAccess() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.code) setCode(params.code);
  }, [params.code]);

  async function handleContinue() {
    if (!code.trim()) {
      setError('Enter your access code.');
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      // Validate the code exists/is active before moving on, so a typo
      // is caught here rather than surfacing only after filling in the
      // Security Details form.
      await apiGet(`/v1/security/link-codes/${encodeURIComponent(code.trim())}`, {
        authenticated: false,
      });
      router.push({ pathname: '/security/details', params: { code: code.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired access code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleScanQr() {
    // Camera-based QR scanning is a device-capability feature outside
    // this task's own checklist (which only requires the entry point
    // exists and both paths are reachable) - full scan-to-code wiring
    // is deferred to whichever task builds the camera flow for real
    // (expo-camera is already installed per Task 1, unused so far).
    notify('Scan Access QR Code', 'QR scanning will be available soon. Enter your code manually for now.');
  }

  return (
    <AuthShell
      backLink={{ label: 'Back to Login', onPress: () => router.push('/login') }}
      belowCard={
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            This area is restricted to authorized security personnel only.
          </Text>
        </View>
      }
    >
      <Text style={styles.heading}>Security Access</Text>
      <Text style={styles.subheading}>
        Enter your access code to continue or scan the QR code.
      </Text>

      <TextField
        onDark
        placeholder="Access Code"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
        error={error}
      />

      <Button label="Continue" onPress={handleContinue} loading={isSubmitting} />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button label="Scan QR Code" onPress={handleScanQr} variant="outlineOnDark" />
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dividerText: {
    color: Colors.mutedOnDark,
    fontSize: 13,
  },
  noticeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  noticeText: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
