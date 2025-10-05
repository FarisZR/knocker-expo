import { AppState } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SecureStore from 'expo-secure-store';
import {
  BACKGROUND_FETCH_TASK,
  BACKGROUND_LAST_RUN_KEY,
  BACKGROUND_NOTIFICATIONS_ENABLED_KEY,
  ANDROID_SCHEDULER_MIN_INTERVAL,
  registerBackgroundTask,
  unregisterBackgroundTask,
  taskExecutor,
} from './backgroundKnocker';
import * as Knocker from './knocker';
import { sendBackgroundSuccessNotification } from './notifications';

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(),
  isAvailableAsync: jest.fn(),
}));

jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  setMinimumIntervalAsync: jest.fn(),
  getStatusAsync: jest.fn(),
  BackgroundFetchStatus: {
    Available: 'available',
    Restricted: 'restricted',
    Denied: 'denied',
  },
  BackgroundFetchResult: {
    NoData: 'no-data',
    NewData: 'new-data',
    Failed: 'failed',
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('./knocker');
jest.mock('./notifications', () => ({
  sendBackgroundSuccessNotification: jest.fn(),
}));

const mockDefineTask = TaskManager.defineTask as jest.Mock;
const mockIsTaskRegisteredAsync = TaskManager.isTaskRegisteredAsync as jest.Mock;
const mockIsAvailableAsync = TaskManager.isAvailableAsync as jest.Mock;

const mockRegisterTaskAsync = BackgroundFetch.registerTaskAsync as jest.Mock;
const mockUnregisterTaskAsync = BackgroundFetch.unregisterTaskAsync as jest.Mock;
const mockSetMinimumIntervalAsync = BackgroundFetch.setMinimumIntervalAsync as jest.Mock;
const mockGetStatusAsync = BackgroundFetch.getStatusAsync as jest.Mock;

const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

const mockKnock = Knocker.knock as jest.Mock;
const mockSendBackgroundSuccessNotification = sendBackgroundSuccessNotification as jest.Mock;

describe('backgroundKnocker', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetItemAsync.mockReset();
    mockGetItemAsync.mockImplementation(() => Promise.resolve(null));
    mockSetItemAsync.mockReset();
    mockSetItemAsync.mockImplementation(() => Promise.resolve());
    mockDeleteItemAsync.mockReset();
    mockDeleteItemAsync.mockImplementation(() => Promise.resolve());

    mockKnock.mockReset();
    mockSendBackgroundSuccessNotification.mockReset();

    mockIsAvailableAsync.mockReset();
    mockIsAvailableAsync.mockResolvedValue(true);
    mockIsTaskRegisteredAsync.mockReset();
    mockIsTaskRegisteredAsync.mockResolvedValue(false);
    mockGetStatusAsync.mockReset();
    mockGetStatusAsync.mockResolvedValue(BackgroundFetch.BackgroundFetchStatus.Available);

    mockRegisterTaskAsync.mockReset();
    mockUnregisterTaskAsync.mockReset();
    mockSetMinimumIntervalAsync.mockReset();

    (AppState as any).currentState = 'background';
  });

  describe('registerBackgroundTask', () => {
    it('defines and registers the task with minimum interval', async () => {
      await registerBackgroundTask();

      expect(mockDefineTask).toHaveBeenCalledWith(BACKGROUND_FETCH_TASK, expect.any(Function));
      expect(mockSetMinimumIntervalAsync).toHaveBeenCalledWith(ANDROID_SCHEDULER_MIN_INTERVAL);
      expect(mockRegisterTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_FETCH_TASK,
        expect.objectContaining({
          minimumInterval: ANDROID_SCHEDULER_MIN_INTERVAL,
          stopOnTerminate: false,
          startOnBoot: true,
        })
      );
    });
  });

  describe('unregisterBackgroundTask', () => {
    it('unregisters when task is registered', async () => {
      mockIsTaskRegisteredAsync.mockResolvedValueOnce(true);

      await unregisterBackgroundTask();

      expect(mockUnregisterTaskAsync).toHaveBeenCalledWith(BACKGROUND_FETCH_TASK);
    });

    it('no-ops when task not registered', async () => {
      mockIsTaskRegisteredAsync.mockResolvedValueOnce(false);

      await unregisterBackgroundTask();

      expect(mockUnregisterTaskAsync).not.toHaveBeenCalled();
    });
  });

  describe('taskExecutor', () => {
    const setupSecureStoreSequence = (
      endpoint: string | null,
      token: string | null,
      ttl: string | null,
      ip: string | null,
      notificationsPref: string | null
    ) => {
      mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(endpoint));
      mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(token));
      mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(ttl));
      mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(ip));
      mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(notificationsPref));
    };

    it('records success metadata and sends notification when backgrounded', async () => {
      setupSecureStoreSequence('http://localhost:8080', 'test-token', '900', null, null);
      mockKnock.mockResolvedValue({ whitelisted_entry: '1.2.3.4', expires_in_seconds: 3600 });

      const result = await taskExecutor();

      expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
      expect(mockKnock).toHaveBeenCalledWith('http://localhost:8080', 'test-token', { ttl: 900 });
      const callsForKey = mockSetItemAsync.mock.calls.filter(([key]) => key === BACKGROUND_LAST_RUN_KEY);
      expect(callsForKey.length).toBeGreaterThan(0);
      const metadata = JSON.parse(callsForKey[callsForKey.length - 1][1]);
      expect(metadata.status).toBe('success');
      expect(metadata.expiresInSeconds).toBe(3600);
      expect(mockSendBackgroundSuccessNotification).toHaveBeenCalledWith({
        endpoint: 'http://localhost:8080',
        whitelistedEntry: '1.2.3.4',
        expiresInSeconds: 3600,
      });
    });

    it('does not send notification when app is active', async () => {
      (AppState as any).currentState = 'active';
      setupSecureStoreSequence('http://localhost:8080', 'test-token', '900', null, null);
      mockKnock.mockResolvedValue({ whitelisted_entry: '1.2.3.4', expires_in_seconds: 3600 });

      await taskExecutor();

      expect(mockSendBackgroundSuccessNotification).not.toHaveBeenCalled();
    });

    it('does not send notification when preference disabled', async () => {
      setupSecureStoreSequence('http://localhost:8080', 'test-token', '900', null, 'false');
      mockKnock.mockResolvedValue({ whitelisted_entry: '1.2.3.4', expires_in_seconds: 3600 });

      await taskExecutor();

      expect(mockSendBackgroundSuccessNotification).not.toHaveBeenCalled();
    });

    it('records restricted status when fetch status is restricted', async () => {
      mockGetStatusAsync.mockResolvedValueOnce(BackgroundFetch.BackgroundFetchStatus.Restricted);
      setupSecureStoreSequence('http://localhost:8080', 'test-token', '900', null, null);

      const result = await taskExecutor();

      expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
      expect(mockKnock).not.toHaveBeenCalled();
      const callsForKey = mockSetItemAsync.mock.calls.filter(([key]) => key === BACKGROUND_LAST_RUN_KEY);
      expect(callsForKey.length).toBeGreaterThan(0);
      const metadata = JSON.parse(callsForKey[callsForKey.length - 1][1]);
      expect(metadata.status).toBe('restricted');
    });

    it('records missing credentials metadata when endpoint missing', async () => {
      setupSecureStoreSequence(null, 'test-token', null, null, null);

      const result = await taskExecutor();

      expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
      expect(mockKnock).not.toHaveBeenCalled();
      const callsForKey = mockSetItemAsync.mock.calls.filter(([key]) => key === BACKGROUND_LAST_RUN_KEY);
      expect(callsForKey.length).toBeGreaterThan(0);
      const metadata = JSON.parse(callsForKey[callsForKey.length - 1][1]);
      expect(metadata.status).toBe('missing-credentials');
    });

    it('coerces TTL below minimum before knocking', async () => {
      setupSecureStoreSequence('http://localhost:8080', 'test-token', '300', null, null);
      mockKnock.mockResolvedValue({ whitelisted_entry: '1.2.3.4', expires_in_seconds: 3600 });

      await taskExecutor();

      expect(mockKnock).toHaveBeenCalledWith('http://localhost:8080', 'test-token', {
        ttl: ANDROID_SCHEDULER_MIN_INTERVAL,
      });
    });

    it('records failure metadata when knock rejects', async () => {
      setupSecureStoreSequence('http://localhost:8080', 'test-token', null, null, null);
      mockKnock.mockRejectedValueOnce(new Error('Failed to knock'));

      const result = await taskExecutor();

      expect(result).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
      const callsForKey = mockSetItemAsync.mock.calls.filter(([key]) => key === BACKGROUND_LAST_RUN_KEY);
      expect(callsForKey.length).toBeGreaterThan(0);
      const metadata = JSON.parse(callsForKey[callsForKey.length - 1][1]);
      expect(metadata.status).toBe('failed');
    });
  });
});