import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/theme';

const MENU_ITEMS = [
  { label: 'Mon Abonnement', icon: '💳', screen: 'Pricing', color: '#FF6600' },
  { label: 'Notifications', icon: '🔔', screen: 'Notifications', color: '#007AFF' },
  { label: 'Confidentialité', icon: '🔒', screen: 'Confidentialite', color: '#34C759' },
  { label: 'Aide & Support', icon: '❓', screen: 'AideSupport', color: '#5856D6' },
];

export default function ProfileScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const initials = user?.email?.charAt(0).toUpperCase() || 'C';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
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
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Text style={{ fontSize: 18, color: COLORS.textTertiary }}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,59,48,0.08)' }]}>
              <Text style={{ fontSize: 18 }}>🚪</Text>
            </View>
            <Text style={styles.logoutText}>Déconnexion</Text>
            <Text style={{ fontSize: 18, color: '#FF3B30' }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F9' },
  header: {
    backgroundColor: '#0A1628', paddingTop: 56, paddingBottom: 36,
    alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6600', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  email: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 3 },
  badgeRow: { flexDirection: 'row', marginTop: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  body: { flex: 1 },
  statsCard: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20,
    marginTop: -26, borderRadius: 18, paddingVertical: 20, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10,
  },
  stat: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#EDF1F7' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  menu: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 14, marginBottom: 8, elevation: 1,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 14, fontSize: 15, fontWeight: '600', color: '#1A2A3A' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 14, marginTop: 16, borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.15)', elevation: 1,
  },
  logoutText: { flex: 1, marginLeft: 14, fontSize: 15, fontWeight: '600', color: '#FF3B30' },
});
