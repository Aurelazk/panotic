import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faLock, faBellSlash, faLocationDot, faTrash, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const SETTINGS = [
  { icon: faEye, label: 'Données personnelles', desc: 'Gérer mes informations' },
  { icon: faLock, label: 'Mot de passe & sécurité', desc: 'Changer mon mot de passe' },
  { icon: faBellSlash, label: 'Notifications', desc: 'Gérer mes alertes' },
  { icon: faLocationDot, label: 'Géolocalisation', desc: 'Partager ma position' },
  { icon: faTrash, label: 'Supprimer mon compte', desc: 'Suppression définitive', danger: true },
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
            <View style={[styles.iconBg, item.danger && { backgroundColor: COLORS.error + '18' }]}>
              <FontAwesomeIcon icon={item.icon} size={16} color={item.danger ? COLORS.error : COLORS.primary} />
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, item.danger && { color: COLORS.error }]}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={14} color={COLORS.textTertiary} />
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
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6, fontFamily: FONT_FAMILY },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, fontFamily: FONT_FAMILY },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 14, marginBottom: 8,
    shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  iconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.chipBg },
  content: { flex: 1, marginLeft: 14 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONT_FAMILY },
});
