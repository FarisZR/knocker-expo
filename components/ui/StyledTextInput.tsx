import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function StyledTextInput({ style, lightColor, darkColor, ...otherProps }: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'text');

  return (
    <TextInput
      style={[
        styles.input,
        { color, backgroundColor, borderColor },
        style,
      ]}
      placeholderTextColor={Colors.dark.icon}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
});