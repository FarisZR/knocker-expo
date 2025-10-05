import * as IntentLauncher from 'expo-intent-launcher';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Easing,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from 'react-native';
import { StyledButton } from '../components/ui/StyledButton';
import StyledCard from '../components/ui/StyledCard';
import { StyledText } from '../components/ui/StyledText';
import { StyledTextInput } from '../components/ui/StyledTextInput';
import { StyledView } from '../components/ui/StyledView';
import { Colors } from '../constants/Colors';
import {
  BACKGROUND_STALE_THRESHOLD_MS,
  BackgroundRunMetadata,
  clearBackgroundRunMetadata,
  ensureBackgroundTaskRegistered,
  getBackgroundNotificationsEnabled,
  getLastBackgroundRunMetadata,
  getNextRunMetadata,
  NextRunMetadata,
  registerBackgroundTask,
  setBackgroundNotificationsEnabled,
  unregisterBackgroundTask
} from '../src/services/backgroundKnocker';
import { knock } from '../src/services/knocker';
import { getKnockOptions } from '../src/services/knockOptions';
import {
  hasNotificationPermissions,
  initializeNotificationService,
  requestNotificationPermissions,
} from '../src/services/notifications';
import { getItem, setItem } from '../src/services/storage';

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
  const [isBackgroundNotificationEnabled, setIsBackgroundNotificationEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [lastKnock, setLastKnock] = useState<Date | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [backgroundStatusMessage, setBackgroundStatusMessage] = useState('');
  const [backgroundMetadata, setBackgroundMetadata] = useState<BackgroundRunMetadata | null>(null);
  const [nextRunMeta, setNextRunMeta] = useState<NextRunMetadata | null>(null);
  const [backgroundBatteryHint, setBackgroundBatteryHint] = useState('');
  const [showBatteryOptimizationPrompt, setShowBatteryOptimizationPrompt] = useState(false);

  const statusOpacity = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(1)).current; // 1 = open, 0 = closed
  const hasRequestedNotificationPermissionRef = useRef(false);

  // Theme-aware colors (ensure readable error background/text in both themes)
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  // Use the onErrorContainer token when available so text contrasts the errorContainer background
  const errorTextColor = theme.onErrorContainer ?? (colorScheme === 'dark' ? '#ffffff' : Colors.light.error);
  const warningTextColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';

  const pillBg = theme.surfaceVariant;
  const pillErrorBg = theme.errorContainer;
  const pillWarningBg = theme.warning;
  const pillBorder = theme.outlineVariant;

  useEffect(() => {
    initializeNotificationService()
      .then((channelConfigured) => {
        if (!channelConfigured) {
          console.warn('Notification channel configuration failed; background notifications may not be shown.');
        }
      })
      .catch((error) => {
        console.warn('Notification service init failed:', error);
      });
  }, []);

  const refreshBackgroundStatus = useCallback(
    async (overrideEnabled?: boolean) => {
      const enabled = typeof overrideEnabled === 'boolean' ? overrideEnabled : isBackgroundServiceEnabled;
      if (!enabled) {
        setBackgroundMetadata(null);
        setBackgroundStatusMessage('');
        setBackgroundBatteryHint('');
        setShowBatteryOptimizationPrompt(false);
        return;
      }

      const metadata = await getLastBackgroundRunMetadata();
      setBackgroundMetadata(metadata);
      setBackgroundBatteryHint('');
      setShowBatteryOptimizationPrompt(false);

      // Also restore next-run metadata used for catch-up decisions.
      try {
        const nextMeta = await getNextRunMetadata();
        setNextRunMeta(nextMeta);
      } catch {
        setNextRunMeta(null);
      }
      if (!metadata) {
        setBackgroundStatusMessage('Background knock has not run yet.');
        return;
      }

      const timestamp = new Date(metadata.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        setBackgroundStatusMessage('Background knock status unknown.');
        return;
      }

      const ageMs = Date.now() - timestamp.getTime();
      const ageMinutes = Math.max(1, Math.round(ageMs / 60000));

      switch (metadata.status) {
        case 'success':
          if (ageMs > BACKGROUND_STALE_THRESHOLD_MS) {
            setBackgroundStatusMessage(
              `Background knock stale. Last success ${ageMinutes} minute${ageMinutes === 1 ? '' : 's'} ago.`
            );
          } else {
            setBackgroundStatusMessage(
              `Background knock succeeded ${ageMinutes} minute${ageMinutes === 1 ? '' : 's'} ago.`
            );
          }
          break;
        case 'failed':
          setBackgroundStatusMessage('Background knock failed during the last run. Open the app to retry.');
          if (Platform.OS === 'android') {
            setBackgroundBatteryHint(
              'Android may be stopping Knocker in the background. Disable battery optimizations for Knocker to improve reliability.'
            );
            setShowBatteryOptimizationPrompt(true);
          }
          break;
        case 'restricted':
          setBackgroundStatusMessage('Background fetch is restricted by the OS. Open the app periodically to keep access alive.');
          if (Platform.OS === 'android') {
            setBackgroundBatteryHint(
              'Disable Android battery optimizations for Knocker so scheduled knocks can keep running even when the device is idle.'
            );
            setShowBatteryOptimizationPrompt(true);
          }
          break;
        case 'missing-credentials':
          setBackgroundStatusMessage('Background knock skipped because credentials were missing.');
          break;
        case 'no-data':
        default:
          setBackgroundStatusMessage('Background knock ran but no new data was returned.');
          break;
      }
    },
    [isBackgroundServiceEnabled]
  );

  const handleOpenBatterySettings = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    const activityAction =
      (IntentLauncher.ActivityAction as { IGNORE_BATTERY_OPTIMIZATION_SETTINGS?: string } | undefined)
        ?.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;
    const action = activityAction ?? 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS';

    try {
      await IntentLauncher.startActivityAsync(action);
    } catch (error) {
      console.warn('Unable to open battery optimization settings:', error);
    }
  }, []);

  const animateStatus = () => {
    statusOpacity.setValue(0);
    Animated.timing(statusOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleKnock = async (
    knockEndpoint: string,
    knockToken: string,
    options?: { ttl?: number; ip_address?: string },
    shouldRequestNotificationPermission = false
  ) => {
    try {
      // clear any previous warning before a new request
      setWarningMessage('');
      setStatus('Knocking...');
      animateStatus();
      const result = await knock(knockEndpoint, knockToken, options);
      setStatus(`Whitelisted: ${result.whitelisted_entry}\nExpires in: ${result.expires_in_seconds} seconds`);
      setLastKnock(new Date());

      // Detect TTL capping: if a TTL was requested and the server returned a shorter expiry.
      const requested = options?.ttl;
      if (typeof requested === 'number' && requested > result.expires_in_seconds) {
        setWarningMessage(
          `TTL requested (${requested} seconds) exceeds server limit. IP allowed for ${result.expires_in_seconds} seconds.`
        );
      } else {
        setWarningMessage('');
      }

      if (
        shouldRequestNotificationPermission &&
        Platform.OS !== 'web' &&
        isBackgroundNotificationEnabled &&
        !hasRequestedNotificationPermissionRef.current
      ) {
        hasRequestedNotificationPermissionRef.current = true;
        try {
          const granted = await requestNotificationPermissions();
          if (!granted) {
            console.warn('Notification permission request was denied or channel setup failed.');
          }
        } catch (permissionError) {
          console.warn('Notification permission request failed:', permissionError);
        }
      }

      animateStatus();
    } catch (error: any) {
      // Clear warnings on error
      setWarningMessage('');
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

      const notificationsEnabled = await getBackgroundNotificationsEnabled();
      setIsBackgroundNotificationEnabled(notificationsEnabled);

      const hasPermission = await hasNotificationPermissions();
      hasRequestedNotificationPermissionRef.current = hasPermission;

      if (storedEndpoint) setEndpoint(storedEndpoint);
      if (storedToken) setToken(storedToken);
      if (storedTtl) setTtl(storedTtl);
      if (storedIp) setIpAddress(storedIp);
      const backgroundEnabled = storedBackground === 'true';
      setIsBackgroundServiceEnabled(backgroundEnabled);

      if (storedSettingsOpen !== null) {
        const open = storedSettingsOpen === 'true';
        setSettingsOpen(open);
        settingsAnim.setValue(open ? 1 : 0);
      } else {
        // Default: open if credentials missing
        const shouldOpen = !(storedEndpoint && storedToken);
        setSettingsOpen(shouldOpen);
        settingsAnim.setValue(shouldOpen ? 1 : 0);
      }

      await refreshBackgroundStatus(backgroundEnabled);

      // If credentials exist, perform an initial knock
      if (storedEndpoint && storedToken) {
        const options = await getKnockOptions();
        await handleKnock(storedEndpoint, storedToken, options, false);
      } else {
        setStatus('Credentials not set. Expand Settings to configure.');
        animateStatus();
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isBackgroundServiceEnabled && Platform.OS !== 'web') {
      ensureBackgroundTaskRegistered();
      refreshBackgroundStatus();
    } else if (!isBackgroundServiceEnabled) {
      setBackgroundMetadata(null);
      setBackgroundStatusMessage('');
      setBackgroundBatteryHint('');
      setShowBatteryOptimizationPrompt(false);
    }
  }, [isBackgroundServiceEnabled, refreshBackgroundStatus]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isBackgroundServiceEnabled) {
        ensureBackgroundTaskRegistered();
        refreshBackgroundStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isBackgroundServiceEnabled, refreshBackgroundStatus]);

  const onManualKnock = async () => {
    if (endpoint && token) {
      const options = await getKnockOptions();
      await handleKnock(endpoint, token, options, true);
    }
  };

  const onManualCatchup = async () => {
    // Manual catch-up should only attempt when credentials exist.
    if (!endpoint || !token) return;
    // Only perform catch-up if the stored nextRunAt is in the past or missing.
    const meta = await getNextRunMetadata();
    if (meta && typeof meta.nextRunAt === 'number' && Date.now() < meta.nextRunAt) {
      // Not yet due; no-op to avoid unnecessary network.
      return;
    }
    const options = await getKnockOptions();
    await handleKnock(endpoint, token, options, true);
    // Refresh status after manual catch-up
    await refreshBackgroundStatus(isBackgroundServiceEnabled);
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

  const handleNotificationToggle = async (value: boolean) => {
    setIsBackgroundNotificationEnabled(value);
    await setBackgroundNotificationsEnabled(value);
    const hasPermission = await hasNotificationPermissions();
    hasRequestedNotificationPermissionRef.current = hasPermission && value;
  };

  const handleSave = async () => {
    // First, get the normalized options to check Android scheduler compatibility
    const options = await getKnockOptions();

    // Check if TTL is compatible with Android scheduler when background service is enabled
    if (isBackgroundServiceEnabled && !options.isAndroidSchedulerCompatible) {
  const minutes = Math.ceil(options.androidSchedulerMinimum / 60);
  const ttlLabel = options.ttl != null ? `${options.ttl}s` : 'not set';
  setWarningMessage(`Background service requires TTL >= ${minutes} minutes (currently ${ttlLabel}).`);
      return; // Don't proceed with save if TTL is incompatible
    }

    await setItem('knocker-endpoint', endpoint);
    await setItem('knocker-token', token);
    await setItem('knocker-ttl', ttl);
    await setItem('knocker-ip', ipAddress);
    await setItem('background-service-enabled', isBackgroundServiceEnabled.toString());
    await setBackgroundNotificationsEnabled(isBackgroundNotificationEnabled);

    // Background task registration should not run on web
    if (Platform.OS !== 'web') {
      if (isBackgroundServiceEnabled) {
        await registerBackgroundTask();
        await refreshBackgroundStatus(true);
      } else {
        await unregisterBackgroundTask();
        await clearBackgroundRunMetadata();
        setBackgroundStatusMessage('');
      }
    }

    // Auto-knock after save if credentials present
    if (endpoint && token) {
      await handleKnock(endpoint, token, options, true);
      // close settings after successful save
      await toggleSettings(false);
    } else {
      setStatus('Credentials not set. Please fill endpoint & token.');
      animateStatus();
      // ensure settings open so user can edit
      await toggleSettings(true);
    }
  };

  const backgroundStatusIsWarning =
    backgroundStatusMessage.startsWith('Background knock stale') ||
    backgroundStatusMessage.startsWith('Background knock failed') ||
    backgroundStatusMessage.startsWith('Background fetch');

  const hasBackgroundBatteryHint = backgroundBatteryHint.length > 0;

  const isWarning = Boolean(warningMessage) || backgroundStatusIsWarning || hasBackgroundBatteryHint;
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
                  backgroundColor: isError ? pillErrorBg : isWarning ? pillWarningBg : pillBg,
                  borderColor: pillBorder,
                  opacity: statusOpacity,
                },
              ]}
            >
              <StyledText
                style={[
                  styles.statusText,
                  isError ? { color: errorTextColor } : isWarning ? { color: warningTextColor } : undefined,
                ]}
              >
                {status}
              </StyledText>

              {isWarning && warningMessage ? (
                <StyledText style={[styles.statusText, { color: warningTextColor, marginTop: 6, fontWeight: '600' }]}>
                  {warningMessage}
                </StyledText>
              ) : null}

              {isBackgroundServiceEnabled && backgroundStatusMessage ? (
                <StyledText
                  style={[
                    styles.backgroundStatusText,
                    backgroundStatusIsWarning ? { color: warningTextColor } : undefined,
                  ]}
                >
                  {backgroundStatusMessage}
                </StyledText>
              ) : null}

              {isBackgroundServiceEnabled && hasBackgroundBatteryHint ? (
                <StyledText
                  style={[
                    styles.backgroundHintText,
                    { color: warningTextColor },
                  ]}
                >
                  {backgroundBatteryHint}
                </StyledText>
              ) : null}

              {isBackgroundServiceEnabled && showBatteryOptimizationPrompt && Platform.OS === 'android' ? (
                <StyledButton
                  title="Open battery optimization settings"
                  onPress={handleOpenBatterySettings}
                  variant="outlined"
                  style={styles.batteryButton}
                />
              ) : null}

              {isBackgroundServiceEnabled && nextRunMeta && typeof nextRunMeta.nextRunAt === 'number' && (Date.now() >= nextRunMeta.nextRunAt || settingsOpen) ? (
                <StyledButton
                  title="Run catch-up"
                  onPress={onManualCatchup}
                  variant="outlined"
                  style={styles.batteryButton}
                />
              ) : null}

              {!isError && !isWarning && lastKnock && (
                <StyledText style={styles.meta}>Last knock: {lastKnock.toLocaleTimeString()}</StyledText>
              )}
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
                <>
                  <View style={styles.row}>
                    <StyledText>Background Service</StyledText>
                    <Switch
                      value={isBackgroundServiceEnabled}
                      onValueChange={setIsBackgroundServiceEnabled}
                      trackColor={{ false: '#767577', true: Colors.light.tint }}
                      thumbColor={isBackgroundServiceEnabled ? Colors.light.tint : '#f4f3f4'}
                    />
                  </View>

                  {isBackgroundServiceEnabled && (
                    <View style={styles.row}>
                      <StyledText>Silent Notification</StyledText>
                      <Switch
                        value={isBackgroundNotificationEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: '#767577', true: Colors.light.tint }}
                        thumbColor={isBackgroundNotificationEnabled ? Colors.light.tint : '#f4f3f4'}
                      />
                    </View>
                  )}
                </>
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
  backgroundStatusText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    opacity: 0.85,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
  backgroundHintText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    opacity: 0.85,
  },
  batteryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
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