import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig'; 
import Headerhome from '@/src/components/Headerhome';
import { AgendaCard } from '@/src/components/CardAgenda';
import { AcessosCard } from '@/src/components/Acessos';
import { useRouter } from 'expo-router';

interface Visita {
  id: string;
  pacienteNome: string;
  motivo: string;
  horario: string;
  endereco: string;
  data: string;
  status: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';   
  
  const [visitasHoje, setVisitasHoje] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitaSelecionada, setVisitaSelecionada] = useState<Visita | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [atendimentosMes, setAtendimentosMes] = useState<number>(0);

  // Pega a data de HOJE
  const hojeKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    // pega a visitas de HOJE
    const qVisitas = query(
      collection(db, 'visitas'),
      where('data', '==', hojeKey),
      where('userId', '==', user.uid)
    );

    const unsubscribeVisitas = onSnapshot(qVisitas, (snapshot) => {
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

    // Total de Pacientes at
    const unsubscribePacientes = onSnapshot(collection(db, 'pacientes'), (snapshot) => {
      setTotalPacientes(snapshot.size);
    });

    // Total de Atendimentos do MÊS 
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const qAtendimentos = query(
      collection(db, 'atendimentos'),
      where('createdAt', '>=', inicioMes)
    );

    const unsubscribeAtendimentos = onSnapshot(qAtendimentos, (snapshot) => {
      setAtendimentosMes(snapshot.size);
    }, (error) => {
      console.error('Erro ao contar atendimentos do mês:', error);
    });

    return () => {
      unsubscribeVisitas();
      unsubscribePacientes();
      unsubscribeAtendimentos();
    };
  }, [hojeKey]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View>
        <Headerhome title="Olá Dra. iasmin" />
      </View>

      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}>
        Acessos rápidos
      </Text>

      <View style={styles.gridContainer}>
        <AcessosCard 
          iconFamily="FontAwesome5" 
          iconName="address-book" 
          iconColor="#357eec" 
          iconSize={30}
          title={`Agendamentos do dia: ${visitasHoje.length}`} 
          onPress={() => {}} 
        />

        <AcessosCard 
          iconFamily="MaterialIcons" 
          iconName="people" 
          iconColor="#0f9d58" 
          iconSize={30}
          title={`Pacientes Ativos: ${totalPacientes}`} 
          onPress={() => router.push('/pacientes' as any)} 
        />

        <AcessosCard 
          iconFamily="MaterialCommunityIcons" 
          iconName="file-document-check-outline" 
          iconColor="#ff8503" 
          iconSize={30}
          title={`Atendimentos no Mês: ${atendimentosMes}`} 
          onPress={() => {}} 
        />
      </View>

      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, margin: 20 }}> 
        Agendamentos do dia
      </Text>

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
});