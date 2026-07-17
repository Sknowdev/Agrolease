import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../../components/ui/AuthShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Colors, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';

/**
 * Security Access - entry screen (Task 2, Step 10).
 *
 * "Verify Your Access" - Security Access Code field + Continue, or Scan
 * Access QR Code. Reachable from both Login and Sign Up (equal-weight
 * button in that row), and via the deep link agrolease://link/{code}
 * (see app/_layout.tsx), which lands here directly with the code
 * pre-filled via the `code` route param.
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
    Alert.alert('Scan Access QR Code', 'QR scanning will be available soon. Enter your code manually for now.');
  }

  return (
    <AuthShell>
      <Text style={styles.heading}>Verify Your Access</Text>
      <Text style={styles.subheading}>
        Enter the Security Access Code you were given, or scan the access QR code.
      </Text>

      <TextField
        label="Security Access Code"
        placeholder="ABC123"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
        error={error}
      />

      <Button label="Continue" onPress={handleContinue} loading={isSubmitting} />
      <Button label="Scan Access QR Code" onPress={handleScanQr} variant="outline" />
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
