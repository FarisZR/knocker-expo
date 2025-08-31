import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={{ flex: 1, borderTopWidth: 0.5, borderColor: theme.outline }}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 10,
          borderRadius: 24,
          overflow: 'hidden',
          elevation: 0,
          shadowOpacity: 0,
          height: 64,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.icon,
      }}
      initialRouteName="main"
    >
      <Tabs.Screen
        name="index"
        options={{
          // Hide index route from tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="main"
        options={{
          title: 'Knock',
          tabBarIcon: ({ color }) => <MaterialIcons name="vpn-key" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="setup"
        options={{
          title: 'Setup',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
