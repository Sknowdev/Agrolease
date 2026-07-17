import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomTabBar } from './home';
import { Button, ButtonRow } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { AppShell } from '../components/ui/AppShell';
import { Colors, Spacing } from '../constants/colors';
import { apiGet } from '../lib/apiClient';

type Conduit = {
  id: string;
  conduit_id: string;
  land_name: string | null;
  status: string;
};

/**
 * My Conduits Screen (Task 2, Step 8) - a pure list, per Amendment 8.
 *
 * No stats, cards, recent activity, pending counts, or commodity
 * prices here - all of that already lives on Home. Search bar renders
 * but has nothing to search yet. Zero-state: "You don't have any
 * conduits yet" + Generate / Enter ID buttons. Populated-list state is
 * Task 3's job - this task only needs the empty state + correct
 * routing target (tapping a Conduit -> Conduit Workspace, not built
 * until Task 3, so nothing here links anywhere yet since the list is
 * always empty for now).
 */
export default function Conduits() {
  const [conduits, setConduits] = useState<Conduit[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiGet<{ conduits: Conduit[] }>('/v1/conduits/mine')
      .then(({ conduits: list }) => setConduits(list))
      .catch(() => setConduits([]));
  }, []);

  const isEmpty = (conduits ?? []).length === 0;

  return (
    <View style={styles.flex}>
      <AppShell title="My Conduits">
        <TextField
          placeholder="Search conduits..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>You don&apos;t have any conduits yet</Text>
            <ButtonRow>
              <Button
                label="Generate"
                onPress={() => router.push('/coming-soon/create')}
              />
              <Button
                label="Enter ID"
                onPress={() => router.push('/coming-soon/create')}
                variant="outline"
              />
            </ButtonRow>
          </View>
        ) : (
          <View style={styles.list}>
            {(conduits ?? []).map((c) => (
              <Text key={c.id} style={styles.listItem}>
                {c.conduit_id} — {c.land_name ?? 'Untitled land'} ({c.status})
              </Text>
            ))}
          </View>
        )}
      </AppShell>

      <BottomTabBar active="conduits" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    color: Colors.muted,
    textAlign: 'center',
  },
  list: {
    gap: Spacing.sm,
  },
  listItem: {
    fontSize: 15,
    color: Colors.text,
  },
});
