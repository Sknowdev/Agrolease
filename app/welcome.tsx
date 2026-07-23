import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { Colors, Spacing } from '../constants/colors';
import { ApiClientError, apiGet, apiPatch, apiPost } from '../lib/apiClient';
import { notify } from '../lib/confirm';
import { supabase } from '../lib/supabaseClient';

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
 *
 * Google sign-in skips Verification entirely and lands here directly
 * (per the brief: "still offers optional Phone + Display Name if
 * missing, then straight to Welcome") - meaning this screen can be the
 * very first place a Google-signed-in user's `profiles` row gets
 * created, since Sign Up's own POST /v1/profiles call never runs for
 * that path. A plain GET /v1/profiles/me 404s in that case (confirmed
 * directly - no profile exists yet), which the previous version of
 * this screen only alerted on and got permanently stuck at
 * `profile_id: '...'`. Now: a 404 here shows a real "complete your
 * profile" form (Display Name required, Phone optional) instead of a
 * dead end, and creates the profile via the same idempotent
 * POST /v1/profiles every other entry path uses.
 */
export default function Welcome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const [setupDisplayName, setSetupDisplayName] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupError, setSetupError] = useState<string | undefined>();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const [isEditingId, setIsEditingId] = useState(false);
  const [editedId, setEditedId] = useState('');
  const [idError, setIdError] = useState<string | undefined>();
  const [isSavingId, setIsSavingId] = useState(false);

  // Same live availability check as My Profile's own inline edit (Task
  // 3 addition) - debounced 400ms after the last keystroke, read-only,
  // never reserves anything.
  const [availability, setAvailability] = useState<{ checking: boolean; available: boolean | null; reason?: string }>(
    { checking: false, available: null }
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiGet<{ profile: Profile }>('/v1/profiles/me')
      .then(({ profile: p }) => {
        setProfile(p);
        setEditedId(p.profile_id);
      })
      .catch(async (err) => {
        if (err instanceof ApiClientError && err.code === 'profile_not_found') {
          // Prefill from whatever was stashed at Sign Up (see
          // app/signup.tsx's pending_display_name/pending_phone) -
          // Google OAuth sign-ins never set these (no Sign Up screen
          // was involved), so the fields stay blank for that path,
          // which is correct - there's nothing to prefill.
          const { data: userData } = await supabase.auth.getUser();
          const pendingName = userData.user?.user_metadata?.pending_display_name as string | undefined;
          const pendingPhone = userData.user?.user_metadata?.pending_phone as string | null | undefined;
          if (pendingName) setSetupDisplayName(pendingName);
          if (pendingPhone) setSetupPhone(pendingPhone);
          setNeedsSetup(true);
          return;
        }
        notify('Could not load your profile', err instanceof Error ? err.message : 'Please try again.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreateProfile() {
    if (!setupDisplayName.trim()) {
      setSetupError('Display Name is required.');
      return;
    }
    setSetupError(undefined);
    setIsCreatingProfile(true);
    try {
      const { profile: created } = await apiPost<{ profile: Profile }>('/v1/profiles', {
        displayName: setupDisplayName.trim(),
        phone: setupPhone.trim() || undefined,
      });
      setProfile(created);
      setEditedId(created.profile_id);
      setNeedsSetup(false);
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsCreatingProfile(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isEditingId || !editedId.trim() || editedId.trim() === profile?.profile_id) {
      setAvailability({ checking: false, available: null });
      return;
    }

    setAvailability({ checking: true, available: null });
    debounceRef.current = setTimeout(() => {
      const value = editedId.trim();
      apiGet<{ available: boolean; reason?: string }>(`/v1/profiles/check-id?profileId=${encodeURIComponent(value)}`)
        .then((result) => {
          if (editedId.trim() === value) {
            setAvailability({ checking: false, available: result.available, reason: result.reason });
          }
        })
        .catch(() => {
          if (editedId.trim() === value) {
            setAvailability({ checking: false, available: null });
          }
        });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [editedId, isEditingId, profile?.profile_id]);

  async function handleSaveProfileId() {
    if (availability.available === false) {
      setIdError(availability.reason ?? 'That Profile ID is not available.');
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  if (needsSetup) {
    return (
      <View style={styles.container}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Almost there!</Text>
        <Text style={styles.subtitle}>Add a display name to finish setting up your account.</Text>

        <Card style={styles.card}>
          <TextField
            label="Display Name"
            placeholder="Your name or business name"
            value={setupDisplayName}
            onChangeText={setSetupDisplayName}
            error={setupError}
          />
          <TextField
            label="Phone Number (optional)"
            placeholder="+234..."
            keyboardType="phone-pad"
            value={setupPhone}
            onChangeText={setSetupPhone}
          />
        </Card>

        <Button label="Continue" onPress={handleCreateProfile} loading={isCreatingProfile} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Text style={styles.title}>Welcome!</Text>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Your Profile ID</Text>
        {isEditingId ? (
          <>
            <TextField value={editedId} onChangeText={setEditedId} error={idError} autoCapitalize="none" />
            {availability.checking ? (
              <View style={styles.availabilityRow}>
                <ActivityIndicator size="small" color={Colors.muted} />
                <Text style={styles.availabilityTextMuted}>Checking availability...</Text>
              </View>
            ) : availability.available === true ? (
              <View style={styles.availabilityRow}>
                <Text style={styles.availabilityTextAvailable}>✓ Available</Text>
              </View>
            ) : availability.available === false ? (
              <View style={styles.availabilityRow}>
                <Text style={styles.availabilityTextTaken}>{availability.reason ?? 'Not available'}</Text>
              </View>
            ) : null}
            <View style={styles.editActions}>
              <Button
                label="Save"
                onPress={handleSaveProfileId}
                loading={isSavingId}
                disabled={availability.checking || availability.available === false}
              />
              <Pressable
                onPress={() => {
                  setIsEditingId(false);
                  setAvailability({ checking: false, available: null });
                }}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.idRow}>
            <Text style={styles.idValue}>{profile?.profile_id ?? '...'}</Text>
            <Pressable onPress={() => setIsEditingId(true)}>
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
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
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
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  availabilityTextMuted: {
    fontSize: 12,
    color: Colors.muted,
  },
  availabilityTextAvailable: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  availabilityTextTaken: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },
});
