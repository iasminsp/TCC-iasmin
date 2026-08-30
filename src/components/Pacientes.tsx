import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface PacientesProps {
  nome: string;
  condicao: string;
  idade: string;
  onPress?: () => void;
}

export function PacientesCard({ nome, condicao, idade, onPress}: PacientesProps) {
  const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#3b3f41' : '#fff';
    const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.cardContainer,{ backgroundColor},
      ]}
    >
      {/* Bloco do Horário */}
      <View>
        <Ionicons name="person-circle-outline" size={38} color={textColor } />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.nomeText, { color: textColor }]}>
          {nome}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.condicaoText, { color: textColor }]}>
            {condicao}
          </Text>
          <Text style={{ fontSize: 12, color: textColor, marginHorizontal: 6 }}>•</Text>
          <Text style={[styles.idadeText, { color: textColor }]}>
            {idade}
          </Text>
        </View>
      </View>
        <MaterialIcons name="arrow-forward-ios" size={24} color={textColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
  condicaoText: {
    fontSize: 12,
    paddingRight: 4, 
  },
  idadeText: {
    fontSize: 12,
    paddingLeft: 4, 
  },
});