import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Headerhome from '@/src/components/Headerhome';
import { AgendaCard } from '@/src/components/CardAgenda';
import { AcessosCard } from '@/src/components/Acessos';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';                                                                                                                                                                                                           
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
          title="Visitas agendadas" 
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
          onPress={() => {}} 
        />
      </View>
       <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}> Agendamentos do dia</Text>
      <View>
        <AgendaCard
          horario="08:00"
          nome="Issac . Consulta de rotina"
          endereco="Rua Exemplo, 123"
        />
        <AgendaCard
          horario="09:30"
          nome="Maria Oliveira . Retorno"
          endereco="Rua Exemplo, 456"
        />
        <AgendaCard
          horario="11:00"
          nome="Carlos Souza . Exame de sangue"
          endereco="Rua Exemplo, 789"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',     // Coloca os itens LADO A LADO
    flexWrap: 'wrap',         // Quebra para a próxima linha quando não couber
    justifyContent: 'space-between', // Distribui o espaço entre eles igualmente
  },
});
