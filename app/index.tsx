import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  View,
  Switch,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  useColorScheme,
} from 'react-native';
import { StyledView } from '../components/ui/StyledView';
import { StyledText } from '../components/ui/StyledText';
import { StyledButton } from '../components/ui/StyledButton';
import StyledCard from '../components/ui/StyledCard';
import { StyledTextInput } from '../components/ui/StyledTextInput';
import { Colors } from '../constants/Colors';
import { getItem, setItem } from '../src/services/storage';
import { registerBackgroundTask, unregisterBackgroundTask } from '../src/services/backgroundKnocker';
import { knock } from '../src/services/knocker';
import { getKnockOptions } from '../src/services/knockOptions';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  // Enable LayoutAnimation on Android
  // @ts-ignore
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [status, setStatus] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [token, setToken] = useState('');
  const [ttl, setTtl] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isBackgroundServiceEnabled, setIsBackgroundServiceEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [lastKnock, setLastKnock] = useState<Date | null>(null);

  const statusOpacity = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(1)).current; // 1 = open, 0 = closed

  // Theme-aware colors (ensure readable error background/text in both themes)
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  // Use the onErrorContainer token when available so text contrasts the errorContainer background
  const errorTextColor = theme.onErrorContainer ?? (colorScheme === 'dark' ? '#ffffff' : Colors.light.error);
 
  const pillBg = theme.surfaceVariant;
  const pillErrorBg = theme.errorContainer;
  const pillBorder = theme.outlineVariant;

  const animateStatus = () => {
    statusOpacity.setValue(0);
    Animated.timing(statusOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleKnock = async (knockEndpoint: string, knockToken: string, options?: { ttl?: number; ip_address?: string }) => {
    try {
      setStatus('Knocking...');
      animateStatus();
      const result = await knock(knockEndpoint, knockToken, options);
      setStatus(`Whitelisted: ${result.whitelisted_entry}\nExpires in: ${result.expires_in_seconds} seconds`);
      setLastKnock(new Date());
      animateStatus();
    } catch (error: any) {
      setStatus(`Error: ${error.message ?? String(error)}`);
      animateStatus();
    }
  };

  useEffect(() => {
    const load = async () => {
      const storedEndpoint = await getItem('knocker-endpoint');
      const storedToken = await getItem('knocker-token');
      const storedTtl = await getItem('knocker-ttl');
      const storedIp = await getItem('knocker-ip');
      const storedBackground = await getItem('background-service-enabled');
      const storedSettingsOpen = await getItem('settings-open');

      if (storedEndpoint) setEndpoint(storedEndpoint);
      if (storedToken) setToken(storedToken);
      if (storedTtl) setTtl(storedTtl);
      if (storedIp) setIpAddress(storedIp);
      setIsBackgroundServiceEnabled(storedBackground === 'true');

      if (storedSettingsOpen !== null) {
        setSettingsOpen(storedSettingsOpen === 'true');
        settingsAnim.setValue(storedSettingsOpen === 'true' ? 1 : 0);
      } else {
        // Default: open if credentials missing
        const shouldOpen = !(storedEndpoint && storedToken);
        setSettingsOpen(shouldOpen);
        settingsAnim.setValue(shouldOpen ? 1 : 0);
      }

      // If credentials exist, perform an initial knock
      if (storedEndpoint && storedToken) {
        const options = await getKnockOptions();
        await handleKnock(storedEndpoint, storedToken, options);
      } else {
        setStatus('Credentials not set. Expand Settings to configure.');
        animateStatus();
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onManualKnock = async () => {
    if (endpoint && token) {
      const options = await getKnockOptions();
      await handleKnock(endpoint, token, options);
    }
  };

  const toggleSettings = async (open?: boolean) => {
    const next = typeof open === 'boolean' ? open : !settingsOpen;
    // Smooth native layout change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSettingsOpen(next);
    Animated.timing(settingsAnim, {
      toValue: next ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    await setItem('settings-open', next.toString());
  };

  const handleSave = async () => {
    await setItem('knocker-endpoint', endpoint);
    await setItem('knocker-token', token);
    await setItem('knocker-ttl', ttl);
    await setItem('knocker-ip', ipAddress);
    await setItem('background-service-enabled', isBackgroundServiceEnabled.toString());

    // Background task registration should not run on web
    if (Platform.OS !== 'web') {
      if (isBackgroundServiceEnabled) {
        await registerBackgroundTask();
      } else {
        await unregisterBackgroundTask();
      }
    }

    // Auto-knock after save if credentials present
    if (endpoint && token) {
      const options = await getKnockOptions();
      await handleKnock(endpoint, token, options);
      // close settings after successful save
      await toggleSettings(false);
    } else {
      setStatus('Credentials not set. Please fill endpoint & token.');
      animateStatus();
      // ensure settings open so user can edit
      await toggleSettings(true);
    }
  };

  const isError = status.startsWith('Error') || status.startsWith('Credentials not set');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <StyledView style={styles.outer}>
          <StyledText style={styles.title}>Knocker</StyledText>

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
              <StyledText style={[styles.statusText, isError ? { color: errorTextColor } : undefined]}>{status}</StyledText>
              {!isError && lastKnock && <StyledText style={styles.meta}>Last knock: {lastKnock.toLocaleTimeString()}</StyledText>}
            </Animated.View>

            <TouchableOpacity onPress={() => toggleSettings()} style={styles.settingsToggle}>
              <StyledText style={styles.settingsToggleText}>{settingsOpen ? 'Hide settings' : 'Show settings'}</StyledText>
              <StyledText style={styles.chev}>{settingsOpen ? '▴' : '▾'}</StyledText>
            </TouchableOpacity>

            {/* Settings panel */}
            <Animated.View
              style={[
                styles.settingsPanel,
                {
                  // interpolate height between 0 and 1 and allow content to layout naturally
                  opacity: settingsAnim,
                  maxHeight: settingsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }) as any,
                },
              ]}
            >
              <StyledText style={styles.groupLabel}>Connection</StyledText>
              <StyledTextInput placeholder="Knocker Endpoint" value={endpoint} onChangeText={setEndpoint} autoCapitalize="none" autoCorrect={false} variant="outlined" />
              <StyledTextInput placeholder="Token" value={token} onChangeText={setToken} secureTextEntry autoCapitalize="none" autoCorrect={false} variant="outlined" />

              <StyledText style={styles.groupLabel}>Options</StyledText>
              <StyledTextInput placeholder="TTL (seconds, optional)" value={ttl} onChangeText={setTtl} keyboardType="numeric" variant="filled" />
              <StyledTextInput placeholder="IP Address/CIDR (optional)" value={ipAddress} onChangeText={setIpAddress} autoCapitalize="none" variant="filled" />

              {/* Hide background switch on web */}
              {Platform.OS !== 'web' && (
                <View style={styles.row}>
                  <StyledText>Background Service</StyledText>
                  <Switch
                    value={isBackgroundServiceEnabled}
                    onValueChange={setIsBackgroundServiceEnabled}
                    trackColor={{ false: '#767577', true: Colors.light.tint }}
                    thumbColor={isBackgroundServiceEnabled ? Colors.light.tint : '#f4f3f4'}
                  />
                </View>
              )}

              <StyledButton title="Save Settings" onPress={handleSave} variant="filled" />
            </Animated.View>
          </StyledCard>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  title: {
    fontSize: 54,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    color: '#0a7ea4',
  },
  pill: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  statusText: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 0,
  },
  error: {
    color: Colors.light.error,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
  settingsToggle: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsToggleText: {
    fontWeight: '600',
    opacity: 0.9,
  },
  chev: {
    opacity: 0.6,
  },
  settingsPanel: {
    overflow: 'hidden',
    marginTop: 10,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.75,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
});