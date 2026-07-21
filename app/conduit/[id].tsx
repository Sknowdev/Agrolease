import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Card } from '../../components/ui/Card';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';

type Conduit = {
  id: string;
  conduit_id: string;
  land_name: string | null;
  land_location: string | null;
  land_size_hectares: number | null;
  status: string;
  invitation_expiry: string | null;
};

type Partner = {
  id: string;
  display_name: string | null;
  profile_id: string;
} | null;

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#EDE6F7', text: '#7B5AC2' },
  pending_payment: { bg: '#FBEADB', text: '#D98A2B' },
  active: { bg: '#E4F3E8', text: Colors.accentDark },
  expired: { bg: '#FDECEC', text: Colors.danger },
  cancelled: { bg: '#F0F0F0', text: Colors.muted },
};

/**
 * Conduit Workspace - minimal version (Task 3, Step 10).
 *
 * Per Amendment 8, this is the per-relationship dashboard - NOT a
 * repeat of Home's aggregate stats or My Conduits' list. This task's
 * own scope is deliberately narrow: header, partner info, Land
 * Information card with a plain Edit affordance (not the full
 * Conduit Settings `⋮` menu - Amendment 9 explicitly defers that until
 * enough of it has real content behind it), and honest "Coming in
 * Task X" placeholders for Harvest Records, Invoices, Security, Trust
 * Score, Satellite/Legal Readiness, and Activity Timeline - no fake
 * data or invented zero-states for any of them.
 */
export default function ConduitWorkspace() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conduit, setConduit] = useState<Conduit | null>(null);
  const [partner, setPartner] = useState<Partner>(null);
  const [loadError, setLoadError] = useState<string | undefined>();

  const load = useCallback(() => {
    if (!id) return Promise.resolve();
    setLoadError(undefined);
    return apiGet<{ conduit: Conduit; partner: Partner }>(`/v1/conduits/${id}`)
      .then(({ conduit: c, partner: p }) => {
        setConduit(c);
        setPartner(p);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load this Conduit.'));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleCopyId() {
    if (!conduit) return;
    await Clipboard.setStringAsync(conduit.conduit_id);
    Alert.alert('Copied', 'Conduit ID copied to clipboard.');
  }

  function handleEditLand() {
    if (!conduit) return;
    router.push({ pathname: '/conduit/edit-land', params: { id: conduit.id } });
  }

  const statusColors = conduit ? STATUS_COLORS[conduit.status] ?? STATUS_COLORS.draft : STATUS_COLORS.draft;

  return (
    <AppShell
      title={conduit?.land_name ?? 'Conduit'}
      subtitle={conduit?.conduit_id}
      showBackButton
      hideMenu
      onRefresh={load}
    >
      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
          <Text style={styles.errorBannerText}>{loadError}</Text>
        </View>
      ) : null}

      {conduit ? (
        <>
          <Card style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.headerIdBlock}>
                <Text style={styles.conduitIdLabel}>Conduit ID</Text>
                <View style={styles.conduitIdRow}>
                  <Text style={styles.conduitIdValue}>{conduit.conduit_id}</Text>
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color={Colors.accentDark}
                    onPress={handleCopyId}
                    suppressHighlighting
                  />
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                  {STATUS_LABELS[conduit.status] ?? conduit.status}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Partner</Text>
            {partner ? (
              <View style={styles.partnerRow}>
                <View style={styles.partnerAvatar}>
                  <Ionicons name="person" size={18} color={Colors.accentDark} />
                </View>
                <View>
                  <Text style={styles.partnerName}>{partner.display_name ?? partner.profile_id}</Text>
                  <Text style={styles.partnerMeta}>@{partner.profile_id}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.mutedText}>Awaiting partner</Text>
            )}
          </Card>

          <Card>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Land Information</Text>
              <Text style={styles.editLink} onPress={handleEditLand} suppressHighlighting>
                Edit
              </Text>
            </View>
            <InfoRow label="Land Name" value={conduit.land_name ?? '-'} />
            <InfoRow label="Size" value={conduit.land_size_hectares ? `${conduit.land_size_hectares} ha` : '-'} />
            <InfoRow label="Location" value={conduit.land_location ?? '-'} />
          </Card>

          <PlaceholderCard title="Harvest Records" note="Coming in Task 6" icon="cube-outline" />
          <PlaceholderCard title="Invoices" note="Coming in Task 7" icon="document-text-outline" />
          <PlaceholderCard title="Security" note="Coming in Task 5" icon="shield-checkmark-outline" />
          <PlaceholderCard title="Trust Score" note="Coming in Task 9" icon="ribbon-outline" />
          <PlaceholderCard title="Satellite / Legal Readiness" note="Coming in Task 13 / 16" icon="planet-outline" />
          <PlaceholderCard title="Activity Timeline" note="Coming in Task 6+" icon="time-outline" />
        </>
      ) : !loadError ? (
        <Text style={styles.mutedText}>Loading...</Text>
      ) : null}
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PlaceholderCard({
  title,
  note,
  icon,
}: {
  title: string;
  note: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Card style={styles.placeholderCard}>
      <View style={styles.placeholderIconCircle}>
        <Ionicons name={icon} size={18} color={Colors.muted} />
      </View>
      <View style={styles.placeholderTextBlock}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderNote}>{note}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FDECEC',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
  },
  headerCard: {
    backgroundColor: Colors.primaryDark,
    borderWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIdBlock: {
    flex: 1,
    minWidth: 0,
  },
  conduitIdLabel: {
    fontSize: 12,
    color: Colors.mutedOnDark,
  },
  conduitIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  conduitIdValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textOnDark,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLink: {
    color: Colors.accentDark,
    fontWeight: '600',
    fontSize: 13,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E4F3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  partnerMeta: {
    fontSize: 12,
    color: Colors.muted,
  },
  mutedText: {
    fontSize: 13,
    color: Colors.muted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.muted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    opacity: 0.75,
  },
  placeholderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholderNote: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
});
