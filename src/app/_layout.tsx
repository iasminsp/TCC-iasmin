import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="perfilPacientes" options={{ 
            headerShown: true,
            title: 'Perfil do Paciente',          
            headerTitleAlign: 'center',         
            headerStyle: {
              backgroundColor: '#2563EB',
            },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: {
              fontWeight: 'bold',                
              fontSize: 18,
            },
                 
          }} />
        <Stack.Screen name="elegiabilidade" options={{
            headerShown: true,
            title: 'Ficha de Admissão/Elegiabilidade',
            headerTitleAlign: 'center',         
            headerStyle: {
              backgroundColor: '#2563EB',
            },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: {
              fontWeight: 'bold',                
              fontSize: 18,
            },
            }} />
            <Stack.Screen name="atendimentoDomiciliar" options={{
            headerShown: true,
            title: 'Ficha de Atendimento Domiciliar',
            headerTitleAlign: 'center',         
            headerStyle: {
              backgroundColor: '#2563EB',
            },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: {
              fontWeight: 'bold',                
              fontSize: 18,
            },
            }} />
            <Stack.Screen name="Soap" options={{
            headerShown: true,
            title: 'Evolução SOAP',
            headerTitleAlign: 'center',         
            headerStyle: {
              backgroundColor: '#2563EB',
            },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: {
              fontWeight: 'bold',                
              fontSize: 18,
            },
          }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}