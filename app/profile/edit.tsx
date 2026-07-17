import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
 */
export default function EditProfile() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiGet<{ profile: Profile }>('/v1/profiles/me').then(({ profile }) => {
      setDisplayName(profile.display_name ?? '');
      setEmail(profile.email ?? '');
      setPhone(profile.phone ?? '');
    });
  }, []);

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
    <AppShell title="Edit Profile">
      <TextField label="Display Name" value={displayName} onChangeText={setDisplayName} />
      <TextField label="Email" value={email} editable={false} />
      <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button label="Save" onPress={handleSave} loading={isSaving} />
    </AppShell>
  );
}
