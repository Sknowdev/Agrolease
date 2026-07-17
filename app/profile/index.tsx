import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';

type Profile = {
  profile_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
};

/**
 * Profile Screen (Task 2, Step 9).
 *
 * Same green header/shell as Home. Shows Display Name, Email, Phone,
 * Profile ID. No Role field anywhere, per Amendment 7.
 */
export default function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    apiGet<{ profile: Profile }>('/v1/profiles/me')
      .then(({ profile: p }) => setProfile(p))
      .catch(() => setProfile(null));
  }, []);

  return (
    <AppShell title="My Profile">
      <Card>
        <Field label="Display Name" value={profile?.display_name ?? '—'} />
        <Field label="Email" value={profile?.email ?? '—'} />
        <Field label="Phone" value={profile?.phone ?? '—'} />
        <Field label="Profile ID" value={profile?.profile_id ?? '—'} />
      </Card>

      <Button label="Edit Profile" onPress={() => router.push('/profile/edit')} />
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
});
