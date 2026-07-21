import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiGet, apiPatch, apiPost } from '../../lib/apiClient';

type ExpirySetting = '24h' | '7d' | '30d' | 'never';
type BoundaryMethod = 'pin' | 'coords' | 'polygon' | 'gps';

type Conduit = {
  id: string;
  status: string;
  land_name: string | null;
  land_size_hectares: number | null;
  land_location: string | null;
  farm_boundary_type: BoundaryMethod | null;
  farm_boundary_coords: { lat?: number; lng?: number; points?: { lat: number; lng: number }[] } | null;
  invitation_expiry_setting: ExpirySetting | null;
};

const EXPIRY_OPTIONS: { value: ExpirySetting; label: string }[] = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'never', label: 'Never' },
];

/**
 * Edit Conduit - the combined edit screen reached from My Conduits'
 * per-row 3-dot menu ("Edit Conduit"). Lets a party change anything
 * they set during the creation flow (Land Label, Farm Boundary,
 * Invitation Expiry) from one place, instead of three separate
 * creation-flow screens - per explicit instruction ("edit conduit...
 * you can use to change anything you can do during creation of
 * conduit").
 *
 * Reuses the same three backend routes the creation flow itself uses
 * (PATCH .../land, PATCH .../boundary, POST .../invitation) - no new
 * backend logic beyond what Task 3 already built, this screen is a
 * different front-end entry point onto the same operations.
 *
 * Invitation Expiry editing only makes sense while the Conduit is
 * still `draft` (no partner yet) - once accepted there is no open
 * invitation left to adjust, so that section is hidden for any other
 * status rather than shown disabled with no explanation.
 */
export default function ConduitEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conduit, setConduit] = useState<Conduit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  const [landName, setLandName] = useState('');
  const [landSizeHectares, setLandSizeHectares] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [landErrors, setLandErrors] = useState<{ landName?: string; landSizeHectares?: string; landLocation?: string }>({});
  const [isSavingLand, setIsSavingLand] = useState(false);

  const [boundaryMethod, setBoundaryMethod] = useState<BoundaryMethod | null>(null);
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [isSavingBoundary, setIsSavingBoundary] = useState(false);
  const [boundaryError, setBoundaryError] = useState<string | undefined>();
  const [boundarySavedType, setBoundarySavedType] = useState<BoundaryMethod | null>(null);

  const [expirySetting, setExpirySetting] = useState<ExpirySetting>('24h');
  const [isSavingExpiry, setIsSavingExpiry] = useState(false);
  const [expiryError, setExpiryError] = useState<string | undefined>();
  const [expirySaved, setExpirySaved] = useState(false);

  const load = useCallback(() => {
    if (!id) return Promise.resolve();
    setLoadError(undefined);
    return apiGet<{ conduit: Conduit }>(`/v1/conduits/${id}`)
      .then(({ conduit: c }) => {
        setConduit(c);
        setLandName(c.land_name ?? '');
        setLandSizeHectares(c.land_size_hectares ? String(c.land_size_hectares) : '');
        setLandLocation(c.land_location ?? '');
        setBoundarySavedType(c.farm_boundary_type ?? null);
        if (c.farm_boundary_type) setBoundaryMethod(c.farm_boundary_type);
        if (c.farm_boundary_coords?.lat !== undefined) setLatText(String(c.farm_boundary_coords.lat));
        if (c.farm_boundary_coords?.lng !== undefined) setLngText(String(c.farm_boundary_coords.lng));
        setExpirySetting(c.invitation_expiry_setting ?? '24h');
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load this Conduit.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSaveLand() {
    const nextErrors: typeof landErrors = {};
    if (!landName.trim()) nextErrors.landName = 'Land Name / Reference is required.';
    if (!landSizeHectares.trim() || !Number.isFinite(Number(landSizeHectares)) || Number(landSizeHectares) <= 0) {
      nextErrors.landSizeHectares = 'Enter a valid, positive number of hectares.';
    }
    if (!landLocation.trim()) nextErrors.landLocation = 'Location is required.';
    setLandErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSavingLand(true);
    setLoadError(undefined);
    try {
      const { conduit: updated } = await apiPatch<{ conduit: Conduit }>(`/v1/conduits/${id}/land`, {
        landName: landName.trim(),
        landSizeHectares: Number(landSizeHectares),
        landLocation: landLocation.trim(),
      });
      setConduit(updated);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not save Land Information. Please try again.');
    } finally {
      setIsSavingLand(false);
    }
  }

  async function handleUseCurrentGps() {
    setBoundaryError(undefined);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setBoundaryError('Location permission was not granted.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setLatText(String(position.coords.latitude));
      setLngText(String(position.coords.longitude));
    } catch (err) {
      setBoundaryError(err instanceof Error ? err.message : 'Could not read your current location.');
    }
  }

  async function handleSaveBoundary() {
    if (!boundaryMethod) {
      setBoundaryError('Choose a capture method first.');
      return;
    }
    const lat = Number(latText);
    const lng = Number(lngText);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setBoundaryError('Enter a valid latitude and longitude.');
      return;
    }
    setBoundaryError(undefined);
    setIsSavingBoundary(true);
    try {
      const { conduit: updated } = await apiPatch<{ conduit: Conduit }>(`/v1/conduits/${id}/boundary`, {
        boundaryType: boundaryMethod,
        boundaryCoords: { lat, lng },
      });
      setConduit(updated);
      setBoundarySavedType(boundaryMethod);
    } catch (err) {
      setBoundaryError(err instanceof Error ? err.message : 'Could not save the farm boundary.');
    } finally {
      setIsSavingBoundary(false);
    }
  }

  async function handleSaveExpiry() {
    setExpiryError(undefined);
    setExpirySaved(false);
    setIsSavingExpiry(true);
    try {
      const { conduit: updated } = await apiPost<{ conduit: Conduit }>(`/v1/conduits/${id}/invitation`, {
        expirySetting,
      });
      setConduit(updated);
      setExpirySaved(true);
    } catch (err) {
      setExpiryError(err instanceof Error ? err.message : 'Could not update the invitation expiry.');
    } finally {
      setIsSavingExpiry(false);
    }
  }

  const canEditInvitation = conduit?.status === 'draft';

  return (
    <AppShell title="Edit Conduit" subtitle={conduit?.land_name ?? undefined} showBackButton hideMenu onRefresh={load}>
      {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

      {isLoading ? (
        <Text style={styles.mutedText}>Loading...</Text>
      ) : (
        <>
          <Card>
            <Text style={styles.sectionTitle}>Land Information</Text>
            <TextField
              label="Land Name / Reference"
              value={landName}
              onChangeText={setLandName}
              error={landErrors.landName}
            />
            <TextField
              label="Size in hectares"
              keyboardType="decimal-pad"
              value={landSizeHectares}
              onChangeText={setLandSizeHectares}
              error={landErrors.landSizeHectares}
            />
            <TextField label="Location" value={landLocation} onChangeText={setLandLocation} error={landErrors.landLocation} />
            <Button label="Save Land Information" onPress={handleSaveLand} loading={isSavingLand} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Farm Boundary</Text>
            <Text style={styles.mutedText}>
              {boundarySavedType ? `Currently set: ${boundarySavedType}.` : 'No boundary set yet.'} Optional.
            </Text>
            <View style={styles.methodRow}>
              <MethodChip label="Pin" icon="location-outline" active={boundaryMethod === 'pin'} onPress={() => setBoundaryMethod('pin')} />
              <MethodChip label="Coordinates" icon="navigate-outline" active={boundaryMethod === 'coords'} onPress={() => setBoundaryMethod('coords')} />
              <MethodChip label="Current GPS" icon="locate-outline" active={boundaryMethod === 'gps'} onPress={() => setBoundaryMethod('gps')} />
            </View>
            {boundaryMethod ? (
              <>
                <TextField label="Latitude" keyboardType="numbers-and-punctuation" value={latText} onChangeText={setLatText} />
                <TextField label="Longitude" keyboardType="numbers-and-punctuation" value={lngText} onChangeText={setLngText} />
                {boundaryMethod === 'gps' ? (
                  <Button label="Read Current Location" variant="outline" onPress={handleUseCurrentGps} />
                ) : null}
                {boundaryError ? <Text style={styles.errorText}>{boundaryError}</Text> : null}
                <Button label="Save Farm Boundary" onPress={handleSaveBoundary} loading={isSavingBoundary} />
              </>
            ) : null}
          </Card>

          {canEditInvitation ? (
            <Card>
              <Text style={styles.sectionTitle}>Invitation Expiry</Text>
              <Text style={styles.mutedText}>
                Changing this updates how long your partner has to accept before it expires.
              </Text>
              {EXPIRY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.option, expirySetting === option.value && styles.optionSelected]}
                  onPress={() => setExpirySetting(option.value)}
                >
                  <Ionicons
                    name={expirySetting === option.value ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={expirySetting === option.value ? Colors.accentDark : Colors.muted}
                  />
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>
              ))}
              {expiryError ? <Text style={styles.errorText}>{expiryError}</Text> : null}
              {expirySaved ? <Text style={styles.successText}>Invitation expiry updated.</Text> : null}
              <Button label="Save Invitation Expiry" onPress={handleSaveExpiry} loading={isSavingExpiry} />
            </Card>
          ) : null}

          <Button label="Done" variant="secondary" onPress={() => router.back()} />
        </>
      )}
    </AppShell>
  );
}

function MethodChip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.methodChip, active && styles.methodChipActive]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={active ? '#fff' : Colors.accentDark} />
      <Text style={[styles.methodChipLabel, active && styles.methodChipLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  mutedText: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  successText: {
    color: Colors.success,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  methodChipActive: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accentDark,
  },
  methodChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentDark,
  },
  methodChipLabelActive: {
    color: '#fff',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#EFFAF2',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
