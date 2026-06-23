import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getMyFormations, getMyBadges } from '../services/formationService';

function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
}

export default function MesFormations() {
  const navigation = useNavigation();
  const [formations, setFormations] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('enCours');

  const fetchData = useCallback(async () => {
    try {
      const [myFormations, myBadges] = await Promise.all([
        getMyFormations(),
        getMyBadges(),
      ]);
      setFormations(myFormations);
      setBadges(myBadges);
    } catch {
      setFormations([]);
      setBadges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const enCours = formations.filter(f => !f.completedAt);
  const terminees = formations.filter(f => f.completedAt);

  const renderFormation = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('FormationDetail', { formationId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, item.completedAt ? styles.statusDone : styles.statusProgress]}>
          <Text style={styles.statusText}>{item.completedAt ? 'Terminé' : `${item.progress}%`}</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.completedAt ? '#2E7D32' : '#3BB273' }]} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>{formatPrice(item.price, item.isFree)}</Text>
        <Text style={styles.cardDate}>
          {item.completedAt
            ? `Fini le ${new Date(item.completedAt).toLocaleDateString()}`
            : `Depuis le ${new Date(item.enrolledAt).toLocaleDateString()}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderBadge = ({ item }) => (
    <View style={styles.badgeCard}>
      <View style={styles.badgeIcon}>
        <Text style={styles.badgeIconText}>🏅</Text>
      </View>
      <Text style={styles.badgeTitle} numberOfLines={2}>{item.label}</Text>
      <Text style={styles.badgeDate}>
        {new Date(item.earnedAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Formations</Text>
        <Text style={styles.headerSubtitle}>Suivez votre progression</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'enCours' && styles.tabActive]}
          onPress={() => setTab('enCours')}
        >
          <Text style={[styles.tabText, tab === 'enCours' && styles.tabTextActive]}>
            En cours ({enCours.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'terminees' && styles.tabActive]}
          onPress={() => setTab('terminees')}
        >
          <Text style={[styles.tabText, tab === 'terminees' && styles.tabTextActive]}>
            Terminées ({terminees.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'badges' && styles.tabActive]}
          onPress={() => setTab('badges')}
        >
          <Text style={[styles.tabText, tab === 'badges' && styles.tabTextActive]}>
            Badges ({badges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3BB273" style={styles.loader} />
      ) : tab === 'badges' ? (
        <FlatList
          data={badges}
          keyExtractor={(item, idx) => `${item.formationId}-${idx}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3BB273" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏅</Text>
              <Text style={styles.emptyTitle}>Aucun badge</Text>
              <Text style={styles.emptyText}>Terminez une formation pour gagner un badge</Text>
            </View>
          }
          renderItem={renderBadge}
        />
      ) : (
        <FlatList
          data={tab === 'enCours' ? enCours : terminees}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3BB273" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{tab === 'enCours' ? '📚' : '🎉'}</Text>
              <Text style={styles.emptyTitle}>
                {tab === 'enCours' ? 'Aucune formation en cours' : 'Aucune formation terminée'}
              </Text>
              <Text style={styles.emptyText}>
                {tab === 'enCours' ? 'Inscrivez-vous à une formation pour commencer' : 'Complétez une formation pour la voir ici'}
              </Text>
            </View>
          }
          renderItem={renderFormation}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3BB273',
  },
  tabText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#3BB273',
    fontWeight: '700',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
  },
  grid: {
    padding: 12,
  },
  gridRow: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusProgress: {
    backgroundColor: '#E8F5E9',
  },
  statusDone: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#9E9E9E',
  },
  cardDate: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#BDBDBD',
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeIconText: {
    fontSize: 28,
  },
  badgeTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeDate: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: '#9E9E9E',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
