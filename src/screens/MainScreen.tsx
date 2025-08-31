import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { getItem } from '../services/storage';
import { knock } from '../services/knocker';
import { StyledView } from '../../components/ui/StyledView';
import { StyledText } from '../../components/ui/StyledText';
import { StyledButton } from '../../components/ui/StyledButton';

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
      const storedEndpoint = await getItem('knocker-endpoint');
      const storedToken = await getItem('knocker-token');
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
    <StyledView style={styles.container}>
      <StyledText style={styles.title}>Knocker</StyledText>
      <StyledButton title="Knock" onPress={onManualKnock} />
      <StyledText style={styles.status}>{status}</StyledText>
    </StyledView>
  );
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
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 48,
    textAlign: 'center',
  },
  status: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});

export default MainScreen;