import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TILE_TYPES = [
  { id: 'standard', label: 'Standard', icon: '🗺️' },
  { id: 'satellite', label: 'Satellite', icon: '🛰️' },
];

export default function MapOptions({ mapType, onToggle }) {
  return (
    <View style={styles.container}>
      {TILE_TYPES.map((t) => {
        const active = mapType === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => onToggle(t.id)}
            style={[styles.option, active && styles.optionActive]}
          >
            <Text style={styles.icon}>{t.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionActive: {
    backgroundColor: '#1E73BE',
  },
  icon: { fontSize: 14 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    fontFamily: 'CenturyGothic',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
