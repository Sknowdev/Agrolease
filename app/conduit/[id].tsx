import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Card } from '../../components/ui/Card';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiGet } from '../../lib/apiClient';
import { notify } from '../../lib/confirm';

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
 * Conduit Workspace (Task 3, Step 10 - redesigned per explicit
 * follow-up instruction against the real reference image,
 * app_refrence.png/IMG_1365.jpeg, which was the actual Conduit
 * dashboard mockup - the images looked at earlier in this task were
 * confirmed NOT to be it, so nothing here was guessed).
 *
 * Matches IMG_1365.jpeg's structure exactly:
 *   - Dark green header: Conduit ID + status badge (unchanged from
 *     the original build).
 *   - Partner card: partner name + Trust Score bar + a row of 5 icon
 *     shortcuts (Message, Add Record, Agreement, Land, Security).
 *   - Six colored, icon-chip cards in a 2-up grid: Land Information,
 *     Live Commodity Price, Harvest Records, Invoice, Security
 *     Information, and Add-on (the reference's card literally reads
 *     "Additional Activation" - renamed to "Add-on" here per explicit
 *     instruction: "please don't use the name additional activation
 *     instead call it add-on").
 *   - Activity Timeline as its own full-width card at the bottom.
 *
 * What's real vs. placeholder, and why (no invented data anywhere):
 *   - Land Information is the only card backed by real data today
 *     (conduit.land_size_hectares/land_location, same as before).
 *   - Live Commodity Price stays a "Coming soon" state, identical to
 *     Home's card - per the Engineering Constitution, the mobile app
 *     never calls a prices API directly, and Home already established
 *     this exact pattern.
 *   - Harvest Records, Invoice, Security Information, and Trust Score
 *     have NO backing backend route yet (no harvest_records/invoices/
 *     security_officers/trust_scores read endpoint exists for this
 *     Conduit - confirmed by reading backend/src/routes/conduits.js).
 *     They show an honest zero-state ("No records yet" etc.), not a
 *     fake count, and route to the same kind of Coming Soon stub Home
 *     already uses for deferred features.
 *   - Add-on's two rows (Satellite & Weather, Legal Readiness) mirror
 *     the reference's own "Inactive" + disabled-looking "Activate"
 *     presentation - tapping either opens a Coming Soon stub rather
 *     than pretending to activate something with no backend behind it.
 *   - Activity Timeline is an honest empty state - no activity-log
 *     table/route exists yet.
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
    notify('Copied', 'Conduit ID copied to clipboard.');
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
            <View style={styles.partnerTopRow}>
              <View style={styles.partnerAvatar}>
                <Ionicons name="person" size={20} color={Colors.accentDark} />
              </View>
              <View style={styles.partnerNameBlock}>
                <Text style={styles.partnerRoleLabel}>Partner</Text>
                <Text style={styles.partnerName} numberOfLines={1}>
                  {partner ? partner.display_name ?? partner.profile_id : 'Awaiting partner'}
                </Text>
              </View>
            </View>

            <View style={styles.trustScoreBlock}>
              <View style={styles.trustScoreLabelRow}>
                <Text style={styles.trustScoreLabel}>Trust Score</Text>
                <Text style={styles.trustScoreValueMuted}>Not yet available</Text>
              </View>
              <View style={styles.trustScoreBarTrack}>
                <View style={styles.trustScoreBarFill} />
              </View>
            </View>

            <View style={styles.shortcutIconsRow}>
              <ShortcutIcon
                icon={<Ionicons name="chatbubble-outline" size={18} color={Colors.accentDark} />}
                label="Message"
                onPress={() => router.push('/coming-soon/messages')}
              />
              <ShortcutIcon
                icon={<Ionicons name="add-outline" size={18} color={Colors.accentDark} />}
                label="Add Record"
                onPress={() => router.push('/coming-soon/add-record')}
              />
              <ShortcutIcon
                icon={<Ionicons name="document-text-outline" size={18} color={Colors.accentDark} />}
                label="Agreement"
                onPress={() => router.push('/coming-soon/agreement')}
              />
              <ShortcutIcon
                icon={<Ionicons name="globe-outline" size={18} color={Colors.accentDark} />}
                label="Land"
                onPress={handleEditLand}
              />
              <ShortcutIcon
                icon={<Ionicons name="shield-outline" size={18} color={Colors.accentDark} />}
                label="Security"
                onPress={() => router.push('/coming-soon/link-security')}
              />
            </View>
          </Card>

          <View style={styles.cardGrid}>
            <DashboardCard
              style={styles.gridCard}
              iconBg="#E4F3E8"
              icon={<MaterialCommunityIcons name="sprout-outline" size={18} color={Colors.accentDark} />}
              title="Land Information"
              onPress={handleEditLand}
            >
              <Text style={styles.cardBigValue}>
                {conduit.land_size_hectares ? `${conduit.land_size_hectares} ha` : '-'}
              </Text>
              <Text style={styles.cardSmallMeta} numberOfLines={1}>
                {conduit.land_location ?? 'No location set'}
              </Text>
            </DashboardCard>

            <DashboardCard
              style={styles.gridCard}
              iconBg="#FBEADB"
              icon={<Ionicons name="trending-up" size={18} color="#D98A2B" />}
              title="Live Commodity Price"
            >
              <Text style={styles.cardComingSoon}>Coming soon</Text>
              <Text style={styles.cardSmallMeta}>Real-time prices are on the way.</Text>
            </DashboardCard>

            <DashboardCard
              style={styles.gridCard}
              iconBg="#E3EEFB"
              icon={<Ionicons name="cube-outline" size={18} color="#3B78C4" />}
              title="Harvest Records"
              onPress={() => router.push('/coming-soon/add-record')}
            >
              <Text style={styles.cardBigValue}>0</Text>
              <Text style={styles.cardSmallMeta}>No records yet</Text>
            </DashboardCard>

            <DashboardCard
              style={styles.gridCard}
              iconBg="#EDE6F7"
              icon={<Ionicons name="document-text-outline" size={18} color="#7B5AC2" />}
              title="Invoice"
              onPress={() => router.push('/coming-soon/agreement')}
            >
              <Text style={styles.cardBigValue}>0</Text>
              <Text style={styles.cardSmallMeta}>No pending invoices</Text>
            </DashboardCard>

            <DashboardCard
              style={styles.gridCard}
              iconBg="#E4F3E8"
              icon={<Ionicons name="shield-checkmark-outline" size={18} color={Colors.accentDark} />}
              title="Security Information"
              onPress={() => router.push('/coming-soon/link-security')}
            >
              <Text style={styles.cardBigValue}>0</Text>
              <Text style={styles.cardSmallMeta}>No guards linked</Text>
            </DashboardCard>

            <DashboardCard
              style={styles.gridCard}
              iconBg="#FBEADB"
              icon={<Ionicons name="extension-puzzle-outline" size={18} color="#D98A2B" />}
              title="Add-on"
            >
              <AddOnRow label="Satellite & Weather" />
              <AddOnRow label="Legal Readiness" />
            </DashboardCard>
          </View>

          <Card>
            <View style={styles.timelineHeaderRow}>
              <View style={styles.sectionHeaderIconRow}>
                <Ionicons name="time-outline" size={16} color={Colors.text} />
                <Text style={styles.sectionTitle}>Activity Timeline</Text>
              </View>
            </View>
            <Text style={styles.mutedText}>No activity yet</Text>
          </Card>
        </>
      ) : !loadError ? (
        <Text style={styles.mutedText}>Loading...</Text>
      ) : null}
    </AppShell>
  );
}

function ShortcutIcon({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.shortcutIconItem} onPress={onPress}>
      <View style={styles.shortcutIconCircle}>{icon}</View>
      <Text style={styles.shortcutIconLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function DashboardCard({
  style,
  iconBg,
  icon,
  title,
  onPress,
  children,
}: {
  style?: object;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <Card style={style}>
      <View style={[styles.dashCardIconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.dashCardTitle}>{title}</Text>
      {children}
    </Card>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

function AddOnRow({ label }: { label: string }) {
  return (
    <View style={styles.addOnRow}>
      <View style={styles.addOnTextBlock}>
        <Text style={styles.addOnLabel}>{label}</Text>
        <Text style={styles.addOnStatus}>Inactive</Text>
      </View>
      <Pressable
        style={styles.addOnButton}
        onPress={() => router.push('/coming-soon/add-record')}
      >
        <Text style={styles.addOnButtonText}>Activate</Text>
      </Pressable>
    </View>
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
  },
  sectionHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mutedText: {
    fontSize: 13,
    color: Colors.muted,
  },
  // Partner card
  partnerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4F3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  partnerRoleLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  trustScoreBlock: {
    marginTop: Spacing.md,
  },
  trustScoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trustScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  trustScoreValueMuted: {
    fontSize: 12,
    color: Colors.muted,
  },
  trustScoreBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  trustScoreBarFill: {
    height: '100%',
    width: 0,
    backgroundColor: Colors.accentDark,
    borderRadius: 3,
  },
  shortcutIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  shortcutIconItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  shortcutIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4F3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutIconLabel: {
    fontSize: 10,
    color: Colors.muted,
    textAlign: 'center',
  },
  // 2-up card grid
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  dashCardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  dashCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  cardBigValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSmallMeta: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  cardComingSoon: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.muted,
  },
  // Add-on card
  addOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  addOnTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  addOnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  addOnStatus: {
    fontSize: 10,
    color: Colors.muted,
    marginTop: 1,
  },
  addOnButton: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.accentDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  addOnButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentDark,
  },
  // Activity timeline
  timelineHeaderRow: {
    marginBottom: Spacing.sm,
  },
});
