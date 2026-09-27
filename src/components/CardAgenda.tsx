import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';

interface AgendaCardProps {
  horario: string;
  nome: string;
  endereco: string;
  status?: string;
  onPress?: () => void;
}

export function AgendaCard({horario, nome, endereco, status = 'Agendado', onPress}: AgendaCardProps) {
  const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#3b3f41' : '#fff';
    const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

    const getStatusTextColor = () => {
    switch (status) {
      case 'Atendido':
        return '#22c55e'; // Verde
      case 'Faltou/Cancelado':
        return '#ef4444'; // Vermelho
      default:
        return '#2563eb'; // Azul padrão (Agendado)
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7} onPress={onPress} style={[styles.cardContainer,{ backgroundColor},]}>
      {/* Bloco do Horário */}
      <View style={[styles.timeBox, { backgroundColor: '#0f66e8'}]}>
        <Text style={[styles.timeText, { color: 'white' }]}>
          {horario}
        </Text>
      </View>

      {/* Bloco das Informações (Nome e Endereço) */}
      <View style={styles.infoContainer}>
        <Text style={[styles.nomeText, { color: textColor }]}>
          {nome}
        </Text>
        <Text style={[styles.enderecoText, { color: textColor }]}>
          {endereco}
        </Text>
      </View>

      {/* Tag de Status */}
     <View style={styles.statusTag}>
        <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 22,
    marginLeft: "5%",
    marginTop: 20,
    width:'90%',
    // Sombra leve para destacar no fundo claro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timeBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 27,
    justifyContent: 'center',
  },
  nomeText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  enderecoText: {
    fontSize: 12,
  },
  statusTag: {
    backgroundColor: '#e0e7ff', // Azul claro
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 20,
  },
  statusText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '600',
  },
});