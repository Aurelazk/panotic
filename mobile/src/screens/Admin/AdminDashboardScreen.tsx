import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { api } from '../../api/client';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  const [showUgcModal, setShowUgcModal] = useState(false);
  const [ugcPosts, setUgcPosts] = useState<any[]>([]);
  const [ugcLoading, setUgcLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Fetch admin stats error:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const exportCSV = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/export-csv');
      Share.share({ message: res.data.csv, title: 'Export Panotic CSV' });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de générer le rapport');
    } finally {
      setLoading(false);
    }
  };

  const openUsersManagement = async () => {
    setShowUsersModal(true);
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const assignRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      Alert.alert('Erreur', 'Modification echouée');
    }
  };

  const assignBadge = async (userId: string, newBadge: string) => {
    try {
      await api.patch(`/admin/users/${userId}/badge`, { badge: newBadge });
      Alert.alert('Succès', 'Badge attribué');
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, badge: newBadge } : u));
    } catch (e) {
      Alert.alert('Erreur', 'Modification echouée');
    }
  };

  const openUgcModeration = async () => {
    setShowUgcModal(true);
    setUgcLoading(true);
    try {
      const res = await api.get('/ugc?limit=50&sortBy=recent');
      setUgcPosts(res.data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setUgcLoading(false);
    }
  };

  const deleteUgcPost = async (postId: string) => {
    Alert.alert('Confirmation', 'Supprimer cette publication ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/admin/ugc/${postId}`);
          setUgcPosts(prev => prev.filter(p => p.id !== postId));
        } catch (e) {
          Alert.alert('Erreur', 'Suppression echouée');
        }
      }}
    ]);
  };

  const StatCard = ({ title, value, subValue, icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subValue && <Text style={styles.statSub}>{subValue}</Text>}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion Panotic</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6600']} />}
      >
        <Text style={styles.sectionTitle}>Performance Plateforme</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Signalements"
            value={stats?.signalements?.total || 0}
            subValue={`${Math.round(stats?.signalements?.percentageResolved || 0)}% résolus`}
            icon="map-outline"
            color="#1976D2"
          />
          <StatCard
            title="Utilisateurs"
            value={stats?.users?.total || 0}
            subValue="Inscrits total"
            icon="people-outline"
            color="#4CAF50"
          />
          <StatCard
            title="Inscriptions"
            value={stats?.formations?.enrollments || 0}
            subValue={`${stats?.formations?.total || 0} modules`}
            icon="school-outline"
            color="#7B1FA2"
          />
          <StatCard
            title="Publicité"
            value={stats?.publicite?.active || 0}
            subValue="Campagnes actives"
            icon="megaphone-outline"
            color="#FF6600"
          />
        </View>

        <Text style={styles.sectionTitle}>Actions Administratives</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={openUsersManagement}>
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="people-circle-outline" size={24} color="#1976D2" />
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Gestion des Utilisateurs</Text>
            <Text style={styles.actionDesc}>Modifier rôles et badges</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={openUgcModeration}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="shield-checkmark-outline" size={24} color="#FF9800" />
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Modération Contenus UGC</Text>
            <Text style={styles.actionDesc}>Gérer et purger les publications</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={exportCSV}>
          <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Icon name="document-text-outline" size={24} color="#7B1FA2" />
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Exporter Rapport CSV</Text>
            <Text style={styles.actionDesc}>Extraire l'audit de signalements</Text>
          </View>
          <Icon name="download-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.monitoringBox}>
          <Text style={styles.monitorTitle}>État du Système</Text>
          <View style={styles.monitorRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Serveurs API : Fonctionnels (Cloud)</Text>
          </View>
          <View style={styles.monitorRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Base de données : Synchronisée</Text>
          </View>
        </View>
      </ScrollView>

      {/* Users Modal */}
      <Modal visible={showUsersModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gestion des Utilisateurs</Text>
            <TouchableOpacity onPress={() => setShowUsersModal(false)}>
              <Icon name="close" size={28} color="#003366" />
            </TouchableOpacity>
          </View>
          {usersLoading ? <ActivityIndicator size="large" /> : (
            <FlatList
              data={usersList}
              keyExtractor={u => u.id}
              renderItem={({item}) => (
                <View style={styles.userCard}>
                  <View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.userRole}>Rôle: {item.role}</Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => assignRole(item.id, 'formateur')}>
                      <Text style={styles.smallBtnText}>Passer Formateur</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, {backgroundColor: '#4CAF50'}]} onPress={() => assignBadge(item.id, 'Super Citoyen')}>
                      <Text style={styles.smallBtnText}>Badge Écolo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      {/* UGC Moderation Modal */}
      <Modal visible={showUgcModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modération Contenus UGC</Text>
            <TouchableOpacity onPress={() => setShowUgcModal(false)}>
              <Icon name="close" size={28} color="#003366" />
            </TouchableOpacity>
          </View>
          {ugcLoading ? <ActivityIndicator size="large" /> : (
            <FlatList
              data={ugcPosts}
              keyExtractor={p => p.id}
              renderItem={({item}) => (
                <View style={styles.userCard}>
                  <View style={{flex: 1, paddingRight: 10}}>
                    <Text style={styles.userEmail}>{item.author?.email}</Text>
                    <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
                  </View>
                  <TouchableOpacity style={[styles.smallBtn, {backgroundColor: '#F44336'}]} onPress={() => deleteUgcPost(item.id)}>
                    <Text style={styles.smallBtnText}>PURGER</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 15,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    //
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statSub: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionBody: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  actionDesc: {
    fontSize: 12,
    color: '#888',
  },
  monitoringBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#003366',
    marginBottom: 50,
  },
  monitorTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  monitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userEmail: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  userRole: {
    color: '#FF6600',
    fontSize: 12,
  },
  postContent: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  userActions: {
    flexDirection: 'column',
  },
  smallBtn: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  smallBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
