import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SecureStore from 'expo-secure-store';
import { registerBackgroundTask, unregisterBackgroundTask, BACKGROUND_FETCH_TASK, taskExecutor } from './backgroundKnocker';
import * as Knocker from './knocker';
import { normalizeTtlForAndroidScheduler } from './knockOptions';

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(),
}));
jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  BackgroundFetchStatus: {
    Available: 'available',
  },
  BackgroundFetchResult: {
    NoData: 'no-data',
    NewData: 'new-data',
    Failed: 'failed',
  }
}));
jest.mock('expo-secure-store');
jest.mock('./knocker');

const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockKnock = Knocker.knock as jest.Mock;
const mockDefineTask = TaskManager.defineTask as jest.Mock;
const mockRegisterTaskAsync = BackgroundFetch.registerTaskAsync as jest.Mock;
const mockUnregisterTaskAsync = BackgroundFetch.unregisterTaskAsync as jest.Mock;
const mockIsTaskRegisteredAsync = TaskManager.isTaskRegisteredAsync as jest.Mock;

describe('BackgroundKnocker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerBackgroundTask', () => {
    it('should define and register the background task', async () => {
      await registerBackgroundTask();
      expect(mockDefineTask).toHaveBeenCalledWith(BACKGROUND_FETCH_TASK, expect.any(Function));
      expect(mockRegisterTaskAsync).toHaveBeenCalledWith(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    });
  });

  describe('unregisterBackgroundTask', () => {
    it('should unregister the background task', async () => {
      mockIsTaskRegisteredAsync.mockResolvedValue(true);
      await unregisterBackgroundTask();
      expect(mockUnregisterTaskAsync).toHaveBeenCalledWith(BACKGROUND_FETCH_TASK);
    });

    it('should not unregister if the task is not registered', async () => {
      mockIsTaskRegisteredAsync.mockResolvedValue(false);
      await unregisterBackgroundTask();
      expect(mockUnregisterTaskAsync).not.toHaveBeenCalled();
    });
  });

  describe('Background Task Execution', () => {
    it('should perform a knock when the task is executed', async () => {
      mockGetItemAsync
        .mockResolvedValueOnce('http://localhost:8080')
        .mockResolvedValueOnce('test-token');
      mockKnock.mockResolvedValue({ whitelisted_entry: '1.2.3.4', expires_in_seconds: 3600 });

      const result = await taskExecutor();

      expect(mockKnock).toHaveBeenCalledWith('http://localhost:8080', 'test-token');
      expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
    });

    it('should handle knock failure during background execution', async () => {
        mockGetItemAsync
          .mockResolvedValueOnce('http://localhost:8080')
          .mockResolvedValueOnce('test-token');
        mockKnock.mockRejectedValue(new Error('Failed to knock'));
  
        const result = await taskExecutor();
  
        expect(mockKnock).toHaveBeenCalledWith('http://localhost:8080', 'test-token');
        expect(result).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
      });

   it('should return NoData when TTL is below Android scheduler minimum', async () => {
     mockGetItemAsync
       .mockResolvedValueOnce('http://localhost:8080')
       .mockResolvedValueOnce('test-token')
       .mockResolvedValueOnce('300') // TTL below minimum (900 seconds)
       .mockResolvedValueOnce(undefined); // no IP
     mockKnock.mockResolvedValue({ whitelisted_entry: '1.2.3.4', expires_in_seconds: 3600 });

     const result = await taskExecutor();

     expect(mockKnock).not.toHaveBeenCalled();
     expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
   });
 });
});