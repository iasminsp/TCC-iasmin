import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

interface AgendaCardProps {
  horario: string;
  nome: string;
  endereco: string;
  status?: string;
  onPress?: () => void;
  onStatusPress?: () => void;
}

export function AgendaCard({ 
  horario, 
  nome, 
  endereco, 
  status = 'Agendado', 
  onPress, 
  onStatusPress 
}: AgendaCardProps) {
  const colorScheme = useColorScheme();
  
  const cardBackgroundColor = colorScheme === 'dark' ? '#2A2D32' : '#f3f4f6';
  const nameTextColor = colorScheme === 'dark' ? '#ffffff' : '#11181C';
  const addressTextColor = colorScheme === 'dark' ? '#9CA3AF' : '#6b7280';
  

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      style={[styles.card, { backgroundColor: cardBackgroundColor }]}
    >
      <View style={styles.timeBadge}>
        <Text style={styles.timeText}>{horario}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.nameText, { color: nameTextColor }]} numberOfLines={1}>
          {nome}
        </Text>
        <Text style={[styles.addressText, { color: addressTextColor }]} numberOfLines={1}>
          {endereco}
        </Text>
      </View>

      {/* Clique na Tag/Badge de Status */}
      <TouchableOpacity activeOpacity={0.7} onPress={onStatusPress} style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  timeBadge: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '600',
  },
});