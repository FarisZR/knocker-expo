import '@testing-library/jest-native/extend-expect';

jest.mock('expo-task-manager', () => ({
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
  defineTask: jest.fn(),
  unregisterTaskAsync: jest.fn(),
}));