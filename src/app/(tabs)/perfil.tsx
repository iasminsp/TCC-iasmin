import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { ConfigCard } from '@/src/components/CardConfig';

interface MedicoProfile {
  nome: string;
  cargo: string;
  unidade: string;
  equipe: string;
  turno: string;
}

export default function PerfilScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  const [perfil, setPerfil] = useState<MedicoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      // Procura na coleção 'users' criada pelo teu authService
      const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerfil({
            nome: data.nome || 'Não informado',
            cargo: data.cargo || 'Não informado',
            unidade: data.unidade || 'Melhor em Casa - SAD',
            equipe: data.equipe || 'Não informada',
            turno: data.turno || 'Não informado',
          });
        }
        setLoading(false);
      }, (error) => {
        console.error('Erro ao procurar perfil:', error);
        setLoading(false);
      });

      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sair do App',
      'Tem certeza que deseja encerrar a sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/'); // Redireciona para a tela de login
            } catch (error: any) {
              Alert.alert('Erro ao sair', error.message);
            }
          } 
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 20 }}>
          <Ionicons name="person-circle-sharp" size={120} color={textColor} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : (
          <>
            <ConfigCard title={`Nome: ${perfil?.nome || 'Dr. Médico'}`} onPress={() => {}} /> 
            <ConfigCard title={`Cargo/Função: ${perfil?.cargo || 'Não informado'}`} onPress={() => {}} />  
            <ConfigCard title={`Unidade: ${perfil?.unidade || 'Melhor em Casa - SAD'}`} onPress={() => {}} /> 
            <ConfigCard title={`Equipe: ${perfil?.equipe || 'Não informada'}`} onPress={() => {}} />
            <ConfigCard title={`Turno: ${perfil?.turno || 'Não informado'}`} onPress={() => {}}/>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </>
        )}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});