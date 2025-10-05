import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  initializeNotificationService,
  sendBackgroundSuccessNotification,
  setNotificationErrorReporter,
} from './notifications';
import {
  BACKGROUND_SERVICE_ENABLED_KEY,
  getBackgroundNotificationsEnabled,
  setBackgroundNotificationsEnabled,
  unregisterBackgroundTask,
} from './backgroundKnocker';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  setNotificationCategoryAsync: jest.fn(() => Promise.resolve()),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  AndroidImportance: { MIN: 'min' },
  AndroidNotificationPriority: { MIN: 'min' },
  AndroidNotificationVisibility: { PRIVATE: 'private' },
  IosAuthorizationStatus: {
    AUTHORIZED: 'authorized',
    PROVISIONAL: 'provisional',
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('./backgroundKnocker', () => ({
  BACKGROUND_SERVICE_ENABLED_KEY: 'background-service-enabled',
  getBackgroundNotificationsEnabled: jest.fn(async () => true),
  setBackgroundNotificationsEnabled: jest.fn(async () => {}),
  unregisterBackgroundTask: jest.fn(async () => {}),
}));

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

const scheduleMock = jest.mocked(Notifications.scheduleNotificationAsync);
const getPermissionsMock = jest.mocked(Notifications.getPermissionsAsync);
const setChannelMock = jest.mocked(Notifications.setNotificationChannelAsync);
const setCategoryMock = jest.mocked(Notifications.setNotificationCategoryAsync);
const addResponseListenerMock = jest.mocked(Notifications.addNotificationResponseReceivedListener);

const secureStoreGetItemMock = jest.mocked(SecureStore.getItemAsync);
const secureStoreSetItemMock = jest.mocked(SecureStore.setItemAsync);

const setBackgroundNotificationsEnabledMock = jest.mocked(setBackgroundNotificationsEnabled);
const getBackgroundNotificationsEnabledMock = jest.mocked(getBackgroundNotificationsEnabled);
const unregisterBackgroundTaskMock = jest.mocked(unregisterBackgroundTask);

let notificationResponseHandler:
  | ((response: Notifications.NotificationResponse) => Promise<void>)
  | undefined;

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
  beforeEach(() => {
    jest.clearAllMocks();
    getPermissionsMock.mockResolvedValue({
      granted: true,
    } as Notifications.NotificationPermissionsStatus);
    setNotificationErrorReporter(undefined);
  });

  it('schedules a localized notification that includes disable action category', async () => {
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
          categoryIdentifier: 'background-knocker-actions',
          priority: Notifications.AndroidNotificationPriority.MIN,
          sound: undefined,
        }),
        trigger: null,
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

describe('initializeNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationResponseHandler = undefined;

    addResponseListenerMock.mockImplementation((listener: any) => {
      notificationResponseHandler = listener;
      return { remove: jest.fn() };
    });

    getBackgroundNotificationsEnabledMock.mockResolvedValue(true);
    secureStoreGetItemMock.mockResolvedValue(null);
  });

  it('registers the disable action category', async () => {
    await expect(initializeNotificationService()).resolves.toBe(true);

    expect(setCategoryMock).toHaveBeenCalledWith('background-knocker-actions', [
      expect.objectContaining({
        identifier: 'disable-knocker-action',
        buttonTitle: 'Stop background knocks',
        options: expect.objectContaining({
          isDestructive: true,
          opensAppToForeground: false,
        }),
      }),
    ]);
  });

  it('disables background knocks when action is triggered', async () => {
    secureStoreGetItemMock.mockImplementation(async (key: string) => {
      if (key === BACKGROUND_SERVICE_ENABLED_KEY) {
        return 'true';
      }
      return null;
    });

    await initializeNotificationService();
    expect(notificationResponseHandler).toBeDefined();

    await notificationResponseHandler?.({
      actionIdentifier: 'disable-knocker-action',
    } as Notifications.NotificationResponse);

    expect(setBackgroundNotificationsEnabledMock).toHaveBeenCalledWith(false);
    expect(secureStoreSetItemMock).toHaveBeenCalledWith(
      BACKGROUND_SERVICE_ENABLED_KEY,
      'false'
    );
    expect(unregisterBackgroundTaskMock).toHaveBeenCalled();
  });
});