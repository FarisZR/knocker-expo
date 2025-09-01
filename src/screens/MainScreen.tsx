import React, { useState, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getItem } from '../services/storage';
import { knock } from '../services/knocker';
import { StyledView } from '../../components/ui/StyledView';
import { StyledText } from '../../components/ui/StyledText';
import { StyledButton } from '../../components/ui/StyledButton';
import StyledCard from '../../components/ui/StyledCard';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

const MainScreen = () => {
  const [status, setStatus] = useState('');
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lastKnock, setLastKnock] = useState<Date | null>(null);

  // Dynamic pill theming
  const pillBg = useThemeColor(
    { light: Colors.light.surfaceVariant, dark: Colors.dark.surfaceVariant },
    'background'
  );
  const pillErrorBg = useThemeColor(
    { light: '#FEE4E2', dark: Colors.dark.errorContainer },
    'background'
  );
  const pillBorder = useThemeColor(
    { light: Colors.light.outlineVariant, dark: Colors.dark.outlineVariant },
    'text'
  );

  const statusOpacity = useRef(new Animated.Value(0)).current;

  const animateStatus = () => {
    statusOpacity.setValue(0);
    Animated.timing(statusOpacity, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleKnock = async (knockEndpoint: string, knockToken: string) => {
    try {
      setStatus('Knocking...');
      animateStatus();
      const result = await knock(knockEndpoint, knockToken);
      setStatus(`Whitelisted: ${result.whitelisted_entry}\nExpires in: ${result.expires_in_seconds} seconds`);
      setLastKnock(new Date());
      animateStatus();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      animateStatus();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const loadAndKnock = async () => {
        const storedEndpoint = await getItem('knocker-endpoint');
        const storedToken = await getItem('knocker-token');
        if (!isActive) return;
        setEndpoint(storedEndpoint);
        setToken(storedToken);

        if (storedEndpoint && storedToken) {
          await handleKnock(storedEndpoint, storedToken);
        } else {
          setStatus('Credentials not set. Go to Setup.');
          animateStatus();
        }
      };
      loadAndKnock();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const onManualKnock = () => {
    if (endpoint && token) {
      handleKnock(endpoint, token);
    }
  };

  const isError = status.startsWith('Error') || status.startsWith('Credentials not set');

  return (
    <StyledView style={styles.outer}>
      <Animated.Text style={[styles.gradientTitle]} accessibilityRole="header">
        Knocker
      </Animated.Text>
      <StyledCard animated>
        <StyledButton
          title={endpoint && token ? 'Knock Again' : 'Knock'}
          onPress={onManualKnock}
          pulse={!!(endpoint && token)}
          variant="filled"
        />
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: isError ? pillErrorBg : pillBg,
              borderColor: pillBorder,
              opacity: statusOpacity,
            },
          ]}
        >
          <StyledText style={[styles.statusText, isError && styles.error]}>
            {status}
          </StyledText>
          {!isError && lastKnock && (
            <StyledText style={styles.meta}>
              Last knock: {lastKnock.toLocaleTimeString()}
            </StyledText>
          )}
        </Animated.View>
      </StyledCard>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 24,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  gradientTitle: {
    fontSize: 54,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    color: '#0a7ea4',
  },
  statusText: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 0,
  },
  pill: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  error: {
    color: Colors.light.danger,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
});

export default MainScreen;