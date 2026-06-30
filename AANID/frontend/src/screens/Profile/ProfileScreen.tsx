import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard, faBell, faLock, faCircleQuestion,
  faRightFromBracket, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const MENU_ITEMS = [
  { label: 'Mon Abonnement', icon: faCreditCard, screen: 'Pricing', color: COLORS.warning },
  { label: 'Notifications', icon: faBell, screen: 'Notifications', color: COLORS.primary },
  { label: 'Confidentialité', icon: faLock, screen: 'Confidentialite', color: COLORS.success },
  { label: 'Aide & Support', icon: faCircleQuestion, screen: 'AideSupport', color: COLORS.secondary },
];

export default function ProfileScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const initials = user?.email?.charAt(0).toUpperCase() || 'C';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName || 'Citoyen'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.role || 'CITOYEN'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.stat}><Text style={styles.statValue}>--</Text><Text style={styles.statLabel}>Signalements</Text></View>
          <View style={styles.divider} />
          <View style={styles.stat}><Text style={styles.statValue}>Niv. 1</Text><Text style={styles.statLabel}>Engagement</Text></View>
          <View style={styles.divider} />
          <View style={styles.stat}><Text style={styles.statValue}>--</Text><Text style={styles.statLabel}>Récompenses</Text></View>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.screen} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                <FontAwesomeIcon icon={item.icon} size={17} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <FontAwesomeIcon icon={faChevronRight} size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
            <View style={[styles.menuIcon, { backgroundColor: COLORS.error + '18' }]}>
              <FontAwesomeIcon icon={faRightFromBracket} size={17} color={COLORS.error} />
            </View>
            <Text style={styles.logoutText}>Déconnexion</Text>
            <FontAwesomeIcon icon={faChevronRight} size={14} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark, paddingTop: 56, paddingBottom: 36,
    alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { color: COLORS.white, fontSize: 32, fontWeight: 'bold', fontFamily: FONT_FAMILY },
  name: { color: COLORS.white, fontSize: 20, fontWeight: '700', fontFamily: FONT_FAMILY },
  email: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 3, fontFamily: FONT_FAMILY },
  badgeRow: { flexDirection: 'row', marginTop: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, fontFamily: FONT_FAMILY },
  body: { flex: 1 },
  statsCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 20,
    marginTop: -26, borderRadius: 18, paddingVertical: 20, elevation: 3,
    shadowColor: COLORS.shadow, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  stat: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: COLORS.border },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary, fontFamily: FONT_FAMILY },
  statLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, fontFamily: FONT_FAMILY },
  menu: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 14, marginBottom: 8, elevation: 1,
    shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 14, fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONT_FAMILY },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 14, marginTop: 16, borderWidth: 1,
    borderColor: COLORS.error + '33', elevation: 1,
  },
  logoutText: { flex: 1, marginLeft: 14, fontSize: 15, fontWeight: '600', color: COLORS.error, fontFamily: FONT_FAMILY },
});
