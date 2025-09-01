import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SecureStore from 'expo-secure-store';
import { knock } from './knocker';

/**
 * Name of the background fetch task.
 */
export const BACKGROUND_FETCH_TASK = 'background-knocker-task';

/**
 * Task executor invoked by TaskManager when the background fetch fires.
 */
export const taskExecutor = async () => {
  try {
    const endpoint = await SecureStore.getItemAsync('knocker-endpoint');
    const token = await SecureStore.getItemAsync('knocker-token');

    if (endpoint && token) {
      await knock(endpoint, token);
      return BackgroundFetch.BackgroundFetchResult.NewData;
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
  if (!(await safeIsTaskManagerAvailable())) {
    return;
  }
  try {
    defineTask();
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
  if (!(await safeIsTaskManagerAvailable())) {
    return;
  }
  try {
    // isTaskRegisteredAsync throws UnavailabilityError on web; we guarded above.
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
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
    return await TaskManager.isAvailableAsync();
  } catch {
    return false;
  }
}