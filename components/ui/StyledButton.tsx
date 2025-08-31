import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, Animated, Easing } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

interface StyledButtonProps extends TouchableOpacityProps {
  title: string;
  accent?: boolean;
  pulse?: boolean;
}

export function StyledButton({ title, style, accent = true, pulse = false, ...otherProps }: StyledButtonProps) {
  const baseTint = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const backgroundColor = accent ? baseTint : useThemeColor({ light: Colors.light.surfaceAlt, dark: Colors.dark.surfaceAlt }, 'background');
  const color = accent
    ? useThemeColor({ light: '#fff', dark: '#0F1418' }, 'text')
    : useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');

  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulse) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [pulse, pulseAnim]);

  const animatedStyle = {
    transform: pulse
      ? [
          { scale },
          {
            scale: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.035],
            }),
          },
        ]
      : [{ scale }],
  };

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 6 }).start();
    otherProps.onPressIn?.(null as any);
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    otherProps.onPressOut?.(null as any);
  };

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            backgroundColor,
            shadowColor: accent ? backgroundColor : '#000',
          },
          accent && styles.accentShadow,
          style,
        ]}
        {...otherProps}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text style={[styles.text, { color }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  accentShadow: {
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});