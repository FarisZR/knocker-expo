import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import MainScreen from './MainScreen';
import * as SecureStore from 'expo-secure-store';
import * as Knocker from '../services/knocker';

jest.mock('expo-secure-store');
jest.mock('../services/knocker');

const mockKnock = Knocker.knock as jest.Mock;
const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;

describe('MainScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should automatically knock and display whitelist status on successful load', async () => {
    mockGetItemAsync
      .mockResolvedValueOnce('http://localhost:8080')
      .mockResolvedValueOnce('test-token');
    mockKnock.mockResolvedValue({
      whitelisted_entry: '127.0.0.1',
      expires_in_seconds: 3600,
    });

    render(<MainScreen />);

    // Wait for the automatic knock to complete
    await waitFor(() => {
      expect(screen.getByText(/Whitelisted: 127.0.0.1/)).toBeTruthy();
      expect(screen.getByText(/Expires in: 3600 seconds/)).toBeTruthy();
    });

    // Verify that knock was called automatically
    expect(mockKnock).toHaveBeenCalledWith('http://localhost:8080', 'test-token');
    expect(mockKnock).toHaveBeenCalledTimes(1);
  });

  it('should display an error message if automatic knock fails', async () => {
    mockGetItemAsync
      .mockResolvedValueOnce('http://localhost:8080')
      .mockResolvedValueOnce('test-token');
    mockKnock.mockRejectedValue(new Error('Auto-Knock Failed'));

    render(<MainScreen />);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Error: Auto-Knock Failed')).toBeTruthy();
    });
    expect(mockKnock).toHaveBeenCalledTimes(1);
  });

  it('should display a message if credentials are not set', async () => {
    mockGetItemAsync.mockResolvedValue(null);

    render(<MainScreen />);

    await waitFor(() => {
      expect(screen.getByText('Credentials not set. Go to Setup.')).toBeTruthy();
    });
    expect(mockKnock).not.toHaveBeenCalled();
  });

  it('should perform a manual knock successfully when the button is pressed', async () => {
    mockGetItemAsync
      .mockResolvedValueOnce('http://localhost:8080')
      .mockResolvedValueOnce('test-token');
    // Mock the initial automatic knock
    mockKnock.mockResolvedValueOnce({
      whitelisted_entry: '1.1.1.1',
      expires_in_seconds: 10,
    });

    render(<MainScreen />);

    // Wait for the initial knock to finish
    await waitFor(() => expect(screen.getByText(/Whitelisted: 1.1.1.1/)).toBeTruthy());
    expect(mockKnock).toHaveBeenCalledTimes(1);

    // Setup mock for the manual knock
    mockKnock.mockResolvedValueOnce({
      whitelisted_entry: '8.8.8.8',
      expires_in_seconds: 7200,
    });

    fireEvent.press(screen.getByText('Knock'));

    // Check for loading state on manual knock
    expect(screen.getByText('Knocking...')).toBeTruthy();

    // Wait for the manual knock to complete
    await waitFor(() => {
      expect(screen.getByText(/Whitelisted: 8.8.8.8/)).toBeTruthy();
      expect(screen.getByText(/Expires in: 7200 seconds/)).toBeTruthy();
    });

    expect(mockKnock).toHaveBeenCalledTimes(2);
    expect(mockKnock).toHaveBeenLastCalledWith('http://localhost:8080', 'test-token');
  });
});