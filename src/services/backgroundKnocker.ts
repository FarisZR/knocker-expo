import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SecureStore from 'expo-secure-store';
import { knock } from './knocker';

export const BACKGROUND_FETCH_TASK = 'background-knocker-task';

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
    } catch (error) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  };

export function defineTask() {
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, taskExecutor);
}

export async function registerBackgroundTask() {
  defineTask();
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  }
}