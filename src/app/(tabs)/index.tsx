import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig'; 
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
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';  
  
  const [visitasHoje, setVisitasHoje] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  // Pega a data de HOJE no formato YYYY-MM-DD
  const hojeKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);

    // Consulta na coleção 'visitas' apenas as registradas com a data de hoje
    const q = query(
      collection(db, 'visitas'),
      where('data', '==', hojeKey)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Visita[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        pacienteNome: doc.data().pacienteNome,
        motivo: doc.data().motivo,
        horario: doc.data().horario,
        endereco: doc.data().endereco,
        data: doc.data().data,
      }));

      // Ordena as visitas do dia pelo horário
      docs.sort((a, b) => a.horario.localeCompare(b.horario));

      setVisitasHoje(docs);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar visitas de hoje:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hojeKey]);

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
            />
          ))
        )}
      </ScrollView>
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
});
