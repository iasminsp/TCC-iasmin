import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Header from '../../components/Header';
import { AgendaCard } from '../../components/CardAgenda';
import { AddCard } from '../../components/Add';


export default function AgendaScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  return (
    
    <View style={[styles.container, { backgroundColor }]}>
      <View>
        <Header title="Agenda" iconName="calendar-outline" />
      </View>
      <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 20 }]}>
        <MaterialIcons name="arrow-back-ios" size={24} color={textColor} />
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18 }}> 24/08/2026</Text>
        <MaterialIcons name="arrow-forward-ios" size={24} color={textColor} />
      </View>
      <AgendaCard horario="08:00" nome="Issac . Consulta de rotina" endereco="Rua Exemplo, 123" />
      <AgendaCard horario="09:00" nome="João da Silva" endereco="Rua Exemplo, 123" />
      <AgendaCard horario="10:30" nome="Maria Oliveira" endereco="Rua Exemplo, 456" />
      <AgendaCard horario="14:00" nome="Carlos Souza" endereco="Rua Exemplo, 789" />
      <AgendaCard horario="15:30" nome="Ana Santos" endereco="Rua Exemplo, 101" />

      <AddCard onPress={() => console.log('Adicionar nova visita')} />
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
  }
})