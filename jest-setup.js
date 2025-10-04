import '@testing-library/jest-native/extend-expect';

jest.mock('expo-task-manager', () => ({
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
  defineTask: jest.fn(),
  unregisterTaskAsync: jest.fn(),
}));

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn().mockResolvedValue(undefined),
  ActivityAction: {
    IGNORE_BATTERY_OPTIMIZATION_SETTINGS: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
  },
}));