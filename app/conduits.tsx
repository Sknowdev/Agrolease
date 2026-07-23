import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomTabBar } from './home';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { AppShell } from '../components/ui/AppShell';
import { Colors, Radius, Spacing } from '../constants/colors';
import { apiDelete, apiGet, apiPost } from '../lib/apiClient';
import { confirmAction, notify } from '../lib/confirm';

type Conduit = {
  id: string;
  conduit_id: string;
  land_name: string | null;
  land_location: string | null;
  status: string;
  invitation_expiry: string | null;
  isAwaitingPartner: boolean;
  partner: { id: string; display_name: string | null; profile_id: string } | null;
};

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

function formatCountdown(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const totalHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (totalHours >= 24) return `${Math.floor(totalHours / 24)}d left`;
  if (totalHours >= 1) return `${totalHours}h left`;
  return `${Math.max(1, Math.floor(diffMs / 60000))}m left`;
}

/**
 * My Conduits Screen (Task 2's zero-state, upgraded to real data by
 * Task 3, Steps 1 & 8) - a pure list, per Amendment 8. No stats, cards,
 * recent activity, pending counts, or commodity prices here - all of
 * that lives on Home. Search filters by land label, Conduit ID, or
 * partner name (client-side over the already-loaded list - the list
 * size per user is expected to stay small for the foreseeable future,
 * a dedicated backend search endpoint isn't warranted yet). Tapping a
 * row goes straight into that Conduit's Workspace.
 */
export default function Conduits() {
  const [conduits, setConduits] = useState<Conduit[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState<string | undefined>();

  const loadConduits = useCallback(() => {
    setLoadError(undefined);
    return apiGet<{ conduits: Conduit[] }>('/v1/conduits/mine')
      .then(({ conduits: list }) => setConduits(list))
      .catch((err) => {
        setConduits([]);
        setLoadError(err instanceof Error ? err.message : 'Could not load your conduits.');
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConduits();
    }, [loadConduits])
  );

  const filtered = useMemo(() => {
    const list = conduits ?? [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((c) => {
      return (
        (c.land_name ?? '').toLowerCase().includes(query) ||
        c.conduit_id.toLowerCase().includes(query) ||
        (c.partner?.display_name ?? '').toLowerCase().includes(query) ||
        (c.partner?.profile_id ?? '').toLowerCase().includes(query)
      );
    });
  }, [conduits, searchQuery]);

  const isEmpty = (conduits ?? []).length === 0;

  return (
    <View style={styles.flex}>
      <AppShell title="My Conduits" bottomInset={80} onRefresh={loadConduits} hideMenu>
        {loadError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
            <Text style={styles.errorBannerText}>{loadError} - open the menu and tap Refresh.</Text>
          </View>
        ) : null}
        <TextField
          placeholder="Search conduits..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>You don&apos;t have any conduits yet</Text>
            <View style={styles.emptyActions}>
              <Button
                label="Generate"
                onPress={() => router.push('/conduit/side')}
              />
              <Button
                label="Enter ID"
                onPress={() => router.push('/conduit/accept')}
                variant="outline"
              />
            </View>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((c) => (
              <ConduitRow key={c.id} conduit={c} onRegenerated={loadConduits} />
            ))}
            {filtered.length === 0 ? (
              <Text style={styles.emptyTitle}>No conduits match your search.</Text>
            ) : null}
          </View>
        )}
      </AppShell>

      <BottomTabBar active="conduits" />
    </View>
  );
}

function ConduitRow({ conduit, onRegenerated }: { conduit: Conduit; onRegenerated: () => void }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const statusColors = STATUS_COLORS[conduit.status] ?? STATUS_COLORS.draft;
  const partnerLabel = conduit.isAwaitingPartner
    ? `Waiting for Partner - ${formatCountdown(conduit.invitation_expiry)}`
    : conduit.partner?.display_name ?? conduit.partner?.profile_id ?? 'Partner';

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      await apiPost(`/v1/conduits/${conduit.id}/invitation`, { regenerateId: true });
      onRegenerated();
    } catch (err) {
      notify('Could not regenerate', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleEdit() {
    setIsMenuOpen(false);
    router.push({ pathname: '/conduit/edit', params: { id: conduit.id } });
  }

  function handleDeletePress() {
    setIsMenuOpen(false);
    confirmAction(
      'Delete Conduit',
      `This permanently deletes "${conduit.land_name ?? conduit.conduit_id}". This cannot be undone.`,
      confirmDelete,
      { confirmLabel: 'Delete' }
    );
  }

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await apiDelete(`/v1/conduits/${conduit.id}`);
      onRegenerated();
    } catch (err) {
      notify('Could not delete', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Pressable
      onPress={() =>
        conduit.status === 'expired'
          ? undefined
          : router.push({ pathname: '/conduit/[id]', params: { id: conduit.id } })
      }
    >
      <Card style={styles.row}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {conduit.land_name ?? 'Untitled land'}
          </Text>
          <View style={styles.rowTopRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                {STATUS_LABELS[conduit.status] ?? conduit.status}
              </Text>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                setIsMenuOpen(true);
              }}
              hitSlop={8}
              style={styles.rowMenuButton}
              accessibilityLabel="Conduit options"
            >
              {isDeleting ? (
                <Ionicons name="hourglass-outline" size={18} color={Colors.muted} />
              ) : (
                <Ionicons name="ellipsis-vertical" size={18} color={Colors.muted} />
              )}
            </Pressable>
          </View>
        </View>
        <Text style={styles.rowMeta}>{conduit.conduit_id}</Text>
        <Text style={styles.rowPartner} numberOfLines={1}>
          {partnerLabel}
        </Text>
        {conduit.status === 'expired' ? (
          <Button
            label="Regenerate Invitation"
            variant="outline"
            loading={isRegenerating}
            onPress={handleRegenerate}
          />
        ) : null}
      </Card>

      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <Pressable style={styles.rowMenuOverlay} onPress={() => setIsMenuOpen(false)}>
          <View style={styles.rowMenuPanel}>
            <Pressable style={styles.rowMenuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={18} color={Colors.text} />
              <Text style={styles.rowMenuItemLabel}>Edit Conduit</Text>
            </Pressable>
            <View style={styles.rowMenuDivider} />
            <Pressable style={styles.rowMenuItem} onPress={handleDeletePress}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              <Text style={[styles.rowMenuItemLabel, { color: Colors.danger }]}>Delete Conduit</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: Spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emptyActions: {
    width: '100%',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    color: Colors.muted,
    textAlign: 'center',
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rowMenuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowMenuPanel: {
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    boxShadow: '0px 8px 24px rgba(0,0,0,0.18)',
    elevation: 8,
  },
  rowMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  rowMenuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rowMenuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 12,
    color: Colors.muted,
  },
  rowPartner: {
    fontSize: 13,
    color: Colors.text,
  },
});

