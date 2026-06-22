import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { styles } from '../styles/CarteInteractive.styles';

export default function SearchBar({
  query,
  onChange,
  onSubmit,
  onClear,
  results,
  onResultPress,
  onZoneResultPress,
}) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          placeholder="Rechercher panneaux, zones..."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          value={query}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Text style={{ fontSize: 18, color: COLORS.textTertiary }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {results && renderResults(results, onResultPress, onZoneResultPress)}
    </View>
  );
}

function renderResults(results, onResultPress, onZoneResultPress) {
  const hasPanels = results.panneaux && results.panneaux.length > 0;
  const hasZones = results.zones && results.zones.length > 0;
  if (!hasPanels && !hasZones) {
    return (
      <View style={styles.searchResults}>
        <Text style={styles.emptyFilterText}>Aucun résultat trouvé</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
      {hasPanels && results.panneaux.map((p, i) => (
        <TouchableOpacity
          key={`p-${i}`}
          style={styles.searchResultItem}
          onPress={() => onResultPress(p.lat, p.lng)}
        >
          <Text style={{ fontSize: 14 }}>📋</Text>
          <Text style={styles.searchResultText}>
            Panneau {p.type} - {p.format}
          </Text>
        </TouchableOpacity>
      ))}
      {hasZones && results.zones.map((z, i) => (
        <TouchableOpacity
          key={`z-${i}`}
          style={styles.searchResultItem}
          onPress={() => onZoneResultPress(z)}
        >
          <Text style={{ fontSize: 14 }}>🗺️</Text>
          <Text style={styles.searchResultText}>{z.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
