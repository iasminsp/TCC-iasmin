import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PesquisaProps {
  onPress?: () => void;
}

export function PesquisaCard({ onPress}: PesquisaProps) {
  const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#3b3f418a' : '#fff';
    const textColor = colorScheme === 'dark' ? '#e6e8ea9d' : '#69717584';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.cardContainer,{ backgroundColor},
      ]}
    >
      <View>
        <Ionicons name="search-outline" size={28} color={textColor } />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.text, { color: textColor }]}>
          pesquisar pacientes
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
    padding: 8,
    borderRadius: 22,
    borderColor: '#d1d5db7e',
    borderWidth: 1,
    marginLeft: "5%",
    marginTop: 30,
    marginBottom: 20,
    width:'90%',
    height: 45,
    // Sombra leve para destacar no fundo claro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 27,
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
});