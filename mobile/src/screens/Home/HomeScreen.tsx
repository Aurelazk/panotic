import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.firstName || user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-outline" size={24} color="#003366" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="megaphone-outline" size={24} color="#1976D2" />
          <Text style={styles.statNum}>12</Text>
          <Text style={styles.statLabel}>Signalements</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="school-outline" size={24} color="#7B1FA2" />
          <Text style={styles.statNum}>1</Text>
          <Text style={styles.statLabel}>Formations</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Formations & Réformes</Text>
      <TouchableOpacity 
        style={styles.formationBanner}
        onPress={() => navigation.navigate('Formation')}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' }} 
          style={styles.bannerImg} 
        />
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTag}>NOUVEAU - MODULE 1</Text>
            <Text style={styles.bannerTitle}>Réforme de la Panneautique</Text>
            <Text style={styles.bannerDesc}>
              Audit, État des lieux et Zonage du Mobilier Urbain.
            </Text>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Découvrir</Text>
              <Icon name="arrow-forward" size={16} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Actualités de la ville</Text>
      <View style={styles.newsCard}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000' }} 
          style={styles.newsImg} 
        />
        <View style={styles.newsBody}>
          <Text style={styles.newsTitle}>Lancement du plan d'embellissement</Text>
          <Text style={styles.newsDesc}>La municipalité lance une grande réforme du mobilier urbain pour moderniser nos avenues.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  welcome: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  notifBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  statNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  formationBanner: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#FF6600',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 51, 102, 0.6)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  bannerContent: {
    width: '100%',
  },
  bannerTag: {
    color: '#FF6600',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 15,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6600',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 5,
  },
  newsCard: {
    marginHorizontal: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden',
  },
  newsImg: {
    width: '100%',
    height: 120,
  },
  newsBody: {
    padding: 15,
  },
  newsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  newsDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default HomeScreen;
