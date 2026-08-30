import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type IconFamily = 'Ionicons' | 'FontAwesome5' | 'MaterialIcons' | 'MaterialCommunityIcons';

interface FunçoesCardProps {
  iconFamily?: IconFamily;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  title: string;
  onPress?: () => void;
}

export function FunçoesCard({iconFamily, iconName, iconColor, iconSize, title, onPress}: FunçoesCardProps) {
  const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === 'dark' ? '#3b3f41' : '#fff';
    const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';
    const defaultIconColor = iconColor || (colorScheme === 'dark' ? '#90CAF9' : '#2563EB');

    const renderIcon = () => {
    if (!iconName) return null;

    const props = { name: iconName as any, size: iconSize, color: defaultIconColor };

    switch (iconFamily) {
      case 'FontAwesome5':
        return <FontAwesome5 {...props} />;
      case 'MaterialIcons':
        return <MaterialIcons {...props} />;
        case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...props} />;
      case 'Ionicons':
      default:
        return <Ionicons {...props} />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.cardContainer,{ backgroundColor},]}
    >
         {iconName && (
                <View style={styles.iconContainer}>
                  {renderIcon()}
                </View>
              )}

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
  iconContainer: {
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
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