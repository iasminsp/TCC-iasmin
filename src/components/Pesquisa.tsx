import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PesquisaProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}

export function PesquisaCard({ value, onChangeText }: PesquisaProps) {
  const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#3b3f418a' : '#fff';
    const textColor = colorScheme === 'dark' ? '#e6e8ea9d' : '#69717584';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor } // Mantém a cor de fundo dinâmica do tema
      ]}
    >
      <Ionicons name="search-outline" size={28} color={textColor } />
      

      <TextInput
        placeholder="Pesquisar paciente..."
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3741512e',
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
});