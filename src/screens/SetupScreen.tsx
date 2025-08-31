import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, useColorScheme, Platform } from 'react-native';
import { setItem, getItem } from '../services/storage';
import { registerBackgroundTask, unregisterBackgroundTask } from '../services/backgroundKnocker';
import { StyledView } from '../../components/ui/StyledView';
import { StyledText } from '../../components/ui/StyledText';
import { StyledTextInput } from '../../components/ui/StyledTextInput';
import { StyledButton } from '../../components/ui/StyledButton';
import { Colors } from '../../constants/Colors';

const SetupScreen = () => {
  const [endpoint, setEndpoint] = useState('');
  const [token, setToken] = useState('');
  const [ttl, setTtl] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isBackgroundServiceEnabled, setIsBackgroundServiceEnabled] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadSettings = async () => {
      const storedEndpoint = await getItem('knocker-endpoint');
      const storedToken = await getItem('knocker-token');
      const storedTtl = await getItem('knocker-ttl');
      const storedIp = await getItem('knocker-ip');
      const storedBackgroundService = await getItem('background-service-enabled');

      if (storedEndpoint) setEndpoint(storedEndpoint);
      if (storedToken) setToken(storedToken);
      if (storedTtl) setTtl(storedTtl);
      if (storedIp) setIpAddress(storedIp);
      setIsBackgroundServiceEnabled(storedBackgroundService === 'true');
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    await setItem('knocker-endpoint', endpoint);
    await setItem('knocker-token', token);
    await setItem('knocker-ttl', ttl);
    await setItem('knocker-ip', ipAddress);
    await setItem('background-service-enabled', isBackgroundServiceEnabled.toString());

    if (isBackgroundServiceEnabled) {
      await registerBackgroundTask();
    } else {
      await unregisterBackgroundTask();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 24,
      textAlign: 'center',
    },
  });

  return (
    <StyledView style={styles.container}>
      <StyledText style={styles.title}>Settings</StyledText>
      <StyledTextInput
        placeholder="Knocker Endpoint"
        value={endpoint}
        onChangeText={setEndpoint}
      />
      <StyledTextInput
        placeholder="Token"
        value={token}
        onChangeText={setToken}
        secureTextEntry
      />
      <StyledTextInput
        placeholder="TTL (optional)"
        value={ttl}
        onChangeText={setTtl}
        keyboardType="numeric"
      />
      <StyledTextInput
        placeholder="IP Address/CIDR (optional)"
        value={ipAddress}
        onChangeText={setIpAddress}
      />
      <StyledView style={styles.switchContainer}>
        <StyledText>Enable Background Service</StyledText>
        <Switch
          value={isBackgroundServiceEnabled}
          onValueChange={setIsBackgroundServiceEnabled}
          trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
          thumbColor={isBackgroundServiceEnabled ? Colors[colorScheme ?? 'light'].tint : '#f4f3f4'}
        />
      </StyledView>
      <StyledButton title="Save" onPress={handleSave} />
    </StyledView>
  );
};

export default SetupScreen;