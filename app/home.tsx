import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/ui/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Colors, Spacing } from '../constants/colors';
import { apiGet } from '../lib/apiClient';

type HomeSummary = {
  myConduitsCount: number;
  pendingCount: number;
  recentActivityCount: number;
  pendingInvitationsCount: number;
};

/**
 * Home Screen (Task 2, Step 7) - real zero-state, per Amendment 8.
 *
 * Aggregate overview: My Conduits / Pending / Recent Activity /
 * Pending Invitations cards (all genuinely 0 for a brand-new profile,
 * not hardcoded - see GET /v1/home/summary), Generate Conduit ID CTA
 * (routes correctly, non-functional pending Task 3), a general/
 * browsable Live Commodity Prices widget, Link Security and Browse
 * Listings shortcuts, and a bottom tab bar where Create/Messages route
 * to bare "Coming soon" stubs (Tasks 3 and 10 build these out for real).
 */
export default function Home() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);

  useEffect(() => {
    apiGet<HomeSummary>('/v1/home/summary')
      .then(setSummary)
      .catch(() => setSummary({ myConduitsCount: 0, pendingCount: 0, recentActivityCount: 0, pendingInvitationsCount: 0 }));
  }, []);

  const s = summary ?? { myConduitsCount: 0, pendingCount: 0, recentActivityCount: 0, pendingInvitationsCount: 0 };

  return (
    <View style={styles.flex}>
      <AppShell title="Welcome" subtitle="What are you doing today?">
        <View style={styles.statGrid}>
          <StatCard label="My Conduits" value={s.myConduitsCount} />
          <StatCard label="Pending" value={s.pendingCount} />
          <StatCard label="Recent Activity" value={s.recentActivityCount} />
          <StatCard label="Pending Invitations" value={s.pendingInvitationsCount} />
        </View>

        <Button
          label="Generate Conduit ID"
          onPress={() => router.push('/coming-soon/create')}
        />

        <Card>
          <Text style={styles.sectionTitle}>Live Commodity Prices</Text>
          <Text style={styles.mutedText}>
            Browse current reference prices by country and crop. (Widget wiring is a later task -
            this placeholder confirms the section exists on Home, per Amendment 8.)
          </Text>
        </Card>

        <View style={styles.shortcutRow}>
          <Button
            label="Link Security"
            onPress={() => router.push('/security/access')}
            variant="outline"
          />
          <Button
            label="Browse Listings"
            onPress={() => router.push('/coming-soon/browse-listings')}
            variant="outline"
          />
        </View>
      </AppShell>

      <BottomTabBar active="home" />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export function BottomTabBar({ active }: { active: 'home' | 'conduits' | 'create' | 'messages' }) {
  const tabs: { key: typeof active; label: string; path: string }[] = [
    { key: 'home', label: 'Home', path: '/home' },
    { key: 'conduits', label: 'My Conduits', path: '/conduits' },
    { key: 'create', label: 'Create', path: '/coming-soon/create' },
    { key: 'messages', label: 'Messages', path: '/coming-soon/messages' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable key={tab.key} style={styles.tabItem} onPress={() => router.push(tab.path as never)}>
          <Text style={[styles.tabLabel, active === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  mutedText: {
    fontSize: 13,
    color: Colors.muted,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
    paddingVertical: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  tabLabelActive: {
    color: Colors.accentDark,
    fontWeight: '700',
  },
});
