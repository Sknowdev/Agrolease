import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

/**
 * Shared button used across every Task 2 screen (Sign In, Continue,
 * Verify, Save, Send Reset Link, etc.) so tap targets/spacing/disabled
 * states are consistent rather than re-implemented per screen.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.accentDark} />
      ) : (
        <Text style={[styles.label, textVariantStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Two equal-weight buttons in a row - used for "Continue with Google" + "Security Access". */
export function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.primaryDark },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.accent },
  ghost: { backgroundColor: 'transparent' },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: '#fff' },
  outline: { color: Colors.accentDark },
  ghost: { color: Colors.accentDark },
});
