import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/ui/AppShell';
import { Card } from '../components/ui/Card';
import { Colors, Radius, Spacing } from '../constants/colors';
import { apiGet } from '../lib/apiClient';

type HomeSummary = {
  myConduitsCount: number;
  pendingCount: number;
  recentActivityCount: number;
  pendingInvitationsCount: number;
};

const ZERO_SUMMARY: HomeSummary = {
  myConduitsCount: 0,
  pendingCount: 0,
  recentActivityCount: 0,
  pendingInvitationsCount: 0,
};

/**
 * Home Screen (Task 2, Step 7) - real zero-state, per Amendment 8.
 *
 * Matches app_refrence.png's Home mockup (EA7D67AE-...png / IMG_1365):
 * green header with avatar + hamburger, greeting centered (AppShell),
 * a 2x2 stat grid with colored icon chips, "Generate Conduit ID" as
 * its own dark green card, a Live Commodity Prices card, Link
 * Security / Browse Listings as full-width row cards, and a floating
 * icon-only bottom tab bar.
 *
 * Live Commodity Prices is a Coming Soon state, not hardcoded data -
 * per the Engineering Constitution, the mobile app never calls
 * Supabase or the public price website's API directly (both would
 * bypass the Fastify backend). Real per-country/crop pricing is wired
 * through the mobile backend in Task 14/15, not here.
 *
 * Link Security routes to a dedicated Coming Soon stub, not into
 * Security Access (app/security/access.tsx) - that screen is for
 * someone *entering* a code they were given; this shortcut is for
 * *generating* one to hand to a guard, which is Task 5's job.
 */
export default function Home() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();

  const loadSummary = useCallback(() => {
    setLoadError(undefined);
    return apiGet<HomeSummary>('/v1/home/summary')
      .then(setSummary)
      .catch((err) => {
        setSummary(ZERO_SUMMARY);
        setLoadError(err instanceof Error ? err.message : 'Could not load your data.');
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary])
  );

  const s = summary ?? ZERO_SUMMARY;

  return (
    <View style={styles.flex}>
      <AppShell
        title="Welcome"
        subtitle="What are you doing today?"
        bottomInset={80}
        onRefresh={loadSummary}
      >
        {loadError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
            <Text style={styles.errorBannerText}>{loadError} - open the menu and tap Refresh.</Text>
          </View>
        ) : null}
        <View style={styles.statGrid}>
          <StatCard
            label="My Conduits"
            value={s.myConduitsCount}
            subtitle="Active conduits"
            iconBg="#E4F3E8"
            iconColor={Colors.accentDark}
            icon={<MaterialCommunityIcons name="layers-outline" size={18} color={Colors.accentDark} />}
            onPress={() => router.push('/conduits')}
          />
          <StatCard
            label="Pending"
            value={s.pendingCount}
            subtitle="Awaiting action"
            iconBg="#FBEADB"
            iconColor="#D98A2B"
            icon={<Ionicons name="time-outline" size={18} color="#D98A2B" />}
          />
          <StatCard
            label="Recent Activity"
            value={s.recentActivityCount}
            subtitle={s.recentActivityCount > 0 ? 'Tap to view' : 'No recent activity'}
            iconBg="#E3EEFB"
            iconColor="#3B78C4"
            icon={<Ionicons name="pulse-outline" size={18} color="#3B78C4" />}
            onPress={() => router.push('/recent-activity')}
          />
          <StatCard
            label="Pending Invitations"
            value={s.pendingInvitationsCount}
            subtitle="Invitations to respond"
            iconBg="#EDE6F7"
            iconColor="#7B5AC2"
            icon={<Ionicons name="mail-outline" size={18} color="#7B5AC2" />}
          />
        </View>

        <Pressable
          style={styles.generateCard}
          onPress={() => router.push('/coming-soon/create')}
        >
          <View style={styles.generateIconCircle}>
            <Ionicons name="add" size={20} color="#fff" />
          </View>
          <View style={styles.generateTextBlock}>
            <Text style={styles.generateTitle}>Generate Conduit ID</Text>
            <Text style={styles.generateSubtitle}>Create a new conduit and invite your partner</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <Card>
          <View style={styles.widgetHeaderRow}>
            <View style={styles.widgetIconCircle}>
              <Ionicons name="trending-up" size={18} color="#D98A2B" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Live Commodity Prices</Text>
              <Text style={styles.mutedText}>Track real-time market prices</Text>
            </View>
          </View>

          <View style={styles.comingSoonBlock}>
            <Ionicons name="time-outline" size={22} color={Colors.muted} />
            <Text style={styles.comingSoonText}>Coming soon</Text>
            <Text style={styles.comingSoonSubtext}>
              Real-time prices by country and crop are on the way.
            </Text>
          </View>
        </Card>

        <ShortcutRow
          icon={<Ionicons name="shield-checkmark-outline" size={20} color={Colors.accentDark} />}
          title="Link Security"
          subtitle="Link and manage security officers for your conduits"
          onPress={() => router.push('/coming-soon/link-security')}
        />
        <ShortcutRow
          icon={<MaterialCommunityIcons name="storefront-outline" size={20} color={Colors.accentDark} />}
          title="Browse Listings"
          subtitle="Discover land, farm operators and management services"
          onPress={() => router.push('/coming-soon/browse-listings')}
        />
      </AppShell>

      <BottomTabBar active="home" />
    </View>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  iconBg,
  icon,
  onPress,
}: {
  label: string;
  value: number;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) {
  const card = (
    <Card style={styles.statCardInner}>
      <View style={[styles.statIconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable style={styles.statCard} onPress={onPress}>
        {card}
      </Pressable>
    );
  }

  return <View style={styles.statCard}>{card}</View>;
}

function ShortcutRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.shortcutRow} onPress={onPress}>
      <View style={styles.shortcutIconCircle}>{icon}</View>
      <View style={styles.shortcutTextBlock}>
        <Text style={styles.shortcutTitle}>{title}</Text>
        <Text style={styles.shortcutSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
    </Pressable>
  );
}

export function BottomTabBar({ active }: { active: 'home' | 'conduits' | 'create' | 'messages' }) {
  const tabs: {
    key: typeof active;
    icon: (color: string, isActive: boolean) => React.ReactNode;
    path: string;
  }[] = [
    {
      key: 'home',
      icon: (c, isActive) => <Ionicons name={isActive ? 'home' : 'home-outline'} size={22} color={c} />,
      path: '/home',
    },
    {
      key: 'conduits',
      icon: (c, isActive) => (
        <MaterialCommunityIcons name={isActive ? 'view-grid' : 'view-grid-outline'} size={22} color={c} />
      ),
      path: '/conduits',
    },
    { key: 'create', icon: () => null, path: '/coming-soon/create' },
    {
      key: 'messages',
      icon: (c, isActive) => (
        <Ionicons name={isActive ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={22} color={c} />
      ),
      path: '/coming-soon/messages',
    },
  ];

  return (
    // Genuinely floating: a transparent wrapper with margin on every
    // side (not padding flush to the screen edge), so the green
    // background is visible around the pill - matching the reference's
    // floating tab bar rather than a bar merged into the bottom edge.
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        {tabs.map((tab) =>
          tab.key === 'create' ? (
            <Pressable key={tab.key} style={styles.tabItem} onPress={() => router.push(tab.path as never)}>
              <View style={styles.createButton}>
                <Ionicons name="add" size={24} color="#fff" />
              </View>
            </Pressable>
          ) : (
            <Pressable key={tab.key} style={styles.tabItem} onPress={() => router.push(tab.path as never)}>
              <View style={[styles.tabIconWrap, active === tab.key && styles.tabIconWrapActive]}>
                {tab.icon(active === tab.key ? Colors.accentDark : Colors.muted, active === tab.key)}
              </View>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  statCardInner: {
    width: '100%',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  generateCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  generateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  generateTitle: {
    color: Colors.textOnDark,
    fontWeight: '700',
    fontSize: 15,
  },
  generateSubtitle: {
    color: Colors.mutedOnDark,
    fontSize: 12,
    marginTop: 2,
  },
  widgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  widgetIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBEADB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  mutedText: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  comingSoonBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  comingSoonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  comingSoonSubtext: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
  },
  shortcutRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shortcutIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  shortcutSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: 'transparent',
    // Style-based pointerEvents (not the deprecated `pointerEvents`
    // prop) - lets touches pass through the transparent margin around
    // the pill to whatever's underneath, while the pill itself still
    // catches its own taps (each child Pressable sets its own hit area).
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    // React Native Web deprecated the shadow* style props in favor of
    // the CSS-standard boxShadow shorthand (console warning: '"shadow*"
    // style props are deprecated. Use "boxShadow"'). elevation still
    // covers native Android; boxShadow covers web and iOS.
    boxShadow: '0px 4px 12px rgba(0,0,0,0.12)',
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: '#E4F3E8',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
