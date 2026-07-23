import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';
import { notify } from '../../lib/confirm';

type Conduit = {
  id: string;
  conduit_id: string;
  land_name: string | null;
  invitation_expiry: string | null;
  invitation_expiry_setting: string | null;
};

function formatCountdown(expiresAt: string | null): string {
  if (!expiresAt) return 'Never expires';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * Conduit Creation - Generated ID/Share screen (Task 3, Step 6).
 *
 * Shows the generated Conduit ID with Copy and Share actions, and a
 * live countdown based on the chosen expiry - per the brief.
 * `conduits.status` is already 'draft' at this point (set at creation
 * in POST /v1/conduits) - this screen doesn't change status itself, it
 * only displays the invitation that /v1/conduits/:id/invitation just
 * created.
 */
export default function ConduitGenerated() {
  const { conduitId } = useLocalSearchParams<{ conduitId: string }>();
  const [conduit, setConduit] = useState<Conduit | null>(null);
  const [countdown, setCountdown] = useState('');
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(() => {
    if (!conduitId) return Promise.resolve();
    setError(undefined);
    return apiGet<{ conduit: Conduit }>(`/v1/conduits/${conduitId}`)
      .then(({ conduit: c }) => setConduit(c))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your Conduit.'));
  }, [conduitId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (!conduit) return;
    setCountdown(formatCountdown(conduit.invitation_expiry));
    const interval = setInterval(() => setCountdown(formatCountdown(conduit.invitation_expiry)), 30000);
    return () => clearInterval(interval);
  }, [conduit]);

  async function handleCopy() {
    if (!conduit) return;
    await Clipboard.setStringAsync(conduit.conduit_id);
    notify('Copied', 'Conduit ID copied to clipboard.');
  }

  async function handleShare() {
    if (!conduit) return;
    try {
      await Share.share({
        message: `Join my Conduit on AgroLease. Enter this Conduit ID in the app: ${conduit.conduit_id}\nagrolease://conduit/${conduit.conduit_id}`,
      });
    } catch {
      // Share sheet dismissal/cancellation is not an error worth surfacing.
    }
  }

  return (
    <AppShell title="Create a Conduit" subtitle="Invitation ready" showBackButton hideMenu>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Card style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={28} color="#fff" />
        </View>
        <Text style={styles.title}>{conduit?.land_name ?? 'Your Conduit'}</Text>
        <Text style={styles.conduitId}>{conduit?.conduit_id ?? '...'}</Text>
        <View style={styles.countdownRow}>
          <Ionicons name="time-outline" size={14} color={Colors.muted} />
          <Text style={styles.countdownText}>{countdown || 'Loading...'}</Text>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Button label="Copy" icon={<Ionicons name="copy-outline" size={16} color={Colors.accentDark} />} variant="outline" onPress={handleCopy} />
          </View>
          <View style={styles.actionButton}>
            <Button label="Share" icon={<Ionicons name="share-outline" size={16} color="#fff" />} onPress={handleShare} />
          </View>
        </View>
      </Card>

      <Text style={styles.helperText}>
        Share this Conduit ID with your partner. Once they enter it and accept, this Conduit moves to
        Pending Payment.
      </Text>

      <Button label="Go to My Conduits" variant="secondary" onPress={() => router.replace('/conduits')} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 15,
    color: Colors.muted,
    marginBottom: 4,
  },
  conduitId: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  countdownText: {
    fontSize: 13,
    color: Colors.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: Spacing.sm,
    borderRadius: Radius.sm,
  },
});
