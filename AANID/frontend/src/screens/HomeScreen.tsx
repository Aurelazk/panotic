import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS } from '../../rayann/frontend/src/constants/colors';
import { useNavigation } from '@react-navigation/native';

const QUICK_ACTIONS = [
  { name: 'Carte', icon: '🗺️', tab: 'Carte' },
  { name: 'Signaler', icon: '📸', tab: 'Signalement' },
  { name: 'Social', icon: '💬', tab: 'Social' },
  { name: 'Formations', icon: '🎓', tab: 'Formation' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenue sur</Text>
        <Text style={styles.title}>AANID</Text>
        <Text style={styles.subtitle}>Transformation Urbaine</Text>
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.name}
              style={styles.quickCard}
              onPress={() => navigation.navigate(a.tab)}
            >
              <Text style={styles.quickIcon}>{a.icon}</Text>
              <Text style={styles.quickLabel}>{a.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tableau de bord</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Signalements</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Notifications</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>Niv. 1</Text>
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 30,
    paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickCard: {
    width: '47%', backgroundColor: COLORS.white, borderRadius: 16, padding: 20,
    alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  quickIcon: { fontSize: 32, marginBottom: 8 },
  quickLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  statsCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  statsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', marginTop: 2 },
});
