import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';

const SETTINGS = [
  { icon: '👁️', label: 'Données personnelles', desc: 'Gérer mes informations' },
  { icon: '🔒', label: 'Mot de passe & sécurité', desc: 'Changer mon mot de passe' },
  { icon: '🔕', label: 'Notifications', desc: 'Gérer mes alertes' },
  { icon: '📍', label: 'Géolocalisation', desc: 'Partager ma position' },
  { icon: '🗑️', label: 'Supprimer mon compte', desc: 'Suppression définitive', danger: true },
];

export default function ConfidentialiteScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          <Text style={styles.desc}>Gérez vos données personnelles, votre sécurité et vos préférences.</Text>
        </View>
        {SETTINGS.map((item, i) => (
          <TouchableOpacity key={i} style={styles.item}>
            <View style={[styles.iconBg, item.danger && { backgroundColor: 'rgba(255,59,48,0.08)' }]}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, item.danger && { color: '#FF3B30' }]}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            <Text style={{ fontSize: 18, color: COLORS.textTertiary }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 16, borderRadius: 14, marginBottom: 8,
  },
  iconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,51,102,0.08)' },
  content: { flex: 1, marginLeft: 14 },
  label: { fontSize: 15, fontWeight: '600', color: '#1A2A3A' },
});
