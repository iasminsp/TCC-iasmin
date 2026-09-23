import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Header from '../../components/Header';
import { AgendaCard } from '../../components/CardAgenda';
import { AddCard } from '../../components/Add';

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
          <Button title="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export default function AgendaScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  const [modalVisible, setModalVisible] = useState(false);
  
    // Estados do formulário de cadastro de paciente
    const [horario, setHorario] = useState('');
    const [motivo, setMotivo] = useState('');
    const [paciente, setPaciente] = useState('');
  
    const handleSalvarPaciente = () => {
      console.log('Paciente salvo:', { paciente, motivo, horario });
      
      // Limpa os campos e fecha o modal
      setPaciente('');
      setMotivo('');
      setHorario('');
      setModalVisible(false);
    };

  // 1. Estado da data selecionada e do estado do modal de seleção
  const [date, setDate] = useState(new Date(2026, 7, 24)); // 24/08/2026
  const [showPicker, setShowPicker] = useState(false);

  // Função disparada ao escolher a data
  const openDatePicker = () => {
  DateTimePickerAndroid.open({
    value: date,
    mode: 'date',
    display: 'default',
    onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        setDate(selectedDate);
      }
    },
  });
};

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Funções para avançar ou voltar 1 dia pelas setas
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

  // Formatação DD/MM/YYYY
  const formattedDate = date.toLocaleDateString('pt-BR');

  

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 2. Passando a propriedade de clique para o Header */}
      <Header 
        title="Agenda" 
        iconName="calendar-outline" 
        onIconPress={() => setShowPicker(true)} 
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 20 }}>
        <TouchableOpacity onPress={handlePreviousDay}>
          <MaterialIcons name="arrow-back-ios" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18 }}>{formattedDate}</Text>

        <TouchableOpacity onPress={handleNextDay}>
          <MaterialIcons name="arrow-forward-ios" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <AgendaCard horario="08:00" nome="Issac . Consulta de rotina" endereco="Rua Exemplo, 123" />
      <AgendaCard horario="09:00" nome="João da Silva" endereco="Rua Exemplo, 123" />
      <AgendaCard horario="10:30" nome="Maria Oliveira" endereco="Rua Exemplo, 456" />
      <AgendaCard horario="14:00" nome="Carlos Souza" endereco="Rua Exemplo, 789" />
      <AgendaCard horario="15:30" nome="Ana Santos" endereco="Rua Exemplo, 101" />

      <AddCard title="Adicionar visita" onPress={() => setModalVisible(true)} />

      {/* 3. Seletor de Data Nativo */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <BaseModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title="Agendar Visita"
            >
              <TextInput
                placeholder="paciente"
                value={paciente}
                onChangeText={setPaciente}
                style={styles.input}
              />
              <TextInput
                placeholder="Motivo da visita"
                value={motivo}
                onChangeText={setMotivo}
                style={styles.input}
              />
              <TextInput
                placeholder="horario"
                value={horario}
                onChangeText={setHorario}
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