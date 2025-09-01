import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, Animated, Platform } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  /**
   * Material variant: 'outlined' (default) | 'filled'
   */
  variant?: 'outlined' | 'filled';
};

export function StyledTextInput({
  style,
  lightColor,
  darkColor,
  variant = 'outlined',
  onFocus,
  onBlur,
  ...otherProps
}: ThemedTextInputProps) {
  const [focused, setFocused] = useState(false);

  const tokensLight = Colors.light;
  const tokensDark = Colors.dark;

  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const outline = useThemeColor({ light: tokensLight.outline, dark: tokensDark.outline }, 'text');
  const primary = useThemeColor({ light: tokensLight.primary, dark: tokensDark.primary }, 'tint');
  const surface = useThemeColor({ light: tokensLight.surface, dark: tokensDark.surface }, 'background');
  const surfaceVariant = useThemeColor(
    { light: tokensLight.surfaceVariant, dark: tokensDark.surfaceVariant },
    'background'
  );

  const focusColor = primary;
  const baseBorderColor = outline;
  const activeBorderColor = focusColor;
  const containerBg = variant === 'filled' ? surfaceVariant : surface;

  return (
    <TextInput
      style={[
        styles.input,
        variant === 'filled' && styles.filled,
        {
          color: textColor,
          backgroundColor: containerBg,
          borderColor: focused ? activeBorderColor : baseBorderColor,
        },
        style,
      ]}
      placeholderTextColor={Platform.OS === 'web' ? '#889097' : '#889097'}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1.2,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 14,
    letterSpacing: 0.25,
  },
  filled: {
    borderWidth: 0,
  },
});