import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Colors, Radius, Spacing } from '../../constants/colors';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

/**
 * Shared text input used across every form in Task 2 (Login, Sign Up,
 * Verification, Profile, Security Details, Forgot Password, etc.).
 * Renders an inline error message under the field when `error` is set,
 * matching the "cannot be skipped" / validation requirements throughout
 * the brief (e.g. Security Details blocking submission until filled).
 */
export function TextField({ label, error, style, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.muted}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps.onBlur?.(e);
        }}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: Colors.accent,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
});
