import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ConfigCard } from '@/src/components/CardConfig';
import { AddCard } from '../components/Add';


export default function AtendimentoSOAP() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  

  return (
    
    <View style={[styles.container, { backgroundColor }]}>
        <ScrollView style={styles.container}>
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}>Subjetivo</Text>
      <ConfigCard title="Subjetivo" onPress={() => {}} /> 
        <ConfigCard title="Motivo da consulta" onPress={() => {}} /> 
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}>Objetivo</Text>
      <ConfigCard title="Objetivo" onPress={() => {}} />  
        <ConfigCard title="Antropometria" onPress={() => {}} />
        <ConfigCard title="Sinais vitais" onPress={() => {}} />
        <ConfigCard title="Glicemia" onPress={() => {}} />
        <ConfigCard title="Vacinação em dia" onPress={() => {}} />
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}>Avaliação</Text>
      <ConfigCard title="Avaliação" onPress={() => {}} /> 
        <ConfigCard title="Problema e/ou condições detectadas" onPress={() => {}} /> 
      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}>Plano</Text>
      <ConfigCard title="Plano" onPress={() => {}} /> 
        <ConfigCard title="Intervenção e/ou procedimentos" onPress={() => {}} />
      


      <AddCard title="Salvar" onPress={() => console.log('Salvar')} />
        </ScrollView>
    
    </View>
        
    
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: '#11181C',
    fontWeight: 'bold',
    fontSize: 18,
    margin: 20,
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