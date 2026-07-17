import * as Device from 'expo-device';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthShell } from '../../components/ui/AuthShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Colors, Spacing } from '../../constants/colors';
import { apiPost } from '../../lib/apiClient';

/**
 * Security Access - Security Details screen (Task 2, Step 11).
 *
 * Full name + phone - cannot be skipped (Continue is disabled until
 * both are filled, matching the Constitution's "enforced at the UI
 * level AND the API level" pattern used for mandatory photo capture).
 * Creates a security_officers row: status = pending_approval,
 * link_code_used = {code}, device_info captured.
 */
export default function SecurityDetails() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = fullName.trim().length > 0 && phone.trim().length > 0;

  async function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const deviceInfo = `${Device.manufacturer ?? 'unknown'} ${Device.modelName ?? ''}`.trim();
      const { securityOfficer } = await apiPost<{ securityOfficer: { id: string } }>(
        '/v1/security/officers',
        { linkCode: code, fullName: fullName.trim(), phone: phone.trim(), deviceInfo },
        { authenticated: false }
      );
      router.replace({ pathname: '/security/waiting', params: { officerId: securityOfficer.id } });
    } catch (err) {
      Alert.alert('Could not submit', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Text style={styles.heading}>Security Details</Text>
      <Text style={styles.subheading}>
        These details identify you on every record you log. This step cannot be skipped.
      </Text>

      <TextField
        label="Full Name"
        placeholder="Your full name"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
      />
      <TextField
        label="Phone Number"
        placeholder="+234..."
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
      />

      <Button label="Continue" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />
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
