import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
}

export default function Headerhome({ title, }: HeaderProps) {
  return (
    
   <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>

        <Text style={styles.headerTitle}>{title}</Text>

      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: '35%',  // Arredonda a própria área segura
    borderBottomRightRadius: '35%',
    width: '100%',
    marginBottom: 20,
   
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 20,
  },
});