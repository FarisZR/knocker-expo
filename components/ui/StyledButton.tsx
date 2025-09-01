import React, { useRef, useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  Animated,
  Easing,
  ViewStyle,
  Platform,
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

interface StyledButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  /**
   * Legacy prop kept for backwards compatibility. Maps to variant = 'filled' when true else 'tonal'.
   */
  accent?: boolean;
  pulse?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle | ViewStyle[];
}

export function StyledButton({
  title,
  style,
  accent = true,
  pulse = false,
  variant,
  disabled,
  ...otherProps
}: StyledButtonProps) {
  // Variant resolution
  const resolvedVariant: ButtonVariant =
    variant || (accent ? 'filled' : 'tonal');

  const light = Colors.light;
  const dark = Colors.dark;

  // Semantic colors via theme hook
  const primary = useThemeColor({ light: light.primary, dark: dark.primary }, 'tint');
  const onPrimary = useThemeColor({ light: light.onPrimary, dark: dark.onPrimary }, 'text');
  const primaryContainer = useThemeColor(
    { light: light.primaryContainer, dark: dark.primaryContainer },
    'background'
  );
  const onPrimaryContainer = useThemeColor(
    { light: light.onPrimaryContainer, dark: dark.onPrimaryContainer },
    'text'
  );
  const outline = useThemeColor({ light: light.outline, dark: dark.outline }, 'text');
  const textColorBase = useThemeColor({ light: light.text, dark: dark.text }, 'text');

  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulse && !disabled) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [pulse, pulseAnim, disabled]);

  const animatedStyle = {
    transform: pulse
      ? [
          { scale },
          {
            scale: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.04],
            }),
          },
        ]
      : [{ scale }],
  };

  const containerStyles: ViewStyle[] = [styles.base];

  switch (resolvedVariant) {
    case 'filled':
      containerStyles.push({
        backgroundColor: primary,
      });
      break;
    case 'tonal':
      containerStyles.push({
        backgroundColor: primaryContainer,
      });
      break;
    case 'outlined':
      containerStyles.push({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: outline,
      });
      break;
    case 'text':
      containerStyles.push({
        backgroundColor: 'transparent',
        paddingHorizontal: 8,
      });
      break;
  }

  if (disabled) {
    containerStyles.push({
      opacity: 0.38,
    });
  }

  // Shadow / elevation for filled & tonal (expressive)
  if (!disabled && (resolvedVariant === 'filled' || resolvedVariant === 'tonal')) {
    containerStyles.push(styles.elevated);
  }

  const labelColor =
    resolvedVariant === 'filled'
      ? onPrimary
      : resolvedVariant === 'tonal'
      ? onPrimaryContainer
      : primary;

  const ripple =
    Platform.OS === 'android'
      ? {
          android_ripple: {
            color:
              resolvedVariant === 'filled'
                ? 'rgba(255,255,255,0.18)'
                : primary + '33',
            borderless: false,
          },
        }
      : {};

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 6,
    }).start();
    otherProps.onPressIn?.(undefined as any);
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
    otherProps.onPressOut?.(undefined as any);
  };

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <Pressable
        {...ripple}
        {...otherProps}
        disabled={disabled}
        style={({ pressed }) => [
          containerStyles,
            pressed && !disabled && styles.pressed,
          style,
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text
          style={[
            styles.label,
            {
              color:
                resolvedVariant === 'outlined' || resolvedVariant === 'text'
                  ? labelColor
                  : labelColor,
            },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24, // large shape per MD3 expressive
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
      },
    }),
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});