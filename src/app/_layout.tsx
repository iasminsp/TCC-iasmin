import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as SystemUI from 'expo-system-ui';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function configureSystemUI() {
      if (Platform.OS === 'android') {
        try {
          await SystemUI.setBackgroundColorAsync('transparent');
        } catch (error) {
          console.log('Erro ao configurar SystemUI:', error);
        }
      }
    }

    configureSystemUI();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } 
    else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen 
          name="perfilPacientes" 
          options={{ 
            headerShown: true,
            title: 'Perfil do Paciente',          
            headerTitleAlign: 'center',         
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }} 
        />
        <Stack.Screen 
          name="elegiabilidade" 
          options={{
            headerShown: true,
            title: 'Ficha de Admissão/Elegiabilidade',
            headerTitleAlign: 'center',         
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }} 
        />
        <Stack.Screen 
          name="atendimentoDomiciliar" 
          options={{
            headerShown: true,
            title: 'Ficha de Atendimento Domiciliar',
            headerTitleAlign: 'center',         
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }} 
        />
        <Stack.Screen 
          name="Soap" 
          options={{
            headerShown: true,
            title: 'Evolução SOAP',
            headerTitleAlign: 'center',         
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }} 
        />
        <Stack.Screen 
          name="cadastroDomiciliar" 
          options={{  
            headerShown: true,
            title: 'Cadastro Domiciliar',
            headerTitleAlign: 'center',         
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }} 
        />
        <Stack.Screen 
          name="historicoDocumentos" 
          options={{  
            headerShown: true,
            title: 'Histórico de Documentos',
            headerTitleAlign: 'center',         
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',         
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          }} 
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}