import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getFormationsPaginated } from '../services/formationService';

const CATEGORIES = [
  { label: 'Toutes', value: 'toutes', color: '#6B6B6B' },
  { label: 'Panneautique', value: 'PANNEAUTIQUE', color: '#3BB273' },
  { label: 'Environnement', value: 'ENVIRONNEMENT', color: '#2ECC71' },
  { label: 'Santé', value: 'SANTE', color: '#27AE60' },
  { label: 'Infrastructure', value: 'INFRASTRUCTURE', color: '#1E8449' },
];

function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
}

const PAGE_LIMIT = 4;

export default function Formations() {
  const navigation = useNavigation();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('toutes');

  const fetchPage = useCallback(async (cat, pageNum, append = false) => {
    try {
      const result = await getFormationsPaginated(pageNum, PAGE_LIMIT, cat);
      if (append) {
        setFormations(prev => [...prev, ...result.data]);
      } else {
        setFormations(result.data);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch {
      if (!append) setFormations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchPage(activeCategory, 1, false);
  }, [activeCategory, fetchPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchPage(activeCategory, 1, false);
  }, [activeCategory, fetchPage]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchPage(activeCategory, page + 1, true);
    }
  }, [loadingMore, hasMore, loading, activeCategory, page, fetchPage]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Formations</Text>
        <Text style={styles.headerSubtitle}>Développez vos compétences</Text>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeCategory === item.value && { backgroundColor: item.color },
              ]}
              onPress={() => setActiveCategory(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3BB273" style={styles.loader} />
      ) : (
        <FlatList
          data={formations}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3BB273" />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#3BB273" style={styles.loaderMore} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>○</Text>
              <Text style={styles.emptyText}>Aucune formation trouvée</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FormationDetail', { formationId: item.id })}
            >
              <View style={[styles.cardBadge, { backgroundColor: CATEGORIES.find(c => c.value === item.category)?.color || '#3BB273' }]}>
                <Text style={styles.cardBadgeText}>{item.category}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.duration}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{formatPrice(item.price, item.isFree)}</Text>
                <Text style={styles.cardEnrolled}>{item.enrolledCount}/{item.capacity}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#3BB273',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  filterRow: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
  },
  filterChipText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#6B6B6B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loader: {
    marginTop: 40,
  },
  loaderMore: {
    paddingVertical: 20,
  },
  grid: {
    padding: 12,
  },
  gridRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  cardBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
    lineHeight: 18,
  },
  cardMeta: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  cardPrice: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#3BB273',
    fontWeight: '700',
  },
  cardEnrolled: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#9E9E9E',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    color: '#BDBDBD',
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    color: '#9E9E9E',
  },
});
