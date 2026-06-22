import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/CarteInteractive.styles';

export default function MapOptions({ mapType, onToggle }) {
  return (
    <View style={styles.mapOptions}>
      <TouchableOpacity style={styles.optionBtn} onPress={onToggle}>
        <Text style={{ fontSize: 20 }}>{mapType === 'standard' ? '🗺️' : '🛰️'}</Text>
      </TouchableOpacity>
    </View>
  );
}
