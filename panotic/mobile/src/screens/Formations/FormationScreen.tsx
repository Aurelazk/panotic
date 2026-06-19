import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity, StatusBar, Image, Dimensions } from 'react-native';
import { api } from '../../api/client';
import FormationCard from '../../components/FormationCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const CATEGORIES = [
  { label: 'Tous', value: '', icon: 'apps-outline' },
  { label: 'Panneautique', value: 'panneautique', icon: 'easel-outline' },
  { label: 'Environnement', value: 'environnement', icon: 'leaf-outline' },
  { label: 'Vie Saine', value: 'vie_saine', icon: 'heart-outline' },
  { label: 'Infrastructure', value: 'infrastructure', icon: 'business-outline' },
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
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <LinearGradient colors={['#0A1628', '#001B3D', '#002A5C']} style={styles.hero}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4' }}
          style={styles.heroBg}
        />
        <View style={styles.heroOverlay}>
          <View style={styles.heroIcon}>
            <Icon name="school" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Formations & Réformes</Text>
          <Text style={styles.heroSub}>Développez vos compétences et transformez la ville</Text>
        </View>
      </LinearGradient>

      <View style={styles.chipBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.value)}
              style={[styles.chip, selectedCategory === item.value && styles.chipActive]}
            >
              <Icon name={item.icon} size={16} color={selectedCategory === item.value ? '#fff' : COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.chipText, selectedCategory === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipList}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 50 }} />
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
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucune formation disponible dans cette catégorie.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  hero: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,27,61,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,102,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: '#fff',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  chipBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    paddingVertical: 10,
  },
  chipList: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    fontSize: 15,
  },
});

export default FormationScreen;
