import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, SafeAreaView, Modal, TextInput, ScrollView } from 'react-native';
export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>

      </View>
      <Text> agenda</Text>
    </View>
        
    
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "#5c0b0b",
    textShadowColor: "#c71a1a"
  },
  header:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft:"90%",
    marginTop:'-15%',
    backgroundColor: 'blue'
  }
})