import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ConfigCard } from '@/src/components/CardConfig';
import { CheckboxOption } from '@/src/components/Checkbox';
import { AddCard } from '../components/Add';

const CONDICOES_OPCOES = [
  { id: 'acamado', label: 'Acamado' },
  { id: 'domiciliado', label: 'Domiciliado' },
  { id: 'ulceras', label: 'Úlceras / Feridas (grau III ou IV)' },
  { id: 'nutricional', label: 'Acompanhamento nutricional' },
  { id: 'sng', label: 'Uso de sonda naso-gástrica - SNG' },
  { id: 'sne', label: 'Uso de sonda naso-enteral - SNE' },
  { id: 'gastrostomia', label: 'Uso de gastrostomia' },
  { id: 'colostomia', label: 'Uso de colostomia' },
  { id: 'cistostomia', label: 'Uso de cistostomia' },
  { id: 'svd', label: 'Uso de sonda vesical de demora - SVD' },
  { id: 'pre_operatorio', label: 'Acompanhamento pré-operatório' },
  { id: 'pos_operatorio', label: 'Acompanhamento pós-operatório' },
  { id: 'ortese_protese', label: 'Adaptação ao uso de órtese / prótese' },
  { id: 'reabilitacao_domiciliar', label: 'Reabilitação domiciliar' },
  { id: 'paliativos_oncologico', label: 'Cuidados paliativos oncológico' },
  { id: 'paliativos_nao_oncologico', label: 'Cuidados paliativos não-oncológico' },
  { id: 'oxigenoterapia', label: 'Oxigenoterapia domiciliar' },
  { id: 'traqueostomia', label: 'Uso de traqueostomia' },
  { id: 'aspirador_vias_aereas', label: 'Uso de aspirador de vias aéreas para higiene brônquica' },
  { id: 'ventilatorio_cpap', label: 'Suporte ventilatório não invasivo, CPAP' },
  { id: 'ventilatorio_bipap', label: 'Suporte ventilatório não invasivo, BiPAP' },
  { id: 'dialise_peritoneal', label: 'Diálise peritoneal' },
  { id: 'paracentese', label: 'Paracentese' },
  { id: 'medicacao_parenteral', label: 'Medicação parenteral' },
];


export default function Elegiabilidade() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  const [condicoesSelecionadas, setCondicoesSelecionadas] = useState<string[]>([]);

  const toggleCondicao = (id: string) => {
    setCondicoesSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    
    <View style={[styles.container, { backgroundColor }]}>

      <ConfigCard title="Nome completo" onPress={() => {}} /> 
      <ConfigCard title="Data de Nascimento" onPress={() => {}} />  
      <ConfigCard title="CNS/CPF" onPress={() => {}} /> 
      <ConfigCard title="Procedencia" onPress={() => {}} />
      
      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}>Condiçoes Avaliadas:</Text>

      <ScrollView style={styles.container}>

        {CONDICOES_OPCOES.map((item) => (
            <CheckboxOption
            key={item.id}
            label={item.label}
            checked={condicoesSelecionadas.includes(item.id)}
            onPress={() => toggleCondicao(item.id)}
            />
        ))}
      </ScrollView>
      <ConfigCard title="CID" onPress={() => {}} /> 
      <ConfigCard title="Conclusão" onPress={() => {}} />  
      <ConfigCard title="Cuidador" onPress={() => {}} /> 

      <AddCard title="Salvar" onPress={() => console.log('Salvar')} />
    
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