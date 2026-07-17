import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../../constants/colors';

/**
 * Shared main-app shell (green header + scrollable white body) used by
 * every post-auth screen: Welcome, Home, My Conduits, Profile, Edit
 * Profile. Matches app_refrence.png's dashboard visual language -
 * distinct from AuthShell's dark full-bleed card used pre-auth.
 */
export function AppShell({
  title,
  subtitle,
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {headerRight}
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.textOnDark,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.mutedOnDark,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
});
