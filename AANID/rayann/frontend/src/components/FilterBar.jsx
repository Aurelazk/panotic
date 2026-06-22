import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import { SIGNALEMENT_TYPES, PANEL_TYPES, PANEL_STATUSES } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';

export default function FilterBar({ activeLayer, sigFilter, panelTypeFilter, panelStatusFilter, onSigFilter, onPanelTypeFilter, onPanelStatusFilter }) {
  return (
    <View style={styles.bottomControls}>
      {activeLayer === 'signalements' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {SIGNALEMENT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => onSigFilter(t.value)}
              style={[styles.filterChip, sigFilter === t.value && { backgroundColor: t.color }]}
            >
              <Text style={[styles.filterText, sigFilter === t.value && { color: COLORS.white }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {activeLayer === 'panneaux' && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {PANEL_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => onPanelTypeFilter(t.value)}
                style={[styles.filterChip, panelTypeFilter === t.value && styles.activeFilterChip]}
              >
                <Text style={[styles.filterText, panelTypeFilter === t.value && styles.activeFilterText]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {PANEL_STATUSES.map((s) => (
              <TouchableOpacity
                key={s.value}
                onPress={() => onPanelStatusFilter(s.value)}
                style={[styles.statusChip, panelStatusFilter === s.value && { backgroundColor: s.color, borderColor: s.color }]}
              >
                <View style={[styles.statusDot, { backgroundColor: s.color || COLORS.textTertiary }]} />
                <Text style={[styles.filterText, panelStatusFilter === s.value && { color: COLORS.white }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
