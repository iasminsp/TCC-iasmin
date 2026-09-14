import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  textColor?: string;
}

export function CheckboxOption({ label, checked, onPress, textColor }: CheckboxOptionProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#ffffff" />}
      </View>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text> 
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  boxChecked: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
  },
  label: {
    fontSize: 14,
    color: '#E0E0E0', // Adapte para a cor do seu tema
  },
});