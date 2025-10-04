import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import MainScreen from './MainScreen';
import * as SecureStore from 'expo-secure-store';
import * as Knocker from '../services/knocker';
import {
  initializeNotificationService,
  hasNotificationPermissions,
  requestNotificationPermissions,
} from '../services/notifications';
import * as BackgroundKnocker from '../services/backgroundKnocker';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../services/knocker');

jest.mock('../services/notifications', () => ({
  initializeNotificationService: jest.fn().mockResolvedValue(undefined),
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

const mockKnock = Knocker.knock as jest.Mock;
const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockRequestNotificationPermissions = requestNotificationPermissions as jest.Mock;
const mockHasNotificationPermissions = hasNotificationPermissions as jest.Mock;
const mockInitializeNotificationService = initializeNotificationService as jest.Mock;

const mockEnsureBackgroundTaskRegistered = BackgroundKnocker.ensureBackgroundTaskRegistered as jest.Mock;
const mockGetLastBackgroundRunMetadata = BackgroundKnocker.getLastBackgroundRunMetadata as jest.Mock;
const mockGetBackgroundNotificationsEnabled = BackgroundKnocker.getBackgroundNotificationsEnabled as jest.Mock;

describe('MainScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetItemAsync.mockReset();
    mockGetItemAsync.mockResolvedValue(null);

    mockKnock.mockReset();
    mockRequestNotificationPermissions.mockReset();
    mockHasNotificationPermissions.mockReset().mockResolvedValue(false);
    mockInitializeNotificationService.mockReset().mockResolvedValue(undefined);

    mockEnsureBackgroundTaskRegistered.mockReset().mockResolvedValue(undefined);
    mockGetLastBackgroundRunMetadata.mockReset().mockResolvedValue(null);
    mockGetBackgroundNotificationsEnabled.mockReset().mockResolvedValue(true);
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
});