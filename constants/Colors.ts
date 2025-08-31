/**
 * Design tokens for light & dark themes.
 * Extended to include surface layers, outlines, semantic colors, and gradients.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4FC3F7';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    tint: tintColorLight,
    icon: '#687076',
    outline: '#E2E8F0',
    danger: '#DC2626',
    success: '#059669',
    warning: '#D97706',
    gradientStart: '#0a7ea4',
    gradientEnd: '#34d399',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1418',
    surface: '#151D23',
    surfaceAlt: '#1F2A32',
    tint: tintColorDark,
    icon: '#9BA1A6',
    outline: '#29323A',
    danger: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    gradientStart: '#0a7ea4',
    gradientEnd: '#34d399',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
