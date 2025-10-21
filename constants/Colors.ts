/**
 * Material Design 3 inspired design tokens (expressive).
 * Includes core semantic colors, surface hierarchy, and container roles.
 * NOTE: Only a minimal subset is defined (enough for current UI); expand as needed.
 */

const primaryLight = '#fde562'; // Golden yellow accent
const primaryDark = '#fde562'; // Golden yellow accent
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
    background: '#F5F5F5', // Light gray background like web
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',              // surfaceContainerLow
    surfaceVariant: '#F5F5F5',          // subtle surface for inputs
    surfaceContainer: '#FFFFFF',
    surfaceContainerHigh: '#F4F8FA',
    tint: primaryLight,                 // retained legacy alias
    icon: '#687076',
    outline: neutralOutlineLight,
    outlineVariant: '#CFD8DD',

    // Roles
    primary: primaryLight,
    onPrimary: '#000000', // Black text on golden yellow
    primaryContainer: '#fff9d9', // Light golden tint
    onPrimaryContainer: '#3d3500',

    secondary: secondaryLight,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D5DEE4',
    onSecondaryContainer: '#0D171E',

    error: errorLight,
    onError: '#FFFFFF',
    errorContainer: '#FEE4E2',
    onErrorContainer: '#410002',

    success: '#10b981', // Green for success
    successContainer: '#d1fae5',
    onSuccessContainer: '#065f46',
    warning: '#D97706',

    // Gradients (not used in new design)
    gradientStart: primaryLight,
    gradientEnd: primaryLight,

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
    background: '#1a1f29', // Dark blue-gray like web
    surface: '#24293a',
    surfaceAlt: '#1F2A32',
    surfaceVariant: '#2d3447',
    surfaceContainer: '#1B242B',
    surfaceContainerHigh: '#243038',
    tint: primaryDark,
    icon: '#9BA1A6',
    outline: neutralOutlineDark,
    outlineVariant: '#36454F',

    // Roles
    primary: primaryDark,
    onPrimary: '#000000', // Black text on golden yellow
    primaryContainer: '#3d3500', // Dark golden
    onPrimaryContainer: '#fff9d9',

    secondary: secondaryDark,
    onSecondary: '#223038',
    secondaryContainer: '#2F4049',
    onSecondaryContainer: '#D8E5EC',

    error: errorDark,
    onError: '#3A0005',
    errorContainer: '#621112',
    onErrorContainer: '#FCEEEE',

    success: '#10b981', // Green for success
    successContainer: '#065f46',
    onSuccessContainer: '#d1fae5',
    warning: '#FBBF24',

    gradientStart: primaryDark,
    gradientEnd: primaryDark,

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
