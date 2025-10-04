import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Notifications from 'expo-notifications';
import type { Mock } from 'jest-mock';
import { Platform } from 'react-native';

import { sendBackgroundSuccessNotification, setNotificationErrorReporter } from './notifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  AndroidImportance: { MIN: 'min' },
  AndroidNotificationPriority: { MIN: 'min' },
  AndroidNotificationVisibility: { PRIVATE: 'private' },
  IosAuthorizationStatus: {
    AUTHORIZED: 'authorized',
    PROVISIONAL: 'provisional',
  },
}));

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

beforeAll(() => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => 'android',
  });
});

afterAll(() => {
  if (originalPlatformDescriptor) {
    Object.defineProperty(Platform, 'OS', originalPlatformDescriptor);
  }
});

describe('sendBackgroundSuccessNotification', () => {
  const scheduleMock = Notifications.scheduleNotificationAsync as unknown as Mock;
  const getPermissionsMock = Notifications.getPermissionsAsync as unknown as Mock;
  const setChannelMock = Notifications.setNotificationChannelAsync as unknown as Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getPermissionsMock.mockImplementation(async () => ({ granted: true }));
    setNotificationErrorReporter(undefined);
  });

  it('schedules a localized notification when permissions are granted', async () => {
    await sendBackgroundSuccessNotification({
      endpoint: 'https://example.com',
      whitelistedEntry: '1.2.3.4',
      expiresInSeconds: 3600,
    });

    expect(setChannelMock).toHaveBeenCalled();
    expect(scheduleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Background knock succeeded',
          body: '1.2.3.4 – Expires in 3600 seconds',
          data: expect.objectContaining({
            endpoint: 'https://example.com',
            whitelistedEntry: '1.2.3.4',
            expiresInSeconds: 3600,
            type: 'background-knock-success',
          }),
        }),
      })
    );
  });

  it('logs and reports when scheduling fails but does not throw', async () => {
    scheduleMock.mockImplementationOnce(async () => {
      throw new Error('schedule failed');
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = jest.fn();
    setNotificationErrorReporter(reporter);

    await expect(
      sendBackgroundSuccessNotification({
        endpoint: 'https://example.com',
        whitelistedEntry: '1.2.3.4',
        expiresInSeconds: 3600,
      })
    ).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to schedule background success notification:',
      expect.any(Error)
    );
    expect(reporter).toHaveBeenCalledWith(expect.any(Error));

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('skips scheduling and logs when channel creation fails', async () => {
    setChannelMock.mockImplementationOnce(async () => {
      throw new Error('channel failed');
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setNotificationErrorReporter(() => {
      throw new Error('reporter failed');
    });

    await sendBackgroundSuccessNotification({
      endpoint: 'https://example.com',
      whitelistedEntry: '1.2.3.4',
      expiresInSeconds: 3600,
    });

    expect(scheduleMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to schedule background success notification:',
      expect.any(Error)
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Non-fatal notification error reporter failed:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('short-circuits on web without scheduling', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'web',
    });

    await sendBackgroundSuccessNotification({
      endpoint: 'https://example.com',
      whitelistedEntry: '1.2.3.4',
      expiresInSeconds: 3600,
    });

    expect(scheduleMock).not.toHaveBeenCalled();

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });
  });
});
