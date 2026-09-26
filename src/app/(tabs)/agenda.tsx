import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useColorScheme, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Button, 
  ScrollView, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig'; 
import Header from '../../components/Header';
import { AgendaCard } from '../../components/CardAgenda';
import { AddCard } from '../../components/Add';

interface Paciente {
  id: string;
  nome: string;
}

interface Visita {
  id: string;
  pacienteNome: string;
  motivo: string;
  horario: string;
  endereco: string;
  data: string;
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

export default function AgendaScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  // Estados de Data
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Estados de Dados do Firestore
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [listaPacientes, setListaPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal e Formulário
  const [modalVisible, setModalVisible] = useState(false);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([]);
  const [motivo, setMotivo] = useState('');
  const [horario, setHorario] = useState('');
  const [endereco, setEndereco] = useState('');

  const formattedDateKey = date.toISOString().split('T')[0];
  const formattedDateBR = date.toLocaleDateString('pt-BR');

  // 1. Busca todos os pacientes do Firestore
  useEffect(() => {
    const unsubPacientes = onSnapshot(collection(db, 'pacientes'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setListaPacientes(docs);
    });

    return () => unsubPacientes();
  }, []);

  // 2. Busca as visitas filtradas pela data selecionada
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'visitas'), where('data', '==', formattedDateKey));

    const unsubVisitas = onSnapshot(q, (snapshot) => {
      const docs: Visita[] = snapshot.docs.map(doc => ({
        id: doc.id,
        pacienteNome: doc.data().pacienteNome,
        motivo: doc.data().motivo,
        horario: doc.data().horario,
        endereco: doc.data().endereco,
        data: doc.data().data,
      }));

      docs.sort((a, b) => a.horario.localeCompare(b.horario));
      setVisitas(docs);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao buscar visitas:", err);
      setLoading(false);
    });

    return () => unsubVisitas();
  }, [formattedDateKey]);

  // Função para filtrar a lista ao digitar
  const handleDigitarPaciente = (texto: string) => {
    setBuscaPaciente(texto);
    setPacienteSelecionado(null); // Limpa seleção anterior se continuar digitando

    if (texto.trim() === '') {
      setPacientesFiltrados([]);
    } else {
      const filtrados = listaPacientes.filter(p => 
        p.nome.toLowerCase().includes(texto.toLowerCase())
      );
      setPacientesFiltrados(filtrados);
    }
  };

  // Função para selecionar um paciente da lista
  const handleSelecionarPaciente = (p: Paciente) => {
    setPacienteSelecionado(p);
    setBuscaPaciente(p.nome);
    setPacientesFiltrados([]); // Esconde a lista de sugestões
  };

  const handleSalvarVisita = async () => {
    const nomeFinal = pacienteSelecionado ? pacienteSelecionado.nome : buscaPaciente;
    if (!nomeFinal.trim() || !horario.trim()) return;

    try {
      await addDoc(collection(db, 'visitas'), {
        pacienteNome: nomeFinal,
        motivo: motivo.trim(),
        horario: horario.trim(),
        endereco: endereco.trim() || 'Endereço não informado',
        data: formattedDateKey,
        createdAt: serverTimestamp(),
      });

      // Limpa os campos
      setBuscaPaciente('');
      setPacienteSelecionado(null);
      setPacientesFiltrados([]);
      setMotivo('');
      setHorario('');
      setEndereco('');
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
    }
  };

  const handleNextDay = () => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    setDate(nextDate);
  };

  const handlePreviousDay = () => {
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    setDate(prevDate);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header 
        title="Agenda" 
        iconName="calendar-outline" 
        onIconPress={() => setShowPicker(true)} 
      />

      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={handlePreviousDay}>
          <MaterialIcons name="arrow-back-ios" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18 }}>
          {formattedDateBR}
        </Text>

        <TouchableOpacity onPress={handleNextDay}>
          <MaterialIcons name="arrow-forward-ios" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : visitas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Nenhuma visita agendada para este dia.
            </Text>
          </View>
        ) : (
          visitas.map((visita) => (
            <AgendaCard
              key={visita.id}
              horario={visita.horario}
              nome={visita.motivo ? `${visita.pacienteNome} • ${visita.motivo}` : visita.pacienteNome}
              endereco={visita.endereco}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footerButtonContainer}>
        <AddCard title="Adicionar visita" onPress={() => setModalVisible(true)} />
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Modal com Autocomplete/Pesquisa de Paciente */}
      <BaseModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setPacientesFiltrados([]);
        }}
        title="Agendar Visita"
      >
        <View style={{ zIndex: 10 }}>
          <TextInput
            placeholder="Pesquisar paciente por nome..."
            placeholderTextColor="#9ca3af"
            value={buscaPaciente}
            onChangeText={handleDigitarPaciente}
            style={styles.input}
          />

          {/* Lista de sugestões dinâmicas conforme a digitação */}
          {pacientesFiltrados.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 120 }}>
                {pacientesFiltrados.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSelecionarPaciente(item)}
                  >
                    <Text style={styles.suggestionText}>{item.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TextInput
          placeholder="Horário (ex: 09:00)"
          placeholderTextColor="#9ca3af"
          value={horario}
          onChangeText={setHorario}
          style={styles.input}
        />
        <TextInput
          placeholder="Motivo da visita (ex: Consulta de rotina)"
          placeholderTextColor="#9ca3af"
          value={motivo}
          onChangeText={setMotivo}
          style={styles.input}
        />
        <TextInput
          placeholder="Endereço da visita"
          placeholderTextColor="#9ca3af"
          value={endereco}
          onChangeText={setEndereco}
          style={styles.input}
        />

        <Button title="Salvar Visita" color="#2563EB" onPress={handleSalvarVisita} />
      </BaseModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    margin: 20,
  },
  footerButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
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
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1f2937',
  },
});