import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { t } from './localization';

const ANDROID_CHANNEL_ID = 'background-knocker-success';

let handlerConfigured = false;

export type NotificationErrorReporter = (error: unknown) => void;

let notificationErrorReporter: NotificationErrorReporter | undefined;

export function setNotificationErrorReporter(reporter?: NotificationErrorReporter) {
  notificationErrorReporter = reporter;
}

function ensureNotificationHandlerConfigured() {
  if (handlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });

  handlerConfigured = true;
}

async function ensureAndroidChannelAsync(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Knocker background status',
      importance: Notifications.AndroidImportance.MIN,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      sound: undefined,
      vibrationPattern: [0],
      enableVibrate: false,
      enableLights: false,
    });
    return true;
  } catch (e) {
    // Fail gracefully during app startup — log details in dev only to avoid
    // noisy reports in production. Use console.error because there is no
    // centralized logger in this project.
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('Failed to create Android notification channel:', e);
    }
    return false;
  }
}

function logNotificationSchedulingFailure(error: unknown) {
  // Prefer a centralized logger when available.
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('Failed to schedule background success notification:', error);
  }

  const reporter = notificationErrorReporter;
  if (typeof reporter === 'function') {
    try {
      reporter(error);
    } catch (reportError) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('Non-fatal notification error reporter failed:', reportError);
      }
    }
  }
}

function isPermissionGranted(status: Notifications.NotificationPermissionsStatus): boolean {
  if (!status) {
    return false;
  }

  if (status.granted) {
    return true;
  }

  if (Platform.OS === 'ios' && status.ios) {
    return (
      status.ios.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      status.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }

  return false;
}

export async function initializeNotificationService(): Promise<boolean> {
  ensureNotificationHandlerConfigured();
  return ensureAndroidChannelAsync();
}

export async function hasNotificationPermissions(): Promise<boolean> {
  ensureNotificationHandlerConfigured();
  const current = await Notifications.getPermissionsAsync();
  return isPermissionGranted(current);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  ensureNotificationHandlerConfigured();

  const existing = await Notifications.getPermissionsAsync();
  if (isPermissionGranted(existing)) {
    return ensureAndroidChannelAsync();
  }

  const response = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
      provideAppNotificationSettings: false,
      allowCriticalAlerts: false,
      allowProvisional: true,
    },
  });

  if (!isPermissionGranted(response)) {
    return false;
  }

  return ensureAndroidChannelAsync();
}

export interface BackgroundSuccessNotificationPayload {
  endpoint: string;
  whitelistedEntry: string;
  expiresInSeconds?: number;
}

export async function sendBackgroundSuccessNotification(
  payload: BackgroundSuccessNotificationPayload
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  if (!(await hasNotificationPermissions())) {
    return;
  }

  const channelConfigured = await ensureAndroidChannelAsync();
  if (!channelConfigured) {
    logNotificationSchedulingFailure(
      new Error('Android notification channel is unavailable; notification will not be scheduled.')
    );
    return;
  }

  const title = t('background.success');
  const expiryText =
    typeof payload.expiresInSeconds === 'number'
      ? t('background.expiresIn', { seconds: payload.expiresInSeconds })
      : t('background.expiryUnknown');
  const body = t('background.body', {
    whitelistedEntry: payload.whitelistedEntry,
    expiry: expiryText,
  });

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'background-knock-success',
          endpoint: payload.endpoint,
          whitelistedEntry: payload.whitelistedEntry,
          expiresInSeconds: payload.expiresInSeconds,
        },
        sound: undefined,
        priority: Notifications.AndroidNotificationPriority.MIN,
      },
      trigger: null,
    });
  } catch (error) {
    logNotificationSchedulingFailure(error);
  }
}