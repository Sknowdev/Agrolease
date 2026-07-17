import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';

type SecurityOfficer = {
  id: string;
  status: string;
};

/**
 * Security Access - Waiting for Approval screen (Task 2, Step 12).
 *
 * "You're linked. Waiting for approval from both parties." The full
 * two-party approval workflow is Task 5's job - this screen only polls
 * the officer's current status (GET /v1/security/officers/:id) so it
 * can reflect reality if that status ever changes, without building
 * the approval UI itself here.
 */
export default function SecurityWaiting() {
  const { officerId } = useLocalSearchParams<{ officerId: string }>();
  const [officer, setOfficer] = useState<SecurityOfficer | null>(null);

  useEffect(() => {
    if (!officerId) return;
    const poll = () => {
      apiGet<{ securityOfficer: SecurityOfficer }>(`/v1/security/officers/${officerId}`, {
        authenticated: false,
      })
        .then(({ securityOfficer }) => setOfficer(securityOfficer))
        .catch(() => undefined);
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [officerId]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⏳</Text>
      </View>
      <Text style={styles.title}>You&apos;re linked.</Text>
      <Text style={styles.subtitle}>
        Waiting for approval from both parties.
        {officer?.status ? ` Current status: ${officer.status.replace('_', ' ')}.` : ''}
      </Text>

      <Button label="Back to Login" onPress={() => router.replace('/login')} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedOnDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
