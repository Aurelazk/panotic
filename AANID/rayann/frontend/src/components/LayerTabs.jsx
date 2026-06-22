import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYERS } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';

const LAYER_ICONS = {
  'alert-circle': '⚠️',
  grid: '📋',
  square: '🔲',
  thermometer: '🌡️',
  'bar-chart': '📊',
};

export default function LayerTabs({ activeLayer, onSelect }) {
  return (
    <View style={styles.layerTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.layerScroll}>
        {LAYERS.map((l) => (
          <TouchableOpacity
            key={l.id}
            onPress={() => onSelect(l.id)}
            style={[styles.layerTab, activeLayer === l.id && styles.activeTab]}
          >
            <Text style={{ fontSize: 14, color: activeLayer === l.id ? COLORS.white : COLORS.textSecondary }}>
              {LAYER_ICONS[l.icon] || '📊'}
            </Text>
            <Text style={[styles.tabText, activeLayer === l.id && styles.activeTabText]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
