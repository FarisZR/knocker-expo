import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { knock } from '../services/knocker';

const MainScreen = () => {
  const [status, setStatus] = useState('');
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleKnock = async (knockEndpoint: string, knockToken: string) => {
      try {
        setStatus('Knocking...');
        const result = await knock(knockEndpoint, knockToken);
        setStatus(`Whitelisted: ${result.whitelisted_entry}\nExpires in: ${result.expires_in_seconds} seconds`);
      } catch (error: any) {
        setStatus(`Error: ${error.message}`);
      }
  };

  useEffect(() => {
    const loadAndKnock = async () => {
      const storedEndpoint = await SecureStore.getItemAsync('knocker-endpoint');
      const storedToken = await SecureStore.getItemAsync('knocker-token');
      setEndpoint(storedEndpoint);
      setToken(storedToken);

      if (storedEndpoint && storedToken) {
        await handleKnock(storedEndpoint, storedToken);
      } else {
        setStatus('Credentials not set. Go to Setup.');
      }
    };
    loadAndKnock();
  }, []);

  const onManualKnock = () => {
      if (endpoint && token) {
          handleKnock(endpoint, token);
      }
  }

  return (
    <View style={styles.container}>
      <Button title="Knock" onPress={onManualKnock} />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  status: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default MainScreen;