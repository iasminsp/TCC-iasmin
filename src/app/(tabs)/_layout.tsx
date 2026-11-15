import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Octicons from '@expo/vector-icons/Octicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[isDark ? 'dark' : 'light']?.tint || '#2F80ED',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#687076',
        headerShown: false,
        tabBarButton: HapticTab as any,
        tabBarStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderTopColor: isDark ? '#27272A' : '#E5E5EA',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabelStyle: { fontSize: 9 },
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="pacientes"
        options={{
          title: 'Pacientes',
          tabBarLabelStyle: { fontSize: 9 },
          tabBarIcon: ({ color }) => <Octicons name="people" size={28} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarLabelStyle: { fontSize: 9 },
          tabBarIcon: ({ color }) => <EvilIcons name="calendar" size={38} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabelStyle: { fontSize: 9 },
          tabBarIcon: ({ color }) => <SimpleLineIcons name="menu" size={26} color={color as string} />,
        }}
      />
    </Tabs>
  );
}