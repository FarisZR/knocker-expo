import React, { ReactNode, useRef, useEffect } from 'react';
import { View, StyleSheet, ViewProps, Animated, Platform } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

interface StyledCardProps extends ViewProps {
  children: ReactNode;
  elevate?: boolean;
  animated?: boolean;
  delay?: number;
}

export function StyledCard({ children, style, elevate = true, animated = true, delay = 0, ...rest }: StyledCardProps) {
  const bg = useThemeColor({ light: Colors.light.surface, dark: Colors.dark.surface }, 'background');
  const border = useThemeColor({ light: Colors.light.outline, dark: Colors.dark.outline }, 'text');

  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 8 : 0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 320,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            delay,
            useNativeDriver: true,
        })
      ]).start();
    }
  }, [animated, delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        elevate && styles.elevated,
        {
          backgroundColor: bg,
          borderColor: border,
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      },
    }),
  },
});

export default StyledCard;