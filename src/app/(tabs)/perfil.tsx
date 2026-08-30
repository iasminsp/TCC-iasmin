import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from '../../components/Header';
import { ConfigCard } from '@/src/components/CardConfig';


export default function PerfilScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  return (
    
    <View style={[styles.container, { backgroundColor }]}>
      <View>
        <Header title="Perfil" />
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 70 }}>
        <Ionicons name="person-circle-sharp" size={120} color={textColor} />
      </View>
      <ConfigCard title="Nome" onPress={() => {}} /> 
      <ConfigCard title="Cargo/Função" onPress={() => {}} />  
      <ConfigCard title="Unidade" onPress={() => {}} /> 
      <ConfigCard title="Equipe" onPress={() => {}} />
      <ConfigCard title="Turno" onPress={() => {}}/>
    
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