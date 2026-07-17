import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { Colors, Radius, Spacing } from '../../constants/colors';

/** Shared white rounded card - used for every info/summary card on Home, Profile, etc. */
export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
