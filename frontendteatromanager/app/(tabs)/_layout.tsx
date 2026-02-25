import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '../constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLighter,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray200,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Autenticação',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarLabel: '🎭 Teatro',
        }}
      />
    </Tabs>
  );
}

