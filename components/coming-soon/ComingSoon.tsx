import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../../constants/colors';

/**
 * Shared bare "Coming soon" stub - per the Constitution's "Coming Soon
 * instead of hidden" product rule: every deferred feature is visible,
 * never a dead end with no destination. Used by Home's Create/Messages
 * tabs and Browse Listings shortcut (Task 2 only needs these to route
 * correctly, not to be functional - Tasks 3/10/17 build the real thing).
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
  },
});
