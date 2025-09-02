import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import SetupScreen from './SetupScreen';
import * as SecureStore from 'expo-secure-store';
import * as BackgroundKnocker from '../services/backgroundKnocker';

jest.mock('expo-secure-store');
jest.mock('../services/backgroundKnocker');

const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockRegisterBackgroundTask = BackgroundKnocker.registerBackgroundTask as jest.Mock;
const mockUnregisterBackgroundTask = BackgroundKnocker.unregisterBackgroundTask as jest.Mock;

describe('SetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the setup form', () => {
    render(<SetupScreen />);

    expect(screen.getByPlaceholderText('Knocker Endpoint')).toBeTruthy();
    expect(screen.getByPlaceholderText('Token')).toBeTruthy();
    expect(screen.getByPlaceholderText('TTL (seconds, optional)')).toBeTruthy();
    expect(screen.getByPlaceholderText('IP Address/CIDR (optional)')).toBeTruthy();
    expect(screen.getByText('Save Settings')).toBeTruthy();
    expect(screen.getByText('Background Service')).toBeTruthy();
  });

  it('should save the form data to secure store', async () => {
    render(<SetupScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Knocker Endpoint'), 'http://localhost:8080');
    fireEvent.changeText(screen.getByPlaceholderText('Token'), 'test-token');
    await fireEvent.press(screen.getByText('Save Settings'));

    expect(mockSetItemAsync).toHaveBeenCalledWith('knocker-endpoint', 'http://localhost:8080');
    expect(mockSetItemAsync).toHaveBeenCalledWith('knocker-token', 'test-token');
  });

  it('should register the background task when the switch is enabled', async () => {
    render(<SetupScreen />);
    
    fireEvent(screen.getByRole('switch'), 'onValueChange', true);
    await fireEvent.press(screen.getByText('Save Settings'));

    expect(mockRegisterBackgroundTask).toHaveBeenCalled();
    expect(mockSetItemAsync).toHaveBeenCalledWith('background-service-enabled', 'true');
  });

  it('should unregister the background task when the switch is disabled', async () => {
    // Start with it enabled
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('true');
    render(<SetupScreen />);

    fireEvent(screen.getByRole('switch'), 'onValueChange', false); // This will toggle it off
    await fireEvent.press(screen.getByText('Save Settings'));

    expect(mockUnregisterBackgroundTask).toHaveBeenCalled();
    expect(mockSetItemAsync).toHaveBeenCalledWith('background-service-enabled', 'false');
  });
});