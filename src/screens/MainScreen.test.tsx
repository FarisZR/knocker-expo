// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { startActivityAsync } from 'expo-intent-launcher';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Platform } from 'react-native';
import * as BackgroundKnocker from '../services/backgroundKnocker';
import * as Knocker from '../services/knocker';
import {
  hasNotificationPermissions,
  initializeNotificationService,
  requestNotificationPermissions,
} from '../services/notifications';
import MainScreen from './MainScreen';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../services/knocker');

jest.mock('../services/notifications', () => ({
  initializeNotificationService: jest.fn().mockResolvedValue(true),
  hasNotificationPermissions: jest.fn().mockResolvedValue(false),
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
}));

jest.mock('../services/backgroundKnocker', () => {
  const actual = jest.requireActual('../services/backgroundKnocker');
  return {
    ...actual,
    registerBackgroundTask: jest.fn().mockResolvedValue(undefined),
    unregisterBackgroundTask: jest.fn().mockResolvedValue(undefined),
    ensureBackgroundTaskRegistered: jest.fn().mockResolvedValue(undefined),
    getLastBackgroundRunMetadata: jest.fn().mockResolvedValue(null),
    getBackgroundNotificationsEnabled: jest.fn().mockResolvedValue(true),
    setBackgroundNotificationsEnabled: jest.fn().mockResolvedValue(undefined),
    clearBackgroundRunMetadata: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('expo-intent-launcher', () => ({
  __esModule: true,
  ActivityAction: {
    IGNORE_BATTERY_OPTIMIZATION_SETTINGS: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
  },
  startActivityAsync: jest.fn(),
}));

const mockKnock = Knocker.knock as jest.Mock;
const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockRequestNotificationPermissions = requestNotificationPermissions as jest.Mock;
const mockHasNotificationPermissions = hasNotificationPermissions as jest.Mock;
const mockInitializeNotificationService = initializeNotificationService as jest.Mock;

const mockEnsureBackgroundTaskRegistered = BackgroundKnocker.ensureBackgroundTaskRegistered as jest.Mock;
const mockGetLastBackgroundRunMetadata = BackgroundKnocker.getLastBackgroundRunMetadata as jest.Mock;
const mockGetBackgroundNotificationsEnabled = BackgroundKnocker.getBackgroundNotificationsEnabled as jest.Mock;
const mockStartActivityAsync = startActivityAsync as jest.Mock;

describe('MainScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetItemAsync.mockReset();
    mockGetItemAsync.mockResolvedValue(null);

    mockKnock.mockReset();
  mockRequestNotificationPermissions.mockReset();
  mockHasNotificationPermissions.mockReset().mockResolvedValue(false);
  mockInitializeNotificationService.mockReset().mockResolvedValue(true);

    mockEnsureBackgroundTaskRegistered.mockReset().mockResolvedValue(undefined);
    mockGetLastBackgroundRunMetadata.mockReset().mockResolvedValue(null);
    mockGetBackgroundNotificationsEnabled.mockReset().mockResolvedValue(true);
    mockStartActivityAsync.mockClear();
  });

  const primeCredentials = (endpoint: string, token: string) => {
    mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(endpoint));
    mockGetItemAsync.mockImplementationOnce(() => Promise.resolve(token));
  };

  it('should automatically knock and display whitelist status on successful load', async () => {
    primeCredentials('http://localhost:8080', 'test-token');
    mockKnock.mockResolvedValue({
      whitelisted_entry: '127.0.0.1',
      expires_in_seconds: 3600,
    });

    render(<MainScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Whitelisted: 127\.0\.0\.1/)).toBeTruthy();
      expect(screen.getByText(/Expires in: 3600 seconds/)).toBeTruthy();
    });

    expect(mockKnock).toHaveBeenCalledWith('http://localhost:8080', 'test-token', expect.any(Object));
    expect(mockKnock).toHaveBeenCalledTimes(1);
    expect(mockInitializeNotificationService).toHaveBeenCalledTimes(1);
    expect(mockRequestNotificationPermissions).not.toHaveBeenCalled();
  });

  it('should display an error message if automatic knock fails', async () => {
    primeCredentials('http://localhost:8080', 'test-token');
    mockKnock.mockRejectedValue(new Error('Auto-Knock Failed'));

    render(<MainScreen />);

    await waitFor(() => {
      expect(screen.getByText('Error: Auto-Knock Failed')).toBeTruthy();
    });
    expect(mockKnock).toHaveBeenCalledTimes(1);
  });

  it('should display a message if credentials are not set', async () => {
    render(<MainScreen />);

    await waitFor(() => {
      expect(screen.getByText('Credentials not set. Expand Settings to configure.')).toBeTruthy();
    });
    expect(mockKnock).not.toHaveBeenCalled();
  });

  it('should perform a manual knock successfully when the button is pressed', async () => {
    primeCredentials('http://localhost:8080', 'test-token');

    mockKnock.mockResolvedValueOnce({
      whitelisted_entry: '1.1.1.1',
      expires_in_seconds: 10,
    });

    render(<MainScreen />);

    await waitFor(() => expect(screen.getByText(/Whitelisted: 1\.1\.1\.1/)).toBeTruthy());
    expect(mockKnock).toHaveBeenCalledTimes(1);

    mockKnock.mockResolvedValueOnce({
      whitelisted_entry: '8.8.8.8',
      expires_in_seconds: 7200,
    });

    const knockButton = screen.getByText(/Knock Again/);
    fireEvent.press(knockButton);

    await waitFor(() => {
      expect(mockKnock).toHaveBeenCalledTimes(2);
    });

    expect(mockKnock).toHaveBeenLastCalledWith('http://localhost:8080', 'test-token', expect.any(Object));
    expect(mockRequestNotificationPermissions).toHaveBeenCalledTimes(1);
  });

  it('surfaces Android battery optimization guidance when the last background knock failed', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });

    mockGetItemAsync.mockImplementation((key: string) => {
      switch (key) {
        case 'background-service-enabled':
          return Promise.resolve('true');
        case 'settings-open':
          return Promise.resolve('true');
        default:
          return Promise.resolve(null);
      }
    });

    const metadata = {
      timestamp: new Date().toISOString(),
      status: 'failed' as const,
      detail: 'Network timeout',
    };
    mockGetLastBackgroundRunMetadata.mockResolvedValue(metadata);

    render(<MainScreen />);

    await waitFor(() => {
      expect(screen.getByText('Background knock failed during the last run. Open the app to retry.')).toBeTruthy();
    });

    expect(
      screen.getByText('Android may be stopping Knocker in the background. Disable battery optimizations for Knocker to improve reliability.')
    ).toBeTruthy();

    const button = screen.getByText('Open battery optimization settings');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockStartActivityAsync).toHaveBeenCalledWith('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
    });

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => originalOS,
    });

    mockGetItemAsync.mockImplementation(() => Promise.resolve(null));
  });
});