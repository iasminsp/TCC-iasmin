import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';

interface ConfigCardProps {
  title: string;
  onPress?: () => void;
}

export function ConfigCard({title, onPress}: ConfigCardProps) {
  const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#3b3f41' : '#fff';
    const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.cardContainer,{ backgroundColor},]}
    >

      <View style={styles.infoContainer}>
        <Text style={[styles.titleText, { color: textColor }]}>
          {title}
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
    padding: 15,
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
  infoContainer: {
    flex: 1,
    marginLeft: 27,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
});