import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { apiGet, apiPatch } from '../../lib/apiClient';

type Profile = {
  display_name: string | null;
  email: string | null;
  phone: string | null;
};

/**
 * Edit Profile Screen (Task 2, Step 10).
 *
 * Same app shell (not the dark login-card style). Fields: Display
 * Name, Email, Phone. Save -> back to Profile. Email is shown but
 * editing it goes through Supabase Auth's own update-email flow
 * (not implemented as a distinct screen in this task's checklist) -
 * kept read-only here to avoid silently building an email-change flow
 * the brief never actually specifies a confirmation step for.
 *
 * Uses useFocusEffect (not a bare useEffect) so re-opening this screen
 * always reflects the latest saved profile, not whatever was loaded the
 * first time it mounted - Expo Router keeps pushed screens mounted, so
 * a plain useEffect only ran once per app session.
 */
export default function EditProfile() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      apiGet<{ profile: Profile }>('/v1/profiles/me')
        .then(({ profile }) => {
          setDisplayName(profile.display_name ?? '');
          setEmail(profile.email ?? '');
          setPhone(profile.phone ?? '');
        })
        .catch((err) => {
          Alert.alert(
            'Could not load your profile',
            err instanceof Error ? err.message : 'Please go back and try again.'
          );
        })
        .finally(() => setIsLoading(false));
    }, [])
  );

  async function handleSave() {
    setIsSaving(true);
    try {
      await apiPatch('/v1/profiles/me', { displayName, phone });
      router.back();
    } catch (err) {
      Alert.alert('Could not save changes', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Edit Profile" showBackButton>
      <TextField
        label="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        editable={!isLoading}
      />
      <TextField label="Email" value={email} editable={false} />
      <TextField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!isLoading}
      />
      <Button label="Save" onPress={handleSave} loading={isSaving} disabled={isLoading} />
    </AppShell>
  );
}
