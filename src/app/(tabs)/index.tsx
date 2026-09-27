import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView, ActivityIndicator, Modal, TextInput, Button, Alert } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig'; 
import Headerhome from '@/src/components/Headerhome';
import { AgendaCard } from '@/src/components/CardAgenda';
import { AcessosCard } from '@/src/components/Acessos';

interface Visita {
  id: string;
  pacienteNome: string;
  motivo: string;
  horario: string;
  endereco: string;
  data: string;
  status: string;
}

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

function BaseModal({ visible, onClose, title, children }: BaseModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {children}
          <Button title="Cancelar" color="#ef4444" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';  
  
  const [visitasHoje, setVisitasHoje] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitaSelecionada, setVisitaSelecionada] = useState<Visita | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  //Estados do Modal de Novo Paciente
  const [pacienteModalVisible, setPacienteModalVisible] = useState(false);
  const [nomePaciente, setNomePaciente] = useState('');
  const [condicao, setCondicao] = useState('');
  const [idade, setIdade] = useState('');
  const [salvandoPaciente, setSalvandoPaciente] = useState(false);

  // Pega a data de HOJE no formato YYYY-MM-DD
  const hojeKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  setLoading(true);

  const q = query(
    collection(db, 'visitas'),
    where('data', '==', hojeKey),
    where('userId', '==', user.uid) // Filtra pelo médico logado
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const docs: Visita[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      pacienteNome: doc.data().pacienteNome,
      motivo: doc.data().motivo,
      horario: doc.data().horario,
      endereco: doc.data().endereco,
      data: doc.data().data,
      status: doc.data().status || 'Agendado',
    }));

    docs.sort((a, b) => a.horario.localeCompare(b.horario));

    setVisitasHoje(docs);
    setLoading(false);
  }, (error) => {
    console.error('Erro ao buscar visitas de hoje:', error);
    setLoading(false);
  });

  return () => unsubscribe();
}, [hojeKey]);

// Função para cadastrar o paciente global no Firestore
  const handleSalvarPaciente = async () => {
    if (!nomePaciente.trim()) {
      Alert.alert('Atenção', 'Informe ao menos o nome do paciente.');
      return;
    }

    setSalvandoPaciente(true);
    try {
      await addDoc(collection(db, 'pacientes'), {
        nome: nomePaciente.trim(),
        condicao: condicao.trim() || 'Estável',
        idade: idade.trim() || 'Não informada',
        createdAt: serverTimestamp(),
      });

      // Limpa formulário e fecha modal
      setNomePaciente('');
      setCondicao('');
      setIdade('');
      setPacienteModalVisible(false);
      Alert.alert('Sucesso', 'Paciente cadastrado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o paciente.');
    } finally {
      setSalvandoPaciente(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View>
        <Headerhome title="Ola dr." />
      </View>
      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}> Acessos rapidos</Text>
      <View style={styles.gridContainer}>
        <AcessosCard 
          iconFamily="FontAwesome5" 
          iconName="address-book" 
          iconColor="#357eec" 
          iconSize={30}
          title={`Visitas agendadas hoje: ${visitasHoje.length}`} 
          onPress={() => {}} 
        />
        <AcessosCard 
          iconFamily="MaterialCommunityIcons" 
          iconName="file-document-alert-outline" 
          iconColor="#f69606" 
          iconSize={30}
          title="Evoluçoes pendentes" 
          onPress={() => {}} 
        />
        <AcessosCard 
          iconFamily="MaterialIcons" 
          iconName="person-add-alt" 
          iconColor="#0f9d58" 
          iconSize={30}
          title="Pacientes novos" 
          onPress={() => setPacienteModalVisible(true)}/>
      </View>
       <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}> Agendamentos do dia</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : visitasHoje.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Nenhum agendamento para hoje.
            </Text>
          </View>
        ) : (
          visitasHoje.map((visita) => (
            <AgendaCard
              key={visita.id}
              horario={visita.horario}
              nome={visita.motivo ? `${visita.pacienteNome} • ${visita.motivo}` : visita.pacienteNome}
              endereco={visita.endereco}
              status={visita.status}
              onPress={() => {
                setVisitaSelecionada(visita);
                setStatusModalVisible(true);
              }}
            />
          ))
        )}
      </ScrollView>
      <BaseModal
        visible={pacienteModalVisible}
        onClose={() => setPacienteModalVisible(false)}
        title="Cadastrar Paciente"
      >
        <TextInput
          placeholder="Nome do paciente *"
          placeholderTextColor="#9ca3af"
          value={nomePaciente}
          onChangeText={setNomePaciente}
          style={styles.input}
        />
        <TextInput
          placeholder="Condição / Diagnóstico (ex: Estável)"
          placeholderTextColor="#9ca3af"
          value={condicao}
          onChangeText={setCondicao}
          style={styles.input}
        />
        <TextInput
          placeholder="Idade (ex: 68)"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={idade}
          onChangeText={setIdade}
          style={styles.input}
        />

        <Button 
          title={salvandoPaciente ? "Salvando..." : "Salvar Paciente"} 
          color="#0f9d58" 
          disabled={salvandoPaciente}
          onPress={handleSalvarPaciente} 
        />
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
});