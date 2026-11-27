import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Button, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '../../config/firebaseConfig';
import Header from '../../components/Header';
import { PacientesCard } from '@/src/components/Pacientes';
import { PesquisaCard } from '@/src/components/Pesquisa';
import { BaseModal } from '@/src/components/modal';

interface Paciente {
  id: string;
  nome: string;
  condicao: string;
  DN: string;
  cep?: string;
  numero?: string;
  endereco?: string;
}

export default function PacientesScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  const [nome, setNome] = useState('');
  const [condicao, setCondicao] = useState('');
  const [dn, setDn] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [endereco, setEndereco] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'pacientes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const listaPacientes: Paciente[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        condicao: doc.data().condicao,
        DN: doc.data().DN,
        cep: doc.data().cep,
        numero: doc.data().numero,
        endereco: doc.data().endereco,
      }));

      setPacientes(listaPacientes);
      setLoading(false);
    }, (error) => {
      console.error('Erro Firestore:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDnChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setDn(formatted);
  };

  const buscarCep = async (valorCep: string) => {
    const cepLimpo = valorCep.replace(/\D/g, '');
    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      try {
        setBuscandoCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (data.erro) {
          Alert.alert('Erro', 'CEP não encontrado.');
          setEndereco('');
        } else {
          setEndereco(`${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar o CEP.');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const busca = termoBusca.toLowerCase().trim();
    return (
      paciente.nome.toLowerCase().includes(busca) ||
      paciente.condicao.toLowerCase().includes(busca)
    );
  });

  const handleSalvarPaciente = async () => {
    if (!nome.trim() || !condicao.trim() || !dn.trim()) return;

    const enderecoCompleto = endereco ? `${endereco}, Nº ${numero}` : '';

    try {
      await addDoc(collection(db, 'pacientes'), {
        nome,
        condicao,
        DN: dn,
        cep,
        numero,
        endereco: enderecoCompleto,
        createdAt: serverTimestamp(),
      });

      setNome('');
      setCondicao('');
      setDn('');
      setCep('');
      setNumero('');
      setEndereco('');
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Pacientes" iconName="person-add-outline" onIconPress={() => setModalVisible(true)} />
      <PesquisaCard value={termoBusca} onChangeText={setTermoBusca} />

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
            pacientesFiltrados.map((paciente) => (
              <PacientesCard
                key={paciente.id}
                nome={paciente.nome}
                condicao={paciente.condicao}
                DN={paciente.DN}
                onPress={() => router.push({
                  pathname: '/perfilPacientes',
                  params: { 
                    id: paciente.id,
                    nome: paciente.nome, 
                    condicao: paciente.condicao, 
                    DN: paciente.DN,
                    endereco: paciente.endereco,
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
          placeholder="Data de Nascimento (DD/MM/AAAA)"
          placeholderTextColor="#9ca3af"
          value={dn}
          onChangeText={handleDnChange}
          keyboardType="numeric"
          maxLength={10}
          style={styles.input}
        />

        <TextInput
          placeholder="CEP (somente números)"
          placeholderTextColor="#9ca3af"
          value={cep}
          onChangeText={buscarCep}
          keyboardType="numeric"
          maxLength={8}
          style={styles.input}
        />

        {buscandoCep && <ActivityIndicator size="small" color="#2563EB" style={{ marginBottom: 10 }} />}

        {endereco !== '' && (
          <Text style={styles.enderecoText}>Endereço: {endereco}</Text>
        )}

        <TextInput
          placeholder="Número da casa"
          placeholderTextColor="#9ca3af"
          value={numero}
          onChangeText={setNumero}
          keyboardType="numeric"
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
  enderecoText: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 10,
    fontStyle: 'italic',
  },
});