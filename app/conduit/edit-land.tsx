import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Colors, Spacing } from '../../constants/colors';
import { apiGet, apiPatch } from '../../lib/apiClient';

type Conduit = {
  id: string;
  land_name: string | null;
  land_size_hectares: number | null;
  land_location: string | null;
};

/**
 * Land Information edit form - the plain "Edit" affordance on the
 * Conduit Workspace's Land Information card (Task 3, Step 10). Reuses
 * the exact same three fields as the creation flow's Land Label form
 * (Step 3), pre-filled with the Conduit's current values, per the
 * brief ("routes back to a form pre-filled with Step 3's fields").
 */
export default function ConduitEditLand() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [landName, setLandName] = useState('');
  const [landSizeHectares, setLandSizeHectares] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [errors, setErrors] = useState<{ landName?: string; landSizeHectares?: string; landLocation?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>();

  const load = useCallback(() => {
    if (!id) return Promise.resolve();
    setLoadError(undefined);
    return apiGet<{ conduit: Conduit }>(`/v1/conduits/${id}`)
      .then(({ conduit }) => {
        setLandName(conduit.land_name ?? '');
        setLandSizeHectares(conduit.land_size_hectares ? String(conduit.land_size_hectares) : '');
        setLandLocation(conduit.land_location ?? '');
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load this Conduit.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSave() {
    const nextErrors: typeof errors = {};
    if (!landName.trim()) nextErrors.landName = 'Land Name / Reference is required.';
    if (!landSizeHectares.trim() || !Number.isFinite(Number(landSizeHectares)) || Number(landSizeHectares) <= 0) {
      nextErrors.landSizeHectares = 'Enter a valid, positive number of hectares.';
    }
    if (!landLocation.trim()) nextErrors.landLocation = 'Location is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setLoadError(undefined);
    try {
      await apiPatch(`/v1/conduits/${id}/land`, {
        landName: landName.trim(),
        landSizeHectares: Number(landSizeHectares),
        landLocation: landLocation.trim(),
      });
      router.back();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Edit Land Information" showBackButton hideMenu>
      {isLoading ? (
        <Text style={styles.mutedText}>Loading...</Text>
      ) : (
        <>
          <TextField
            label="Land Name / Reference"
            value={landName}
            onChangeText={setLandName}
            error={errors.landName}
          />
          <TextField
            label="Size in hectares"
            keyboardType="decimal-pad"
            value={landSizeHectares}
            onChangeText={setLandSizeHectares}
            error={errors.landSizeHectares}
          />
          <TextField label="Location" value={landLocation} onChangeText={setLandLocation} error={errors.landLocation} />

          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

          <Button label="Save Changes" onPress={handleSave} loading={isSaving} />
        </>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    fontSize: 13,
    color: Colors.muted,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
});
