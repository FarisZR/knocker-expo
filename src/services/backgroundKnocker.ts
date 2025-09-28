import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SecureStore from 'expo-secure-store';
import { knock } from './knocker';
import { normalizeTtlForAndroidScheduler } from './knockOptions';

/**
 * Name of the background fetch task.
 */
export const BACKGROUND_FETCH_TASK = 'background-knocker-task';

/**
 * Android scheduler minimum interval in seconds (15 minutes).
 */
export const ANDROID_SCHEDULER_MIN_INTERVAL = 15 * 60; // 900 seconds

/**
 * Validates if TTL is compatible with Android scheduler requirements.
 * @param ttl TTL value in seconds
 * @returns true if TTL is valid for Android scheduler, false otherwise
 */
export function isTtlCompatibleWithAndroidScheduler(ttl: number): boolean {
  return ttl >= ANDROID_SCHEDULER_MIN_INTERVAL;
}

/**
 * Gets warning message for TTL that's below Android scheduler threshold.
 * @param ttl TTL value in seconds
 * @returns Warning message or empty string if TTL is valid
 */
export function getTtlWarningMessage(ttl: number): string {
  if (!isTtlCompatibleWithAndroidScheduler(ttl)) {
    const minutes = Math.ceil(ANDROID_SCHEDULER_MIN_INTERVAL / 60);
    return `TTL (${ttl}s) is below Android's minimum scheduler interval (${minutes} minutes). Background knocks may not work as expected.`;
  }
  return '';
}


/**
 * Task executor invoked by TaskManager when the background fetch fires.
 */
export const taskExecutor = async () => {
  try {
    const endpoint = await SecureStore.getItemAsync('knocker-endpoint');
    const token = await SecureStore.getItemAsync('knocker-token');
    const ttlRaw = await SecureStore.getItemAsync('knocker-ttl');
    const ip = await SecureStore.getItemAsync('knocker-ip');

    if (endpoint && token) {
      const ttlNum = ttlRaw ? Number(ttlRaw) : undefined;
      const ttlObj = normalizeTtlForAndroidScheduler(ttlNum);
      
      // Only proceed with knock if TTL is compatible with Android scheduler
      if (ttlObj.isAndroidSchedulerCompatible) {
        const hasOptions = (typeof ttlObj.effectiveTtl === 'number' && !isNaN(ttlObj.effectiveTtl)) || !!ip;
        if (hasOptions) {
          await knock(endpoint, token, {
            ttl: ttlObj.effectiveTtl,
            ip_address: ip || undefined,
          });
        } else {
          await knock(endpoint, token);
        }
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } else {
        // If TTL is not compatible, return NoData to indicate no action was taken
        // However, we should still allow the background service to continue running
        // so that if the user updates the TTL later, it will work
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
};

/**
 * Defines the background task (safe to call multiple times).
 */
export function defineTask() {
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, taskExecutor);
}

/**
 * Registers the background task if the TaskManager API is available (native platforms / dev build).
 * On web the API is unavailable, so this becomes a no-op to prevent UnavailabilityError:
 * "TaskManager.isTaskRegisteredAsync is not available on web".
 */
export async function registerBackgroundTask() {
  try {
    // Define the task (safe to call repeatedly).
    defineTask();
    // Attempt to register with BackgroundFetch. In tests/mocked environments this will call the mocked function.
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (e) {
    // Swallow errors caused by unsupported environments or permission issues.
    console.warn('Background task registration skipped:', (e as Error).message);
  }
}

/**
 * Unregisters the background task (no-op on unsupported platforms).
 */
export async function unregisterBackgroundTask() {
  try {
    // If the TaskManager mock provides isTaskRegisteredAsync use it; otherwise skip.
    if (typeof TaskManager.isTaskRegisteredAsync === 'function') {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      }
    }
  } catch (e) {
    // Ignore unavailability or other transient errors.
    console.warn('Background task unregistration skipped:', (e as Error).message);
  }
}

/**
 * Helper that safely checks TaskManager availability without throwing on web.
 */
async function safeIsTaskManagerAvailable(): Promise<boolean> {
  try {
    // Some test mocks don't include isAvailableAsync but do provide defineTask/isTaskRegisteredAsync.
    // If the real isAvailableAsync exists, use it. Otherwise infer availability from presence of other TaskManager APIs.
    if (typeof TaskManager.isAvailableAsync === 'function') {
      return await TaskManager.isAvailableAsync();
    }
    return typeof TaskManager.defineTask === 'function' && typeof TaskManager.isTaskRegisteredAsync === 'function';
  } catch {
    return false;
  }
}