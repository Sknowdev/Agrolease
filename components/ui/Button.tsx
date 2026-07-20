import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'outlineOnDark';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

/**
 * Shared button used across every Task 2 screen (Sign In, Continue,
 * Verify, Save, Send Reset Link, etc.) so tap targets/spacing/disabled
 * states are consistent rather than re-implemented per screen.
 *
 * `outlineOnDark` is used for the two-up "Continue with Google" /
 * "Security Access" row on the dark green auth card (app_refrence.png
 * IMG_1308-1310) - a subtle light-bordered button readable on the dark
 * background, distinct from `outline`'s green-on-white styling used
 * elsewhere (e.g. Forgot Password's "Reset via SMS").
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
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
        <View style={styles.contentRow}>
          {icon}
          <Text
            style={[styles.label, textVariantStyles[variant]]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Two equal-weight buttons sharing one row - used for "Continue with
 * Google" + "Security Access" on Login/Sign Up. Forces each child
 * Button to `fullWidth={false}` and gives each equal flex, since
 * Button's own `fullWidth` default (true) would otherwise make each
 * child claim the entire row on its own and push its sibling off
 * (the bug seen in the first build - Google's button took the whole
 * row and Security Access never rendered visibly).
 */
export function ButtonRow({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.row}>
      {items.map((child, index) =>
        React.isValidElement(child) ? (
          <View style={styles.rowItem} key={index}>
            {React.cloneElement(child as React.ReactElement<ButtonProps>, { fullWidth: true })}
          </View>
        ) : (
          child
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 0,
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    maxWidth: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  rowItem: {
    flex: 1,
    minWidth: 0,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.primaryDark },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.accent },
  ghost: { backgroundColor: 'transparent' },
  outlineOnDark: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: '#fff' },
  outline: { color: Colors.accentDark },
  ghost: { color: Colors.accentDark },
  outlineOnDark: { color: '#fff' },
});
