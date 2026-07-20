import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { Colors, Spacing } from '../../constants/colors';
import { apiGet, apiPatch } from '../../lib/apiClient';

type Profile = {
  profile_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
};

/**
 * Profile Screen (Task 2, Step 9).
 *
 * Same green header/shell as Home. Shows Display Name, Email, Phone,
 * Profile ID. No Role field anywhere, per Amendment 7.
 *
 * Profile ID is editable by tapping the value itself - no separate
 * "[edit]" link/button, per explicit instruction. Tapping it turns the
 * field into a text input in place; tapping the checkmark (or the
 * value again while editing) saves, tapping the X cancels.
 *
 * `hideMenu` is set here specifically - being on the Profile screen
 * already, a hamburger menu whose contents are "My Profile / Log Out /
 * Delete Account" would just repeat "My Profile" pointlessly and hide
 * Log Out/Delete Account an extra tap away from where they're most
 * relevant. This screen shows an avatar icon instead of the hamburger,
 * consistent with being the one screen that IS the profile.
 *
 * Uses useFocusEffect (not a bare useEffect) to refetch every time this
 * screen is navigated back to, not just on first mount - Expo Router
 * keeps pushed screens mounted in its stack, so a plain useEffect never
 * re-ran and showed stale data after editing elsewhere and returning.
 */
export default function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [isEditingId, setIsEditingId] = useState(false);
  const [editedId, setEditedId] = useState('');
  const [idError, setIdError] = useState<string | undefined>();
  const [isSavingId, setIsSavingId] = useState(false);

  const loadProfile = useCallback(() => {
    setLoadError(undefined);
    return apiGet<{ profile: Profile }>('/v1/profiles/me')
      .then(({ profile: p }) => {
        setProfile(p);
        setEditedId(p.profile_id);
      })
      .catch((err) => {
        setProfile(null);
        setLoadError(err instanceof Error ? err.message : 'Could not load your profile.');
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  function startEditingId() {
    setEditedId(profile?.profile_id ?? '');
    setIdError(undefined);
    setIsEditingId(true);
  }

  function cancelEditingId() {
    setIsEditingId(false);
    setIdError(undefined);
    setEditedId(profile?.profile_id ?? '');
  }

  async function handleSaveProfileId() {
    if (!editedId.trim() || editedId.trim() === profile?.profile_id) {
      setIsEditingId(false);
      return;
    }
    setIsSavingId(true);
    setIdError(undefined);
    try {
      const { profile: updated } = await apiPatch<{ profile: Profile }>('/v1/profiles/me', {
        profileId: editedId.trim(),
      });
      setProfile(updated);
      setIsEditingId(false);
    } catch (err) {
      setIdError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSavingId(false);
    }
  }

  function handleAvatarPress() {
    // Real photo picking (expo-image-picker, already installed per
    // Task 1) is a later task's concern - this is the placeholder tap
    // target the avatar is meant to have, per explicit instruction,
    // not a dead circle. Wiring a real upload needs a Supabase Storage
    // bucket + signed-URL flow the Constitution requires for any file
    // upload, which isn't part of Task 2's own checklist.
    Alert.alert('Change Profile Photo', 'Photo upload is coming soon.');
  }

  return (
    <AppShell title="My Profile" showBackButton hideMenu>
      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
          <Text style={styles.errorBannerText}>{loadError}</Text>
        </View>
      ) : null}
      <View style={styles.avatarSection}>
        <Pressable onPress={handleAvatarPress} style={styles.avatarCircle}>
          {profile?.avatar_url ? (
            <View style={styles.avatarPlaceholder} />
          ) : (
            <Ionicons name="person" size={36} color={Colors.muted} />
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>
      </View>

      <Card>
        <Field label="Display Name" value={profile?.display_name ?? '—'} />
        <Field label="Email" value={profile?.email ?? '—'} />
        <Field label="Phone" value={profile?.phone ?? '—'} />

        <View style={styles.idField}>
          <Text style={styles.fieldLabel}>Profile ID</Text>
          {isEditingId ? (
            <View>
              <TextField
                value={editedId}
                onChangeText={setEditedId}
                error={idError}
                autoCapitalize="none"
                autoFocus
                editable={!isSavingId}
              />
              <View style={styles.idEditActions}>
                <Pressable
                  onPress={handleSaveProfileId}
                  disabled={isSavingId}
                  style={styles.idActionButton}
                  hitSlop={8}
                >
                  <Ionicons name="checkmark" size={20} color={Colors.accentDark} />
                </Pressable>
                <Pressable onPress={cancelEditingId} disabled={isSavingId} style={styles.idActionButton} hitSlop={8}>
                  <Ionicons name="close" size={20} color={Colors.muted} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={startEditingId} style={styles.idRow}>
              <Text style={styles.fieldValue}>{profile?.profile_id ?? '—'}</Text>
              <Ionicons name="pencil" size={14} color={Colors.muted} />
            </Pressable>
          )}
        </View>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.border,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentDark,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginBottom: Spacing.md,
  },
  idField: {
    marginBottom: 0,
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
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  idEditActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  idActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
