import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
};

export function StyledText({ style, lightColor, darkColor, ...otherProps }: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <Text style={[{ color }, style]} {...otherProps} />;
}