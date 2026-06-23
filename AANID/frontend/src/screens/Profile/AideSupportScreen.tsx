import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { COLORS } from '../../../rayann/frontend/src/constants/colors';

const FAQ = [
  { q: 'Comment signaler un problème ?', a: 'Utilisez l\'onglet "Signaler" dans le menu principal.' },
  { q: 'Comment sont attribués les points ?', a: 'Chaque signalement validé vous rapporte des points.' },
  { q: 'Puis-je modifier mon profil ?', a: 'Oui, allez dans Profil > Modifier mon profil.' },
  { q: 'Comment contacter le support ?', a: 'Envoyez un email à support@aanid.com.' },
];

export default function AideSupportScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide & Support</Text>
          <Text style={styles.desc}>Consultez la FAQ ou contactez notre équipe.</Text>
        </View>

        <Text style={styles.subTitle}>Questions fréquentes</Text>
        {FAQ.map((item, i) => (
          <View key={i} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Text style={{ fontSize: 16, color: '#FF6600' }}>❓</Text>
              <Text style={styles.faqQuestion}>{item.q}</Text>
            </View>
            <Text style={styles.faqAnswer}>{item.a}</Text>
          </View>
        ))}

        <Text style={[styles.subTitle, { marginTop: 24 }]}>Contact</Text>
        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@aanid.com')}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(0,122,255,0.08)' }]}>
            <Text style={{ fontSize: 18 }}>✉️</Text>
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>support@aanid.com</Text>
          </View>
          <Text style={{ fontSize: 18, color: COLORS.textTertiary }}>›</Text>
        </TouchableOpacity>
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
  subTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  faqCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 14, marginBottom: 10 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  faqAnswer: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginLeft: 24 },
  contactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 14, marginBottom: 8 },
  iconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  contactContent: { flex: 1, marginLeft: 14 },
  contactLabel: { fontSize: 15, fontWeight: '600', color: '#1A2A3A' },
  contactValue: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
});
