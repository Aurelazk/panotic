import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';

const SETTINGS = [
  { icon: 'eye-outline', label: 'Données personnelles', desc: 'Gérer mes informations' },
  { icon: 'lock-closed-outline', label: 'Mot de passe & sécurité', desc: 'Changer mon mot de passe' },
  { icon: 'notifications-off-outline', label: 'Notifications', desc: 'Gérer mes alertes' },
  { icon: 'location-outline', label: 'Géolocalisation', desc: 'Partager ma position' },
  { icon: 'trash-outline', label: 'Supprimer mon compte', desc: 'Suppression définitive', danger: true },
];

const ConfidentialiteScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          <Text style={styles.sectionDesc}>
            Gérez vos données personnelles, votre sécurité et vos préférences de confidentialité.
          </Text>
        </View>

        {SETTINGS.map((item, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <View style={[styles.iconBg, item.danger && { backgroundColor: 'rgba(255,59,48,0.08)' }]}>
              <Icon name={item.icon} size={20} color={item.danger ? '#FF3B30' : COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, item.danger && { color: '#FF3B30' }]}>{item.label}</Text>
              <Text style={styles.settingDesc}>{item.desc}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,51,102,0.08)',
  },
  settingContent: {
    flex: 1,
    marginLeft: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2A3A',
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});

export default ConfidentialiteScreen;
