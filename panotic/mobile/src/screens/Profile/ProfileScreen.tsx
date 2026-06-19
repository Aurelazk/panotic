import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

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

  const initials = user?.email?.charAt(0).toUpperCase() || 'C';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <LinearGradient colors={['#0A1628', '#001B3D', '#002A5C']} style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {(user?.profilePicture || user?.avatar) ? (
              <Image source={{ uri: user?.profilePicture || user?.avatar || '' }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Icon name="camera" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.fullName || 'Citoyen AANID'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Icon name="shield-checkmark" size={11} color="#FFFFFF" />
              <Text style={styles.badgeLabel}>{user?.role || 'CITOYEN'}</Text>
            </View>
            {subscription && (
              <View style={[styles.roleBadge, styles.subBadge]}>
                <Icon name="diamond" size={11} color="#FFFFFF" />
                <Text style={styles.badgeLabel}>{subscription.plan}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Niv. 1</Text>
            <Text style={styles.statLabel}>Engagement</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Récompenses</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <Text style={styles.menuSection}>Général</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,51,102,0.08)' }]}>
              <Icon name="person-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>Modifier mon profil</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Pricing')}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,102,0,0.08)' }]}>
              <Icon name="card-outline" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuText}>Mon Abonnement</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeText}>{subscription?.plan || 'AMATEUR'}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,122,255,0.08)' }]}>
              <Icon name="notifications-outline" size={20} color="#007AFF" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <Text style={[styles.menuSection, { marginTop: 28 }]}>Paramètres</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Confidentialite')}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(52,199,89,0.08)' }]}>
              <Icon name="lock-closed-outline" size={20} color="#34C759" />
            </View>
            <Text style={styles.menuText}>Confidentialité</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AideSupport')}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(88,86,214,0.08)' }]}>
              <Icon name="help-circle-outline" size={20} color="#5856D6" />
            </View>
            <Text style={styles.menuText}>Aide & Support</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {(user?.role === 'ADMIN' || user?.role === 'AUTORITE') && (
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,102,0,0.1)' }]}>
                <Icon name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.menuText}>Administration</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,59,48,0.08)' }]}>
              <Icon name="log-out-outline" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.logoutText}>Déconnexion</Text>
            <Icon name="chevron-forward" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 14,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  name: {
    color: '#fff',
    ...TYPOGRAPHY.h3,
  },
  email: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  subBadge: {
    backgroundColor: COLORS.secondary,
  },
  badgeLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -26,
    borderRadius: 18,
    paddingVertical: 20,
    ...SHADOWS.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EDF1F7',
  },
  statValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menu: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  menuSection: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2A3A',
  },
  valueBadge: {
    backgroundColor: 'rgba(255,102,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  valueBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  adminBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.15)',
    ...SHADOWS.sm,
  },
  logoutText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

export default ProfileScreen;
