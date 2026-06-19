import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { api } from '../../api/client';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const AdvertiserDashboard = () => {
  const navigation = useNavigation<any>();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, any>>({});

  const fetchMyCampaigns = async () => {
    try {
      const response = await api.get('/publicite/campaigns/me');
      const data = response.data;
      setCampaigns(data);
      // Batch-fetch analytics for each campaign
      const analyticsResults = await Promise.allSettled(
        data.map((c: any) => api.get(`/publicite/campaigns/${c.id}/analytics`))
      );
      const map: Record<string, any> = {};
      analyticsResults.forEach((res, idx) => {
        if (res.status === 'fulfilled') map[data[idx].id] = res.value.data;
      });
      setAnalyticsMap(map);
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyCampaigns();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyCampaigns();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const analytics = analyticsMap[item.id];
    return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.campaignName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="cash-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.budget?.toLocaleString()} FCFA</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="stats-chart-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.bookings?.length || 0} Espaces réservés</Text>
        </View>
      </View>

      {analytics && (
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCell}>
            <Icon name="eye-outline" size={16} color="#003366" />
            <Text style={styles.analyticsValue}>{analytics.totalImpressions?.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Impressions</Text>
          </View>
          <View style={styles.analyticsCell}>
            <Icon name="people-outline" size={16} color="#FF6600" />
            <Text style={styles.analyticsValue}>{analytics.reach?.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Portée</Text>
          </View>
          <View style={styles.analyticsCell}>
            <Icon name="trending-up-outline" size={16} color="#4CAF50" />
            <Text style={styles.analyticsValue}>{analytics.engagementRate}</Text>
            <Text style={styles.analyticsLabel}>Engagement</Text>
          </View>
        </View>
      )}

      {item.creativeUrl && (
        <Image source={{ uri: item.creativeUrl }} style={styles.previewImage} resizeMode="cover" />
      )}
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Campagnes</Text>
        <Text style={styles.subtitle}>Gérez vos espaces publicitaires et votre visibilité</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6600']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="megaphone-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Vous n'avez aucune campagne active.</Text>
              <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Marketplace')}
              >
                <Text style={styles.emptyBtnText}>Réserver un espace</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Marketplace')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#003366',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 10,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6600',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#003366',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  analyticsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsCell: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  analyticsLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default AdvertiserDashboard;
