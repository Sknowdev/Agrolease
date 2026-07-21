import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Colors, Radius, Spacing } from '../../constants/colors';

type Side = 'land_owner' | 'farm_operator';

/**
 * Conduit Creation - Side Selection (Task 3, Step 2).
 *
 * "Are you the Land Owner or Farm Operator on this Conduit?" - single
 * select, required, the first screen of the creation flow regardless
 * of which of the three entry points (Create tab, Home's "Generate
 * Conduit ID" CTA, My Conduits' "Generate") got here (Step 1). This
 * decides which FK slot the creator occupies - the brief is explicit
 * that whoever accepts later is never asked, they get the opposite
 * side automatically (see backend/src/routes/conduits.js's accept
 * route). Per Amendment 7, this is a per-Conduit choice, never a
 * global account role.
 */
export default function ConduitSide() {
  const [selected, setSelected] = useState<Side | null>(null);

  function handleContinue() {
    if (!selected) return;
    router.push({ pathname: '/conduit/land', params: { side: selected } });
  }

  return (
    <AppShell title="Create a Conduit" subtitle="Step 1 of 4" showBackButton hideMenu>
      <Text style={styles.heading}>Are you the Land Owner or Farm Operator on this Conduit?</Text>
      <Text style={styles.subheading}>
        This decides your role for this Conduit only - the same account can be a Land Owner on one
        Conduit and a Farm Operator on another.
      </Text>

      <SideOption
        icon="home-outline"
        label="Land Owner"
        description="I own or control the land being leased on this Conduit."
        selected={selected === 'land_owner'}
        onPress={() => setSelected('land_owner')}
      />
      <SideOption
        icon="leaf-outline"
        label="Farm Operator"
        description="I will be farming the land on this Conduit."
        selected={selected === 'farm_operator'}
        onPress={() => setSelected('farm_operator')}
      />

      <Button label="Continue" onPress={handleContinue} disabled={!selected} />
    </AppShell>
  );
}

function SideOption({
  icon,
  label,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <View style={[styles.optionIconCircle, selected && styles.optionIconCircleSelected]}>
        <Ionicons name={icon} size={22} color={selected ? '#fff' : Colors.accentDark} />
      </View>
      <View style={styles.optionTextBlock}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? Colors.accentDark : Colors.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#EFFAF2',
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4F3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconCircleSelected: {
    backgroundColor: Colors.accentDark,
  },
  optionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
});
