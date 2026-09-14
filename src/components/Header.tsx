import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  showBack?: boolean; 
  onIconPress?: () => void;
}

export default function Header({ title, iconName, showBack = true, onIconPress }: HeaderProps) {

  return ( 
   <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* Botão Voltar */}
        {showBack && (
          <TouchableOpacity onPress={() =>console.log('Ícone Clicado')}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Título */}
        <Text style={styles.headerTitle}>{title}</Text>

        {/* Ícone Direita */}
        {iconName && (
          <TouchableOpacity onPress={onIconPress}>
            <Ionicons name={iconName} size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 16,  // Arredonda a própria área segura
    borderBottomRightRadius: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 20,
    justifyContent: 'space-between',
    marginRight: 20,
    marginLeft: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    
    
  },
});