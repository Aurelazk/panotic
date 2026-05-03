import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';

const ProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [subscription, setSubscription] = useState<any>(null);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/payments/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Fetch subscription profile error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscription();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await Keychain.resetGenericPassword();
      dispatch(logout());
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Citoyen Panotic'}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.roleHeader}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
          {subscription && (
            <View style={[styles.roleBadge, { backgroundColor: '#003366', marginLeft: 10 }]}>
              <Text style={styles.roleText}>{subscription.plan.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Signalements</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Niveau 1</Text>
          <Text style={styles.statLabel}>Engagement</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="person-outline" size={24} color="#003366" />
          <Text style={styles.menuText}>Modifier mon profil</Text>
          <Icon name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Pricing')}
        >
          <Icon name="card-outline" size={24} color="#003366" />
          <Text style={styles.menuText}>Mon Abonnement</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>
              {subscription?.plan?.toUpperCase() || 'AMATEUR'}
            </Text>
          </View>
          <Icon name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-outline" size={24} color="#003366" />
          <Text style={styles.menuText}>Notifications</Text>
          <Icon name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        {(user?.role === 'admin' || user?.role === 'autorite') && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Admin')}
          >
            <Icon name="shield-checkmark-outline" size={24} color="#FF6600" />
            <Text style={styles.menuText}>Administration</Text>
            <Icon name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#FF0000" />
          <Text style={[styles.menuText, { color: '#FF0000' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#003366',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#FF6600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 5,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  roleBadge: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menu: {
    padding: 20,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  planBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  logoutItem: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
});

export default ProfileScreen;
