import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Spacing } from '../../constants/colors';
import { apiPost } from '../../lib/apiClient';

type Conduit = { id: string; conduit_id: string };

/**
 * Conduit Creation - Land Label form (Task 3, Step 3).
 *
 * Land Name/Reference, Size in hectares, Location - all three
 * mandatory per the brief. Submitting this screen is what actually
 * creates the draft `conduits` row (POST /v1/conduits), combining
 * Side Selection's choice with these three fields in one call - there
 * is no partially-created Conduit sitting in the database between
 * Side Selection and this form being finished.
 */
export default function ConduitLand() {
  const { side } = useLocalSearchParams<{ side: string }>();
  const [landName, setLandName] = useState('');
  const [landSizeHectares, setLandSizeHectares] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [errors, setErrors] = useState<{ landName?: string; landSizeHectares?: string; landLocation?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function handleContinue() {
    const nextErrors: typeof errors = {};
    if (!landName.trim()) nextErrors.landName = 'Land Name / Reference is required.';
    if (!landSizeHectares.trim()) nextErrors.landSizeHectares = 'Size in hectares is required.';
    else if (!Number.isFinite(Number(landSizeHectares)) || Number(landSizeHectares) <= 0) {
      nextErrors.landSizeHectares = 'Enter a valid, positive number of hectares.';
    }
    if (!landLocation.trim()) nextErrors.landLocation = 'Location is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(undefined);
    setIsSubmitting(true);
    try {
      const { conduit } = await apiPost<{ conduit: Conduit }>('/v1/conduits', {
        side,
        landName: landName.trim(),
        landSizeHectares: Number(landSizeHectares),
        landLocation: landLocation.trim(),
      });
      router.push({ pathname: '/conduit/boundary', params: { conduitId: conduit.id } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not create your Conduit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Create a Conduit" subtitle="Step 2 of 4" showBackButton hideMenu>
      <Text style={styles.heading}>Tell us about the land</Text>
      <Text style={styles.subheading}>All fields are required to continue.</Text>

      <TextField
        label="Land Name / Reference"
        placeholder="e.g. Kaduna North Plot 4"
        value={landName}
        onChangeText={setLandName}
        error={errors.landName}
      />
      <TextField
        label="Size in hectares"
        placeholder="e.g. 12.5"
        keyboardType="decimal-pad"
        value={landSizeHectares}
        onChangeText={setLandSizeHectares}
        error={errors.landSizeHectares}
      />
      <TextField
        label="Location"
        placeholder="e.g. Kaduna State"
        value={landLocation}
        onChangeText={setLandLocation}
        error={errors.landLocation}
      />

      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <Button label="Continue" onPress={handleContinue} loading={isSubmitting} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: 13,
    color: '#6B7A72',
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#D9534F',
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
});
