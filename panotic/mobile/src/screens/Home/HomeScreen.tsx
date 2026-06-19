import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { COLORS, SHADOWS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';

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

  const StatCard = ({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <LinearGradient colors={['#0A1628', '#001B3D', '#002A5C']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.firstName || user?.fullName || user?.email?.split('@')[0]}</Text>
            <View style={styles.locationRow}>
              <Icon name="location-outline" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.locationText}>Dakar, Sénégal</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Profil', { screen: 'Notifications' })}
            >
              <Icon name="notifications-outline" size={22} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profil')}>
              <View style={styles.avatarInner}>
                <Icon name="person" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard icon="megaphone-outline" value="12" label="Signalements" color={COLORS.secondary} />
          <StatCard icon="school-outline" value="1" label="Formations" color="#007AFF" />
          <StatCard icon="chatbubbles-outline" value="5" label="Messages" color="#34C759" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Formations & Réformes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Formation')}>
            <Text style={styles.sectionAction}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.featureCard} activeOpacity={0.9} onPress={() => navigation.navigate('Formation')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' }}
            style={styles.featureBg}
          />
          <LinearGradient colors={['transparent', 'rgba(0,27,61,0.9)']} style={styles.featureOverlay}>
            <View style={styles.featureContent}>
              <View style={styles.featureTag}>
                <Text style={styles.featureTagText}>NOUVEAU</Text>
              </View>
              <Text style={styles.featureTitle}>Réforme Urbaine & Numérique</Text>
              <Text style={styles.featureDesc}>
                Audit, État des lieux et Zonage du Mobilier Urbain – Module 1
              </Text>
              <View style={styles.featureBtn}>
                <Text style={styles.featureBtnText}>Commencer</Text>
                <Icon name="arrow-forward" size={14} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actualités de la ville</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Plus</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.newsList}>
          <TouchableOpacity style={styles.newsCard} activeOpacity={0.7}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000' }}
              style={styles.newsImg}
            />
            <View style={styles.newsBody}>
              <View style={styles.newsMeta}>
                <Icon name="calendar-outline" size={12} color={COLORS.textTertiary} />
                <Text style={styles.newsDate}>12 Juin 2026</Text>
                <View style={styles.newsCategory}>
                  <Text style={styles.newsCategoryText}>Aménagement</Text>
                </View>
              </View>
              <Text style={styles.newsTitle}>Plan d'embellissement des avenues</Text>
              <Text style={styles.newsDesc}>
                La municipalité lance une grande réforme du mobilier urbain pour moderniser nos avenues principales.
              </Text>
              <View style={styles.newsFooter}>
                <Text style={styles.newsLink}>Lire l'article</Text>
                <Icon name="arrow-forward" size={14} color={COLORS.secondary} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Signalement')}>
            <View style={[styles.actionIconWrap, { backgroundColor: `${COLORS.secondary}18` }]}>
              <Icon name="add-circle" size={26} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionLabel}>Nouveau signalement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Carte')}>
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(0,122,255,0.12)' }]}>
              <Icon name="map" size={26} color="#007AFF" />
            </View>
            <Text style={styles.actionLabel}>Voir la carte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Social')}>
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(88,86,214,0.12)' }]}>
              <Icon name="people" size={26} color="#5856D6" />
            </View>
            <Text style={styles.actionLabel}>Communauté</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  headerGradient: {
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.secondary,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0A1628',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -26,
    gap: 10,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: '#0A1628',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
  },
  sectionAction: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  featureCard: {
    marginHorizontal: 16,
    height: 210,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  featureBg: {
    width: '100%',
    height: '100%',
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'flex-end',
  },
  featureContent: {},
  featureTag: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  featureTagText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 1,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  featureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  featureBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 6,
  },
  newsList: {
    paddingHorizontal: 16,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  newsImg: {
    width: '100%',
    height: 150,
  },
  newsBody: {
    padding: 18,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  newsDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  newsCategory: {
    backgroundColor: 'rgba(0,51,102,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newsCategoryText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '600',
  },
  newsTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0A1628',
    marginBottom: 4,
  },
  newsDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsLink: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A1628',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HomeScreen;
