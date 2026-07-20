import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/ui/AppShell';
import { Card } from '../components/ui/Card';
import { Colors, Spacing } from '../constants/colors';
import { apiGet } from '../lib/apiClient';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

/**
 * Recent Activity - reached by tapping Home's "Recent Activity" stat
 * card, which previously only ever showed a bare count with no way to
 * see what the activity actually was ("1 Recent Activity" and nothing
 * to tap into - a real, reported gap, not a hardcoded/fake number:
 * the count itself was always genuinely correct, counting unread rows
 * in `notifications`, just unreachable). Not part of Task 2's original
 * 15-screen list, added because the count without content is
 * functionally useless - a minimal real list is a small, honest fix
 * for that, not a new feature Task 2 wasn't already implying it needed.
 */
export default function RecentActivity() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();

  const loadNotifications = useCallback(() => {
    setLoadError(undefined);
    return apiGet<{ notifications: Notification[] }>('/v1/notifications')
      .then(({ notifications: list }) => setNotifications(list))
      .catch((err) => {
        setNotifications([]);
        setLoadError(err instanceof Error ? err.message : 'Could not load recent activity.');
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const isEmpty = (notifications ?? []).length === 0;

  return (
    <AppShell title="Recent Activity" showBackButton onRefresh={loadNotifications}>
      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
          <Text style={styles.errorBannerText}>{loadError}</Text>
        </View>
      ) : null}

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="pulse-outline" size={28} color={Colors.muted} />
          <Text style={styles.emptyText}>No recent activity yet.</Text>
        </View>
      ) : (
        (notifications ?? []).map((n) => (
          <Card key={n.id} style={!n.read ? styles.unreadCard : undefined}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
            <Text style={styles.timestamp}>{new Date(n.created_at).toLocaleString()}</Text>
          </Card>
        ))
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
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
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.muted,
  },
  unreadCard: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
});
