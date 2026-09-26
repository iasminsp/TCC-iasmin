import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Button, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db, auth } from '../../config/firebaseConfig'; // ajuste o caminho conforme suas pastas
import Header from '../../components/Header';
import { PacientesCard } from '@/src/components/Pacientes';
import { PesquisaCard } from '@/src/components/Pesquisa';
import { BaseModal } from '@/src/components/modal';

interface Paciente {
  id: string;
  nome: string;
  condicao: string;
  idade: string;
}

export default function PacientesScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  // Lista iniciando completamente vazia
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário de cadastro
  const [nome, setNome] = useState('');
  const [condicao, setCondicao] = useState('');
  const [idade, setIdade] = useState('');

  //pra funcionar on e offline
  useEffect(() => {
    const q = query(collection(db, 'pacientes'), orderBy('createdAt', 'desc'));
    
    // O onSnapshot lê do cache local instantaneamente e do servidor quando online
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const listaPacientes: Paciente[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        condicao: doc.data().condicao,
        idade: doc.data().idade,
      }));

      setPacientes(listaPacientes);
      setLoading(false);
    }, (error) => {
      console.error('Erro Firestore:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSalvarPaciente = async () => {
    if (!nome.trim() || !condicao.trim() || !idade.trim()) return;

    try {
      // addDoc escreve no cache local imediatamente (a UI atualiza na hora)
      // e enfileira para subir para o servidor assim que houver internet.
      await addDoc(collection(db, 'pacientes'), {
        nome,
        condicao,
        idade: idade.includes('anos') ? idade : `${idade} anos`,
        createdAt: serverTimestamp(),
      });

      // Limpa os campos e fecha o modal
      setNome('');
      setCondicao('');
      setIdade('');
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Pacientes" iconName="person-add-outline" onIconPress={() => setModalVisible(true)} />
      <PesquisaCard onPress={() => {}} />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {pacientes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>Nenhum paciente cadastrado.</Text>
              <Text style={styles.emptySubText}>Toque no ícone + no topo para adicionar.</Text>
            </View>
          ) : (
            pacientes.map((paciente) => (
              <PacientesCard
                key={paciente.id}
                nome={paciente.nome}
                condicao={paciente.condicao}
                idade={paciente.idade}
                onPress={() => router.push({
                  pathname: '/perfilPacientes', // ou o nome correto da sua rota de perfil
                  params: { 
                    id: paciente.id,
                    nome: paciente.nome, 
                    condicao: paciente.condicao, 
                    idade: paciente.idade 
                  }
                })}
              />
            ))
          )}
        </ScrollView>
      )}

      <BaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Cadastrar Novo Paciente"
      >
        <TextInput
          placeholder="Nome Completo"
          placeholderTextColor="#9ca3af"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <TextInput
          placeholder="Condição (ex: Diabetes, Hipertensão)"
          placeholderTextColor="#9ca3af"
          value={condicao}
          onChangeText={setCondicao}
          style={styles.input}
        />
        <TextInput
          placeholder="Idade ou Data de Nascimento"
          placeholderTextColor="#9ca3af"
          value={idade}
          onChangeText={setIdade}
          style={styles.input}
        />

        <Button title="Salvar Paciente" color="#2563EB" onPress={handleSalvarPaciente} />
      </BaseModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});