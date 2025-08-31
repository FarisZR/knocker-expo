import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Switch } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { registerBackgroundTask, unregisterBackgroundTask } from '../services/backgroundKnocker';

const SetupScreen = () => {
  const [endpoint, setEndpoint] = useState('');
  const [token, setToken] = useState('');
  const [ttl, setTtl] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isBackgroundServiceEnabled, setIsBackgroundServiceEnabled] = useState(false);


  const handleSave = async () => {
    await SecureStore.setItemAsync('knocker-endpoint', endpoint);
    await SecureStore.setItemAsync('knocker-token', token);
    await SecureStore.setItemAsync('knocker-ttl', ttl);
    await SecureStore.setItemAsync('knocker-ip', ipAddress);
    await SecureStore.setItemAsync('background-service-enabled', isBackgroundServiceEnabled.toString());

    if (isBackgroundServiceEnabled) {
      await registerBackgroundTask();
    } else {
      await unregisterBackgroundTask();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Knocker Endpoint"
        value={endpoint}
        onChangeText={setEndpoint}
      />
      <TextInput
        style={styles.input}
        placeholder="Token"
        value={token}
        onChangeText={setToken}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="TTL (optional)"
        value={ttl}
        onChangeText={setTtl}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IP Address/CIDR (optional)"
        value={ipAddress}
        onChangeText={setIpAddress}
      />
      <View style={styles.switchContainer}>
        <Text>Enable Background Service</Text>
        <Switch
          value={isBackgroundServiceEnabled}
          onValueChange={setIsBackgroundServiceEnabled}
        />
      </View>
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default SetupScreen;