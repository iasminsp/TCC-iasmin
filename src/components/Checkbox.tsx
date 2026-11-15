import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  textColor?: string; 
}

export function CheckboxOption({ label, checked, onPress, textColor }: CheckboxOptionProps) {
  const colorScheme = useColorScheme();
  const defaultTextColor = colorScheme === 'dark' ? '#F2F3F4' : '#11181C';
  const labelColor = textColor || defaultTextColor;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#0055A5',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#0055A5',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});