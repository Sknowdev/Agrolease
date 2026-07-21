import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/ui/AppShell';
import { Button } from '../../components/ui/Button';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiPost } from '../../lib/apiClient';

type Setting = '24h' | '7d' | '30d' | 'never';
type Conduit = { id: string; conduit_id: string; invitation_expiry: string | null };

const OPTIONS: { value: Setting; label: string; isDefault?: boolean }[] = [
  { value: '24h', label: '24 hours', isDefault: true },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'never', label: 'Never' },
];

/**
 * Conduit Creation - Invitation Expiry picker (Task 3, Step 5).
 *
 * 24 hours (default) / 7 days / 30 days / Never - same warning pattern
 * already used for Security link codes (Task 2) for the non-default
 * choices, per the brief.
 */
export default function ConduitExpiry() {
  const { conduitId } = useLocalSearchParams<{ conduitId: string }>();
  const [selected, setSelected] = useState<Setting>('24h');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleContinue() {
    setError(undefined);
    setIsSubmitting(true);
    try {
      const { conduit } = await apiPost<{ conduit: Conduit }>(`/v1/conduits/${conduitId}/invitation`, {
        expirySetting: selected,
      });
      router.push({ pathname: '/conduit/generated', params: { conduitId: conduit.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Create a Conduit" subtitle="Step 4 of 4" showBackButton hideMenu>
      <Text style={styles.heading}>How long should this invitation stay open?</Text>
      <Text style={styles.subheading}>
        Your partner must accept before this expires. You can always regenerate a new invitation later.
      </Text>

      {OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          style={[styles.option, selected === option.value && styles.optionSelected]}
          onPress={() => setSelected(option.value)}
        >
          <Ionicons
            name={selected === option.value ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={selected === option.value ? Colors.accentDark : Colors.muted}
          />
          <Text style={styles.optionLabel}>{option.label}</Text>
          {option.isDefault ? <Text style={styles.defaultBadge}>Default</Text> : null}
        </Pressable>
      ))}

      {selected !== '24h' ? (
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.warningText}>
            {selected === 'never'
              ? 'This invitation will never expire on its own until your partner accepts or you regenerate it.'
              : `This invitation will stay open for ${OPTIONS.find((o) => o.value === selected)?.label.toLowerCase()} before your partner must accept.`}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button label="Generate Conduit ID" onPress={handleContinue} loading={isSubmitting} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.xs },
  subheading: { fontSize: 13, color: Colors.muted, marginBottom: Spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#EFFAF2',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  defaultBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentDark,
    backgroundColor: '#E4F3E8',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  warningBox: {
    flexDirection: 'row',
    gap: Spacing.xs,
    backgroundColor: '#FBEADB',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#8A5A16',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
});
