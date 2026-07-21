import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { Colors, Spacing } from '../../constants/colors';
import { ApiClientError, apiGet, apiPost } from '../../lib/apiClient';

type ConduitPreview = {
  id: string;
  conduit_id: string;
  land_name: string | null;
  land_location: string | null;
  land_size_hectares: number | null;
  invitation_expiry: string | null;
};

/**
 * Accept Invitation screen (Task 3, Step 7).
 *
 * Reached via "Enter ID" on My Conduits, or the agrolease://conduit/{id}
 * deep link (see app/_layout.tsx), which pre-fills the code the same
 * way Task 2's Security Access screen pre-fills its access code param.
 * Validates existence/draft-status/expiry via a lookup call before
 * showing an Accept button, then actually accepts via a second call -
 * this two-step shape mirrors Security Access -> Security Details
 * (verify first, then commit), so a typo is caught before commitment.
 */
export default function ConduitAccept() {
  const params = useLocalSearchParams<{ conduitId?: string }>();
  const [codeInput, setCodeInput] = useState(params.conduitId ?? '');
  const [preview, setPreview] = useState<ConduitPreview | null>(null);
  const [lookupError, setLookupError] = useState<string | undefined>();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (params.conduitId) {
      setCodeInput(params.conduitId);
      void handleLookup(params.conduitId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.conduitId]);

  async function handleLookup(codeOverride?: string) {
    const code = (codeOverride ?? codeInput).trim();
    if (!code) {
      setLookupError('Enter a Conduit ID.');
      return;
    }
    setLookupError(undefined);
    setPreview(null);
    setIsLookingUp(true);
    try {
      const { conduit } = await apiGet<{ conduit: ConduitPreview }>(
        `/v1/conduits/lookup/${encodeURIComponent(code)}`
      );
      setPreview(conduit);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'invitation_expired') {
        setLookupError('Invitation expired. Ask your partner to regenerate.');
      } else {
        setLookupError(err instanceof Error ? err.message : 'Could not find that Conduit ID.');
      }
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleAccept() {
    if (!preview) return;
    setIsAccepting(true);
    setLookupError(undefined);
    try {
      const { conduit } = await apiPost<{ conduit: { id: string } }>(
        `/v1/conduits/lookup/${encodeURIComponent(preview.conduit_id)}/accept`
      );
      router.replace({ pathname: '/conduit/[id]', params: { id: conduit.id } });
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Could not accept this invitation.');
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <AppShell title="Enter Conduit ID" subtitle="Accept an invitation" showBackButton hideMenu>
      <Text style={styles.heading}>Enter the Conduit ID your partner shared with you</Text>

      <TextField
        placeholder="e.g. CON-NG-000123"
        autoCapitalize="characters"
        value={codeInput}
        onChangeText={setCodeInput}
        error={lookupError}
      />

      <Button label="Look Up" onPress={() => handleLookup()} loading={isLookingUp} variant="outline" />

      {preview ? (
        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>{preview.land_name ?? 'Untitled land'}</Text>
          <Text style={styles.previewMeta}>{preview.conduit_id}</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Location</Text>
            <Text style={styles.previewValue}>{preview.land_location ?? '-'}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Size</Text>
            <Text style={styles.previewValue}>
              {preview.land_size_hectares ? `${preview.land_size_hectares} ha` : '-'}
            </Text>
          </View>

          <Button label="Accept Invitation" onPress={handleAccept} loading={isAccepting} />
        </Card>
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  previewCard: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  previewMeta: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 13,
    color: Colors.muted,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
});
