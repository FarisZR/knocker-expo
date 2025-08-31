import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

interface StyledButtonProps extends TouchableOpacityProps {
  title: string;
}

export function StyledButton({ title, style, ...otherProps }: StyledButtonProps) {
  const backgroundColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const color = useThemeColor({ light: '#fff', dark: '#000' }, 'text');

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }, style]} {...otherProps}>
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});