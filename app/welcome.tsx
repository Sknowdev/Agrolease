import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { apiPatch, apiGet } from '../lib/apiClient';

type Profile = {
  profile_id: string;
  display_name: string | null;
};

/**
 * Welcome Screen (Task 2, Step 6).
 *
 * Per the brief: "Transition screen - auth is over, visual language
 * changes to the main app shell from here on." Deliberately does NOT
 * use AuthShell's dark card - this is the one screen in the auth flow
 * that visually matches Home going forward. No Role Selection step
 * here per Amendment 7 - Verification routes straight here already.
 */
export default function Welcome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedId, setEditedId] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiGet<{ profile: Profile }>('/v1/profiles/me')
      .then(({ profile: p }) => {
        setProfile(p);
        setEditedId(p.profile_id);
      })
      .catch((err) => Alert.alert('Could not load your profile', err.message));
  }, []);

  async function handleSaveProfileId() {
    setIsSaving(true);
    setError(undefined);
    try {
      const { profile: updated } = await apiPatch<{ profile: Profile }>('/v1/profiles/me', {
        profileId: editedId.trim(),
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Text style={styles.title}>Welcome!</Text>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Your Profile ID</Text>
        {isEditing ? (
          <>
            <TextField value={editedId} onChangeText={setEditedId} error={error} autoCapitalize="none" />
            <View style={styles.editActions}>
              <Button label="Save" onPress={handleSaveProfileId} loading={isSaving} />
              <Pressable onPress={() => setIsEditing(false)} style={styles.cancelLink}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.idRow}>
            <Text style={styles.idValue}>{profile?.profile_id ?? '...'}</Text>
            <Pressable onPress={() => setIsEditing(true)}>
              <Text style={styles.editLink}>[edit]</Text>
            </Pressable>
          </View>
        )}
      </Card>

      <Button label="Continue" onPress={() => router.replace('/home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  card: {
    width: '100%',
  },
  cardLabel: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  idValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  editLink: {
    color: Colors.accentDark,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cancelLink: {
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    color: Colors.muted,
  },
});
