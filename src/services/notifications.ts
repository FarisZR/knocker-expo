import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'background-knocker-success';

let handlerConfigured = false;

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

async function ensureAndroidChannelAsync() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Knocker background status',
    importance: Notifications.AndroidImportance.MIN,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.Private,
    sound: null,
    vibrationPattern: [0],
    enableVibrate: false,
    enableLights: false,
  });
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

export async function initializeNotificationService(): Promise<void> {
  ensureNotificationHandlerConfigured();
  await ensureAndroidChannelAsync();
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
    await ensureAndroidChannelAsync();
    return true;
  }

  const response = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
      allowAnnouncements: false,
      provideAppNotificationSettings: false,
      allowCriticalAlerts: false,
      allowProvisional: true,
    },
  });

  const granted = isPermissionGranted(response);
  if (granted) {
    await ensureAndroidChannelAsync();
  }
  return granted;
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

  await ensureAndroidChannelAsync();

  const expires =
    typeof payload.expiresInSeconds === 'number'
      ? `Expires in ${payload.expiresInSeconds} seconds`
      : 'Expiry unknown';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Background knock succeeded',
      body: `${payload.whitelistedEntry} – ${expires}`,
      data: {
        type: 'background-knock-success',
        endpoint: payload.endpoint,
        whitelistedEntry: payload.whitelistedEntry,
        expiresInSeconds: payload.expiresInSeconds,
      },
      sound: null,
      priority: Notifications.AndroidNotificationPriority.MIN,
    },
    trigger: null,
  });
}