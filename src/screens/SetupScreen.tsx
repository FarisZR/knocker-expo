import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, useColorScheme, ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { setItem, getItem } from '../services/storage';
import { registerBackgroundTask, unregisterBackgroundTask } from '../services/backgroundKnocker';
import { StyledView } from '../../components/ui/StyledView';
import { StyledText } from '../../components/ui/StyledText';
import { StyledTextInput } from '../../components/ui/StyledTextInput';
import { StyledButton } from '../../components/ui/StyledButton';
import StyledCard from '../../components/ui/StyledCard';
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
    outer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
      maxWidth: 900,
      width: '100%',
      alignSelf: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 12,
    },
    title: {
      fontSize: 40,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 28,
      letterSpacing: -0.5,
    },
    groupLabel: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.75,
      textTransform: 'uppercase',
      marginBottom: 8,
      letterSpacing: 1,
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <StyledView style={styles.outer}>
          <StyledText style={styles.title}>Configuration</StyledText>
          <StyledCard animated>
            <StyledText style={styles.groupLabel}>Connection</StyledText>
            <StyledTextInput
              placeholder="Knocker Endpoint"
              value={endpoint}
              onChangeText={setEndpoint}
              autoCapitalize="none"
              autoCorrect={false}
              variant="outlined"
            />
            <StyledTextInput
              placeholder="Token"
              value={token}
              onChangeText={setToken}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              variant="outlined"
            />
            <StyledText style={styles.groupLabel}>Options</StyledText>
            <StyledTextInput
              placeholder="TTL (seconds, optional)"
              value={ttl}
              onChangeText={setTtl}
              keyboardType="numeric"
              variant="filled"
            />
            <StyledTextInput
              placeholder="IP Address/CIDR (optional)"
              value={ipAddress}
              onChangeText={setIpAddress}
              autoCapitalize="none"
              variant="filled"
            />
            <View style={styles.row}>
              <StyledText>Background Service</StyledText>
              <Switch
                value={isBackgroundServiceEnabled}
                onValueChange={setIsBackgroundServiceEnabled}
                trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
                thumbColor={isBackgroundServiceEnabled ? Colors[colorScheme ?? 'light'].tint : '#f4f3f4'}
              />
            </View>
            <StyledButton title="Save Settings" onPress={handleSave} variant="filled" />
          </StyledCard>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SetupScreen;