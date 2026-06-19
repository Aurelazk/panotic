import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';

const FAQ = [
  { q: 'Comment signaler un problème ?', a: 'Utilisez l\'onglet "Signaler" dans le menu principal. Vous pouvez joindre une photo et une description.' },
  { q: 'Comment sont attribués les points ?', a: 'Chaque signalement validé vous rapporte des points. Plus vous contribuez, plus votre niveau augmente.' },
  { q: 'Puis-je modifier mon profil ?', a: 'Oui, allez dans Profil > Modifier mon profil pour mettre à jour vos informations.' },
  { q: 'Comment contacter le support ?', a: 'Utilisez le formulaire ci-dessous ou envoyez un email à support@aanid.com.' },
];

const AideSupportScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide & Support</Text>
          <Text style={styles.sectionDesc}>
            Consultez la FAQ ou contactez notre équipe.
          </Text>
        </View>

        <Text style={styles.subTitle}>Questions fréquentes</Text>
        {FAQ.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Icon name="help-circle" size={18} color={COLORS.secondary} />
              <Text style={styles.faqQuestion}>{item.q}</Text>
            </View>
            <Text style={styles.faqAnswer}>{item.a}</Text>
          </View>
        ))}

        <Text style={[styles.subTitle, { marginTop: 24 }]}>Contact</Text>

        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@aanid.com')}>
          <View style={[styles.contactIcon, { backgroundColor: 'rgba(0,122,255,0.08)' }]}>
            <Icon name="mail-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>support@aanid.com</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+22901010101')}>
          <View style={[styles.contactIcon, { backgroundColor: 'rgba(52,199,89,0.08)' }]}>
            <Icon name="call-outline" size={20} color="#34C759" />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Téléphone</Text>
            <Text style={styles.contactValue}>+229 01 01 01 01</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginLeft: 26,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
    marginLeft: 14,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2A3A',
  },
  contactValue: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});

export default AideSupportScreen;
