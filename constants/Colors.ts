/**
 * Material Design 3 inspired design tokens (expressive).
 * Includes core semantic colors, surface hierarchy, and container roles.
 * NOTE: Only a minimal subset is defined (enough for current UI); expand as needed.
 */

const primaryLight = '#0A7EA4';
const primaryDark = '#4FC3F7';
const secondaryLight = '#53606B';
const secondaryDark = '#B3C2CC';
const errorLight = '#DC2626';
const errorDark = '#F87171';
const neutralOutlineLight = '#E2E8F0';
const neutralOutlineDark = '#29323A';

export const Colors = {
  light: {
    // Core
    text: '#11181C',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',              // surfaceContainerLow
    surfaceVariant: '#E3EFF5',          // subtle tinted surface
    surfaceContainer: '#FFFFFF',
    surfaceContainerHigh: '#F4F8FA',
    tint: primaryLight,                 // retained legacy alias
    icon: '#687076',
    outline: neutralOutlineLight,
    outlineVariant: '#CFD8DD',

    // Roles
    primary: primaryLight,
    onPrimary: '#FFFFFF',
    primaryContainer: '#BEE7F4',
    onPrimaryContainer: '#063949',

    secondary: secondaryLight,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D5DEE4',
    onSecondaryContainer: '#0D171E',

    error: errorLight,
    onError: '#FFFFFF',
    errorContainer: '#FEE4E2',
    onErrorContainer: '#410002',

    success: '#059669',
    warning: '#D97706',

    // Gradients
    gradientStart: primaryLight,
    gradientEnd: '#34d399',

    tabIconDefault: '#687076',
    tabIconSelected: primaryLight,

    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',            // slight shadow added via component
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
  dark: {
    // Core
    text: '#ECEDEE',
    background: '#0F1418',
    surface: '#151D23',
    surfaceAlt: '#1F2A32',
    surfaceVariant: '#29404A',
    surfaceContainer: '#1B242B',
    surfaceContainerHigh: '#243038',
    tint: primaryDark,
    icon: '#9BA1A6',
    outline: neutralOutlineDark,
    outlineVariant: '#36454F',

    // Roles
    primary: primaryDark,
    onPrimary: '#07242E',
    primaryContainer: '#134B5C',
    onPrimaryContainer: '#DBF6FF',

    secondary: secondaryDark,
    onSecondary: '#223038',
    secondaryContainer: '#2F4049',
    onSecondaryContainer: '#D8E5EC',

    error: errorDark,
    onError: '#3A0005',
    errorContainer: '#621112',
    onErrorContainer: '#FCEEEE',

    success: '#34D399',
    warning: '#FBBF24',

    gradientStart: primaryDark,
    gradientEnd: '#34d399',

    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryDark,

    elevation: {
      level0: 'transparent',
      level1: '#151D23',
      level2: '#1B2A33',
      level3: '#20313B',
      level4: '#233742',
      level5: '#273D49',
    },
  },
};
