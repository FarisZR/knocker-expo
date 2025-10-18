import React, { ReactNode, useRef, useEffect } from 'react';
import { StyleSheet, ViewProps, Animated, Platform } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

type CardVariant = 'elevated' | 'filled' | 'outlined' | 'tonal';

interface StyledCardProps extends ViewProps {
  children: ReactNode;
  animated?: boolean;
  delay?: number;
  variant?: CardVariant;
}

export function StyledCard({
  children,
  style,
  animated = true,
  delay = 0,
  variant = 'elevated',
  ...rest
}: StyledCardProps) {
  const light = Colors.light;
  const dark = Colors.dark;

  const surface = useThemeColor({ light: light.surface, dark: dark.surface }, 'background');
  const surfaceVariant = useThemeColor(
    { light: light.surfaceVariant, dark: dark.surfaceVariant },
    'background'
  );
  const outline = useThemeColor({ light: light.outline, dark: dark.outline }, 'text');

  const bg =
    variant === 'tonal'
      ? surfaceVariant
      : variant === 'filled'
      ? surface
      : variant === 'elevated'
      ? surface
      : 'transparent';

  const showBorder = variant === 'outlined';
  const showElevation = variant === 'elevated';

  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 10 : 0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 340,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 38,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        showElevation && styles.elevated,
        {
          backgroundColor: bg,
          borderColor: showBorder ? outline : 'transparent',
          borderWidth: showBorder ? 1 : 0,
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16, // More refined, less bubbly
    padding: 24,
    overflow: 'hidden',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      },
    }),
  },
});

export default StyledCard;