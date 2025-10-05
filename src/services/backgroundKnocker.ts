import { AppState, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SecureStore from 'expo-secure-store';
import { knock } from './knocker';
import { normalizeTtlForAndroidScheduler } from './knockOptions';
import { sendBackgroundSuccessNotification } from './notifications';

/**
 * Name of the background fetch task.
 */
export const BACKGROUND_FETCH_TASK = 'background-knocker-task';

/**
 * Storage key for the last recorded background run metadata.
 */
export const BACKGROUND_LAST_RUN_KEY = 'background-last-run';

/**
 * Storage key for persisted next-run scheduling metadata.
 */
export const BACKGROUND_NEXT_RUN_KEY = 'background-next-run';

/**
 * Storage key that tracks whether silent notifications are allowed.
 */
export const BACKGROUND_NOTIFICATIONS_ENABLED_KEY = 'background-notifications-enabled';

/**
 * Android scheduler minimum interval in seconds (15 minutes).
 */
export const ANDROID_SCHEDULER_MIN_INTERVAL = 15 * 60; // 900 seconds

/**
 * Threshold (in milliseconds) after which the background task is considered stale.
 * Currently set to 45 minutes.
 */
export const BACKGROUND_STALE_THRESHOLD_MS = 45 * 60 * 1000;

/**
 * Amount of seconds to subtract from the server TTL to create a safety buffer.
 * This helps re-knock slightly before the whitelist actually expires.
 */
export const TTL_SAFETY_BUFFER_SECONDS = 120;

export interface NextRunMetadata {
  nextRunAt: number; // epoch ms
  requestedTtl?: number;
  effectiveTtl?: number;
  scheduledIntervalSeconds: number; // interval written to the scheduler
  ttlBelowMinimum?: boolean;
}

export async function getNextRunMetadata(): Promise<NextRunMetadata | null> {
  try {
    const raw = await SecureStore.getItemAsync(BACKGROUND_NEXT_RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as NextRunMetadata;
  } catch {
    return null;
  }
}

export async function setNextRunMetadata(meta: NextRunMetadata): Promise<void> {
  try {
    await SecureStore.setItemAsync(BACKGROUND_NEXT_RUN_KEY, JSON.stringify(meta));
  } catch {
    // Best effort.
  }
}

export async function clearNextRunMetadata(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BACKGROUND_NEXT_RUN_KEY);
  } catch {
    // Best effort.
  }
}

type BackgroundRunStatus =
  | 'success'
  | 'no-data'
  | 'failed'
  | 'restricted'
  | 'missing-credentials';

export interface BackgroundRunMetadata {
  timestamp: string;
  status: BackgroundRunStatus;
  detail?: string;
  expiresInSeconds?: number;
}

function isBooleanFalse(value: string | null): boolean {
  return value === 'false';
}

async function recordBackgroundRun(metadata: BackgroundRunMetadata) {
  try {
    await SecureStore.setItemAsync(BACKGROUND_LAST_RUN_KEY, JSON.stringify(metadata));
  } catch {
    // Ignore persistence errors to avoid crashing the task.
  }
}

export async function getLastBackgroundRunMetadata(): Promise<BackgroundRunMetadata | null> {
  try {
    const raw = await SecureStore.getItemAsync(BACKGROUND_LAST_RUN_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed as BackgroundRunMetadata;
  } catch {
    return null;
  }
}

export async function clearBackgroundRunMetadata(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BACKGROUND_LAST_RUN_KEY);
  } catch {
    // Best effort.
  }
}

export async function getBackgroundNotificationsEnabled(): Promise<boolean> {
  const pref = await SecureStore.getItemAsync(BACKGROUND_NOTIFICATIONS_ENABLED_KEY);
  return !isBooleanFalse(pref);
}

export async function setBackgroundNotificationsEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BACKGROUND_NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
}

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
    if (typeof BackgroundFetch.getStatusAsync === 'function') {
      const status = await BackgroundFetch.getStatusAsync();
      if (
        status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied
      ) {
        await recordBackgroundRun({
          timestamp: new Date().toISOString(),
          status: 'restricted',
        });
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
    }

    const endpoint = await SecureStore.getItemAsync('knocker-endpoint');
    const token = await SecureStore.getItemAsync('knocker-token');
    const ttlRaw = await SecureStore.getItemAsync('knocker-ttl');
    const ip = await SecureStore.getItemAsync('knocker-ip');
    const notificationsEnabled = await getBackgroundNotificationsEnabled();

    if (!endpoint || !token) {
      await recordBackgroundRun({
        timestamp: new Date().toISOString(),
        status: 'missing-credentials',
      });
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const ttlNum = ttlRaw ? Number(ttlRaw) : undefined;
    const ttlObj = normalizeTtlForAndroidScheduler(ttlNum);
 
    const options: { ttl?: number; ip_address?: string } = {};
    if (typeof ttlObj.effectiveTtl === 'number' && !Number.isNaN(ttlObj.effectiveTtl)) {
      options.ttl = ttlObj.effectiveTtl;
    }
    if (ip) {
      options.ip_address = ip;
    }
 
    try {
      const result = Object.keys(options).length
        ? await knock(endpoint, token, options)
        : await knock(endpoint, token);
 
      await recordBackgroundRun({
        timestamp: new Date().toISOString(),
        status: 'success',
        expiresInSeconds: result?.expires_in_seconds,
      });
 
      // --- Scheduling logic: persist next-run metadata and attempt to adjust scheduler ---
      const requestedTtl =
        (result && (result as any).requested_ttl !== undefined
          ? (result as any).requested_ttl
          : ttlNum) ?? undefined;
      const effectiveTtl = typeof options.ttl === 'number' ? options.ttl : undefined;
      const ttlBelowMinimum =
        typeof requestedTtl === 'number' && requestedTtl < ANDROID_SCHEDULER_MIN_INTERVAL;
 
      // Calculate scheduled interval (seconds). Try to schedule slightly before expiry,
      // but never below Android's minimum.
      let scheduledInterval = ANDROID_SCHEDULER_MIN_INTERVAL;
      if (typeof requestedTtl === 'number' && !Number.isNaN(requestedTtl)) {
        const candidate = Math.max(requestedTtl - TTL_SAFETY_BUFFER_SECONDS, ANDROID_SCHEDULER_MIN_INTERVAL);
        scheduledInterval = candidate;
      }
 
      const nextRunAt = Date.now() + scheduledInterval * 1000;
      await setNextRunMetadata({
        nextRunAt,
        requestedTtl,
        effectiveTtl,
        scheduledIntervalSeconds: scheduledInterval,
        ttlBelowMinimum,
      });
 
      // Best-effort: inform system scheduler about preferred minimum interval (Android).
      if (typeof BackgroundFetch.setMinimumIntervalAsync === 'function') {
        try {
          await BackgroundFetch.setMinimumIntervalAsync(scheduledInterval);
        } catch {
          // Non-fatal
        }
      }
      // --- end scheduling logic ---
 
      const appState = AppState.currentState;
      if (notificationsEnabled && appState !== 'active') {
        await sendBackgroundSuccessNotification({
          endpoint,
          whitelistedEntry: result?.whitelisted_entry ?? 'Unknown',
          expiresInSeconds: result?.expires_in_seconds,
        });
      }
 
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error: any) {
      await recordBackgroundRun({
        timestamp: new Date().toISOString(),
        status: 'failed',
        detail: error?.message ?? String(error),
      });
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error: any) {
    await recordBackgroundRun({
      timestamp: new Date().toISOString(),
      status: 'failed',
      detail: error?.message ?? String(error),
    });
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
 * On web the API is unavailable, so this becomes a no-op to prevent UnavailabilityError.
 */
export async function registerBackgroundTask() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    if (!(await safeIsTaskManagerAvailable())) {
      return;
    }

    defineTask();
    if (typeof BackgroundFetch.setMinimumIntervalAsync === 'function') {
      await BackgroundFetch.setMinimumIntervalAsync(ANDROID_SCHEDULER_MIN_INTERVAL);
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: ANDROID_SCHEDULER_MIN_INTERVAL,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (e) {
    console.warn('Background task registration skipped:', (e as Error).message);
  }
}

/**
 * Unregisters the background task (no-op on unsupported platforms).
 */
export async function unregisterBackgroundTask() {
  try {
    if (typeof TaskManager.isTaskRegisteredAsync === 'function') {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      }
    }
    // Clear persisted scheduling metadata so we don't attempt to restore after explicit unregister.
    await clearNextRunMetadata();
  } catch (e) {
    console.warn('Background task unregistration skipped:', (e as Error).message);
  }
}

/**
 * Ensures the background task is registered (best-effort on supported platforms).
 */
export async function ensureBackgroundTaskRegistered() {
  if (Platform.OS === 'web') {
    return;
  }
 
  try {
    if (!(await safeIsTaskManagerAvailable())) {
      return;
    }
 
    if (typeof TaskManager.isTaskRegisteredAsync === 'function') {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      if (isRegistered) {
        // Restore system scheduler preference from metadata if available.
        const meta = await getNextRunMetadata();
        if (meta && typeof BackgroundFetch.setMinimumIntervalAsync === 'function') {
          try {
            await BackgroundFetch.setMinimumIntervalAsync(meta.scheduledIntervalSeconds || ANDROID_SCHEDULER_MIN_INTERVAL);
          } catch {
            // ignore
          }
        }
        return;
      }
    }
 
    await registerBackgroundTask();
 
    // After registration, attempt to restore scheduling prefs from stored metadata.
    const restored = await getNextRunMetadata();
    if (restored && typeof BackgroundFetch.setMinimumIntervalAsync === 'function') {
      try {
        await BackgroundFetch.setMinimumIntervalAsync(restored.scheduledIntervalSeconds || ANDROID_SCHEDULER_MIN_INTERVAL);
      } catch {
        // ignore
      }
    }
  } catch (e) {
    console.warn('Background task ensure registration skipped:', (e as Error).message);
  }
}

/**
 * Helper that safely checks TaskManager availability without throwing on web.
 */
export async function safeIsTaskManagerAvailable(): Promise<boolean> {
  try {
    if (typeof TaskManager.isAvailableAsync === 'function') {
      return await TaskManager.isAvailableAsync();
    }
    return (
      typeof TaskManager.defineTask === 'function' &&
      typeof TaskManager.isTaskRegisteredAsync === 'function'
    );
  } catch {
    return false;
  }
}