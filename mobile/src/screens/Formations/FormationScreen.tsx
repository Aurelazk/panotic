import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, ImageBackground, TouchableOpacity } from 'react-native';
import { api } from '../../api/client';
import FormationCard from '../../components/FormationCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const CATEGORIES = [
  { label: 'Tous', value: '' },
  { label: 'Panneautique', value: 'panneautique' },
  { label: 'Environnement', value: 'environnement' },
  { label: 'Vie Saine', value: 'vie_saine' },
  { label: 'Infrastructure', value: 'infrastructure' },
];

const FormationScreen = () => {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigation = useNavigation<any>();

  const fetchFormations = async () => {
    setLoading(true);
    try {
      const url = selectedCategory 
        ? `/formations?category=${selectedCategory}`
        : '/formations';
      const response = await api.get(url);
      setFormations(response.data);
    } catch (error) {
      console.error('Fetch formations error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFormations();
    }, [selectedCategory])
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4' }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Formations & Réformes</Text>
          <Text style={styles.heroSubtitle}>Développez vos compétences et transformez la ville</Text>
        </View>
      </ImageBackground>

      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.value)}
              style={[
                styles.categoryChip,
                selectedCategory === item.value && styles.activeChip
              ]}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === item.value && styles.activeChipText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={formations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FormationCard 
              formation={item} 
              onPress={() => navigation.navigate('FormationDetail', { id: item.id })} 
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune formation disponible dans cette catégorie.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  hero: {
    width: '100%',
    height: 180,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 51, 102, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeChip: {
    backgroundColor: '#FF6600',
    borderColor: '#FF6600',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#fff',
  },
  list: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
});

export default FormationScreen;
