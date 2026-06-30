import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSeedling, faBriefcase, faBuilding, faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const PLANS = [
  {
    tier: 'Amateur', price: '0', icon: faSeedling, color: COLORS.success,
    features: ['Signalements illimités', 'Accès à la carte interactive', 'Flux communautaire (UGC)'],
  },
  {
    tier: 'Professionnel', price: '5 000', icon: faBriefcase, color: COLORS.warning, popular: true,
    features: ['Audit complet (PDF/CSV)', 'Certifications de formation', 'Statistiques de signalements'],
  },
  {
    tier: 'Régie', price: '25 000', icon: faBuilding, color: COLORS.primary,
    features: ['Gestion complète de l\'inventaire', 'Analyses de campagnes publicitaires', 'Accès API administrateur'],
  },
];

export default function PricingScreen() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = (tier: string, price: string) => {
    Alert.alert('Confirmation', `Souscrire au forfait ${tier} pour ${price} FCFA ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Payer', onPress: () => { setLoading(tier); setTimeout(() => { setLoading(null); Alert.alert('Succès', 'Abonnement actif !'); }, 2000); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Nos Forfaits</Text>
      <Text style={styles.subtitle}>Choisissez le plan adapté à vos besoins.</Text>

      {PLANS.map((plan) => {
        const isCurrent = plan.tier === 'Amateur';
        return (
          <View key={plan.tier} style={[styles.card, plan.popular && styles.cardPopular]}>
            {plan.popular && (
              <View style={styles.ribbon}>
                <FontAwesomeIcon icon={faStar} size={10} color={COLORS.white} />
                <Text style={styles.ribbonText}>POPULAIRE</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={[styles.tierIcon, { backgroundColor: plan.color + '1F' }]}>
                <FontAwesomeIcon icon={plan.icon} size={18} color={plan.color} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.tierName}>{plan.tier}</Text>
                {isCurrent && <Text style={styles.currentLabel}>Plan actuel</Text>}
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
              <Text style={styles.priceCurrency}> FCFA</Text>
              <Text style={styles.priceSub}> /mois</Text>
            </View>

            <View style={styles.divider} />

            {plan.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.checkCircle, { backgroundColor: plan.color + '1F' }]}>
                  <FontAwesomeIcon icon={faCheck} size={10} color={plan.color} />
                </View>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}

            {isCurrent ? (
              <View style={styles.currentBtn}>
                <Text style={styles.currentBtnText}>Forfait actuel</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.btn, { backgroundColor: plan.color }]} activeOpacity={0.85} onPress={() => handleUpgrade(plan.tier, plan.price)} disabled={loading === plan.tier}>
                {loading === plan.tier ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Choisir ce plan</Text>}
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 6, fontFamily: FONT_FAMILY },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 26, fontFamily: FONT_FAMILY },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 22, padding: 22, marginBottom: 18,
    borderWidth: 1, borderColor: '#F0E6D6',
    shadowColor: COLORS.shadow, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  cardPopular: { borderColor: COLORS.warning, borderWidth: 2 },
  ribbon: {
    position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.warning, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  ribbonText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, fontFamily: FONT_FAMILY },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tierIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerText: { marginLeft: 12 },
  tierName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, fontFamily: FONT_FAMILY },
  currentLabel: { fontSize: 11, color: COLORS.success, fontWeight: '600', marginTop: 2, fontFamily: FONT_FAMILY },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 32, fontWeight: '800', fontFamily: FONT_FAMILY },
  priceCurrency: { fontSize: 15, fontWeight: '700', color: COLORS.text, fontFamily: FONT_FAMILY },
  priceSub: { fontSize: 13, color: COLORS.textTertiary, fontFamily: FONT_FAMILY },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkCircle: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  featureText: { fontSize: 14, color: COLORS.textSecondary, flex: 1, fontFamily: FONT_FAMILY },
  btn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15, fontFamily: FONT_FAMILY },
  currentBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  currentBtnText: { color: COLORS.textTertiary, fontWeight: '700', fontSize: 15, fontFamily: FONT_FAMILY },
});
