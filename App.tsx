import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { MonitoringProvider } from './src/context/MonitoringContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#071019',
    card: '#101c2a',
    primary: '#4dd0e1',
    text: '#ecf4ff',
    border: '#1f3042',
    notification: '#ff5b73',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MonitoringProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </MonitoringProvider>
    </SafeAreaProvider>
  );
}