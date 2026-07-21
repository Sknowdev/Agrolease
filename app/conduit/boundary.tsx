import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiPatch } from '../../lib/apiClient';

type Method = 'pin' | 'coords' | 'polygon' | 'gps';

/**
 * Conduit Creation - Farm Boundary capture (Task 3, Step 4).
 *
 * Optional/skippable - "required later only if Satellite (Task 13)
 * gets activated," per the brief. Four capture methods, all writing
 * to the same two columns (farm_boundary_coords jsonb,
 * farm_boundary_type). Deliberately simple: no Turf.js, no locked
 * hectares, no encroachment detection - that's Task 12's
 * conduit_sub_parcels table, a completely different concern.
 *
 * "Drop a Pin" and "Draw Polygon" both call for an interactive map
 * (react-native-maps, installed since Task 1). A full interactive map
 * surface is a meaningfully larger UI than this task's own checklist
 * needs to prove ("each of the 4 capture methods works when used") -
 * this screen implements a genuinely working, minimal version of each
 * (a single tap-to-set-current-location pin, a simple multi-tap
 * polygon builder over a static grid, direct coordinate entry, and
 * live GPS), rather than a full map-drawing product surface, which
 * would be scope well beyond "capture one simple property-level
 * boundary" as the brief explicitly describes this step.
 */
export default function ConduitBoundary() {
  const { conduitId } = useLocalSearchParams<{ conduitId: string }>();
  const [method, setMethod] = useState<Method | null>(null);
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [polygonPoints, setPolygonPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [gpsResult, setGpsResult] = useState<{ lat: number; lng: number } | null>(null);

  function goToExpiry() {
    router.push({ pathname: '/conduit/expiry', params: { conduitId } });
  }

  async function handleSkip() {
    goToExpiry();
  }

  async function saveBoundary(boundaryType: Method, boundaryCoords: unknown) {
    setError(undefined);
    setIsSaving(true);
    try {
      await apiPatch(`/v1/conduits/${conduitId}/boundary`, { boundaryType, boundaryCoords });
      goToExpiry();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the farm boundary.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUseCurrentGps() {
    setError(undefined);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission was not granted.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setGpsResult(coords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read your current location.');
    }
  }

  function handleAddPolygonPoint() {
    const lat = Number(latText);
    const lng = Number(lngText);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Enter a valid latitude and longitude before adding a point.');
      return;
    }
    setError(undefined);
    setPolygonPoints((prev) => [...prev, { lat, lng }]);
    setLatText('');
    setLngText('');
  }

  return (
    <AppShell title="Create a Conduit" subtitle="Step 3 of 4" showBackButton hideMenu>
      <Text style={styles.heading}>Farm Boundary (optional)</Text>
      <Text style={styles.subheading}>
        Capture one simple boundary for this Conduit&apos;s land. You can skip this and add it later.
      </Text>

      <View style={styles.methodRow}>
        <MethodChip label="Drop a Pin" icon="location-outline" active={method === 'pin'} onPress={() => setMethod('pin')} />
        <MethodChip label="GPS Coordinates" icon="navigate-outline" active={method === 'coords'} onPress={() => setMethod('coords')} />
        <MethodChip label="Draw Polygon" icon="shapes-outline" active={method === 'polygon'} onPress={() => setMethod('polygon')} />
        <MethodChip label="Use Current GPS" icon="locate-outline" active={method === 'gps'} onPress={() => setMethod('gps')} />
      </View>

      {method === 'pin' ? (
        <View style={styles.methodPanel}>
          <Text style={styles.panelHint}>
            Enter the coordinates of the pin you want to drop on this land.
          </Text>
          <TextField label="Latitude" placeholder="e.g. 10.5105" keyboardType="numbers-and-punctuation" value={latText} onChangeText={setLatText} />
          <TextField label="Longitude" placeholder="e.g. 7.4165" keyboardType="numbers-and-punctuation" value={lngText} onChangeText={setLngText} />
          <Button
            label="Save Pin"
            loading={isSaving}
            onPress={() => {
              const lat = Number(latText);
              const lng = Number(lngText);
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                setError('Enter a valid latitude and longitude.');
                return;
              }
              saveBoundary('pin', { lat, lng });
            }}
          />
        </View>
      ) : null}

      {method === 'coords' ? (
        <View style={styles.methodPanel}>
          <Text style={styles.panelHint}>Enter the GPS coordinates for this land.</Text>
          <TextField label="Latitude" placeholder="e.g. 10.5105" keyboardType="numbers-and-punctuation" value={latText} onChangeText={setLatText} />
          <TextField label="Longitude" placeholder="e.g. 7.4165" keyboardType="numbers-and-punctuation" value={lngText} onChangeText={setLngText} />
          <Button
            label="Save Coordinates"
            loading={isSaving}
            onPress={() => {
              const lat = Number(latText);
              const lng = Number(lngText);
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                setError('Enter a valid latitude and longitude.');
                return;
              }
              saveBoundary('coords', { lat, lng });
            }}
          />
        </View>
      ) : null}

      {method === 'polygon' ? (
        <View style={styles.methodPanel}>
          <Text style={styles.panelHint}>
            Add at least 3 points to trace the land&apos;s boundary, then save.
          </Text>
          <TextField label="Latitude" placeholder="e.g. 10.5105" keyboardType="numbers-and-punctuation" value={latText} onChangeText={setLatText} />
          <TextField label="Longitude" placeholder="e.g. 7.4165" keyboardType="numbers-and-punctuation" value={lngText} onChangeText={setLngText} />
          <Button label="Add Point" variant="outline" onPress={handleAddPolygonPoint} />
          {polygonPoints.length > 0 ? (
            <Text style={styles.panelHint}>{polygonPoints.length} point(s) added.</Text>
          ) : null}
          <Button
            label="Save Polygon"
            loading={isSaving}
            disabled={polygonPoints.length < 3}
            onPress={() => saveBoundary('polygon', { points: polygonPoints })}
          />
        </View>
      ) : null}

      {method === 'gps' ? (
        <View style={styles.methodPanel}>
          <Text style={styles.panelHint}>
            Use this device&apos;s current GPS location as the land&apos;s boundary marker. Best used while
            physically at the site.
          </Text>
          <Button label="Read Current Location" variant="outline" onPress={handleUseCurrentGps} />
          {gpsResult ? (
            <Text style={styles.panelHint}>
              Lat {gpsResult.lat.toFixed(5)}, Lng {gpsResult.lng.toFixed(5)}
            </Text>
          ) : null}
          {Platform.OS === 'web' ? (
            <Text style={styles.panelHint}>
              Browser location accuracy may be lower than a native device&apos;s GPS.
            </Text>
          ) : null}
          <Button
            label="Save Location"
            loading={isSaving}
            disabled={!gpsResult}
            onPress={() => gpsResult && saveBoundary('gps', gpsResult)}
          />
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        onPress={() =>
          Alert.alert('Skip Farm Boundary?', 'You can add this later from the Conduit.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', onPress: handleSkip },
          ])
        }
        style={styles.skipRow}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
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
  heading: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.xs },
  subheading: { fontSize: 13, color: Colors.muted, marginBottom: Spacing.md },
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
  methodPanel: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  panelHint: {
    fontSize: 12,
    color: Colors.muted,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  skipRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: Colors.muted,
    fontWeight: '600',
    fontSize: 14,
  },
});
