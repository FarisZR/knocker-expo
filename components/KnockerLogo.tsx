import React from 'react';
import { View, Image, useColorScheme, StyleSheet, ViewStyle } from 'react-native';

interface KnockerLogoProps {
  width?: number;
  style?: ViewStyle;
}

export function KnockerLogo({ width = 240, style }: KnockerLogoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Use white logo on dark backgrounds, black logo on light backgrounds
  const logoSource = isDark
    ? require('../assets/images/knocker-logo-white.png')
    : require('../assets/images/knocker-logo-black.png');

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={[styles.logo, { width, height: width * 0.25 }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Logo image
  },
});
