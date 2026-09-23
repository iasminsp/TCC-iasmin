import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const segments = useSegments();
  const router = useRouter();

  // Escuta o estado da autenticação no Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Controla a navegação automática
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Se NÃO estiver logado e NÃO estiver na pasta (auth), vai para o Login
    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } 
    // Se ESTIVER logado e tentar acessar a pasta (auth), vai para a Home
    else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  // Exibe indicador de carregamento enquanto valida a sessão
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
        {/* Rota de Autenticação */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Rotas Privadas da Aplicação */}
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
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}