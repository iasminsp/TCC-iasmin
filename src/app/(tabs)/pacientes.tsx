import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme, Button } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { PacientesCard } from '@/src/components/Pacientes';
import { PesquisaCard } from '@/src/components/Pesquisa';
import { BaseModal } from '@/src/components/modal';

export default function PacientesScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  // Estados do formulário de cadastro de paciente
  const [nome, setNome] = useState('');
  const [condicao, setCondicao] = useState('');
  const [idade, setIdade] = useState('');

  const handleSalvarPaciente = () => {
    console.log('Paciente salvo:', { nome, condicao, idade });
    
    // Limpa os campos e fecha o modal
    setNome('');
    setCondicao('');
    setIdade('');
    setModalVisible(false);
  };

  return (
    
    <View style={[styles.container, { backgroundColor }]}>
      <View>
        <Header title="Pacientes" iconName="person-add-outline" onIconPress={() => setModalVisible(true)} />
      </View>
      <PesquisaCard onPress={() => {}} />
        
      <PacientesCard nome="Maria Oliveira" condicao="Hipertensão" idade="52 anos" onPress={() => router.push('/perfilPacientes')} />
      <PacientesCard nome="Carlos Souza" condicao="Asma" idade="30 anos" onPress={() => router.push('/perfilPacientes')} />
      <PacientesCard nome="Ana Santos" condicao="Obesidade" idade="40 anos" onPress={() => router.push('/perfilPacientes')} />
      <PacientesCard nome="Pedro Lima" condicao="Diabetes Tipo 2" idade="55 anos" onPress={() => router.push('/perfilPacientes')} />
      <PacientesCard nome="João da Silva" condicao="Diabetes" idade="45 anos" onPress={() => router.push('/perfilPacientes')} />

      <BaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Cadastrar Novo Paciente"
      >
        <TextInput
          placeholder="Nome Completo"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <TextInput
          placeholder="Condição (ex: Diabetes, Hipertensão)"
          value={condicao}
          onChangeText={setCondicao}
          style={styles.input}
        />
        <TextInput
          placeholder="Idade"
          value={idade}
          onChangeText={setIdade}
          keyboardType="numeric"
          style={styles.input}
        />
        
        <Button title="Salvar Paciente" color="#2563EB" onPress={handleSalvarPaciente} />
      </BaseModal>
    </View>
        
    
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft:"90%",
    marginTop:'-15%',
    backgroundColor: 'blue'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  }
})