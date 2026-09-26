import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface AddProps {
  title: string;
  onPress?: () => void;
}

export function AddCard({ title, onPress }: AddProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <AntDesign name="plus" size={22} color="white" style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#0b851c',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderColor: '#d1d5db7e',
    borderWidth: 1,
    width: '100%',
    height: 48,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
});