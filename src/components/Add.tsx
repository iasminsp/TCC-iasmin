import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

interface AddProps {
  onPress?: () => void;
}

export function AddCard({ onPress}: AddProps) {

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.cardContainer]}
    >
      <View style={[{ marginLeft: 78 }]}>
        <AntDesign name="plus" size={24} color="white" />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.text]}>
          Adicionar nova visita
        </Text>
      </View>
    </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
    borderBottomLeftRadius: 16,  // Arredonda a própria área segura
    borderBottomRightRadius: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#0b851c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 22,
    borderColor: '#d1d5db7e',
    borderWidth: 1,
    margin: "5%",
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
    marginLeft: 7,
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    color: 'white',
  },
});