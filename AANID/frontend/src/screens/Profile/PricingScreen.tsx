import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const PLANS = [
  {
    tier: 'Amateur', price: '0 FCFA', color: COLORS.textSecondary,
    features: ['Signalements illimités', 'Accès à la carte interactive', 'Flux communautaire (UGC)'],
  },
  {
    tier: 'Professionnel', price: '5 000 FCFA', color: COLORS.warning,
    features: ['Audit complet (PDF/CSV)', 'Certifications de formation', 'Statistiques de signalements'],
  },
  {
    tier: 'Régie', price: '25 000 FCFA', color: COLORS.primary,
    features: ['Gestion complète de l\'inventaire', 'Analyses de campagnes publicitaires', 'Accès API administrateur'],
  },
];

export default function PricingScreen() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = (tier: string, price: string) => {
    Alert.alert('Confirmation', `Souscrire au forfait ${tier} pour ${price} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Payer', onPress: () => { setLoading(tier); setTimeout(() => { setLoading(null); Alert.alert('Succès', 'Abonnement actif !'); }, 2000); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Nos Forfaits</Text>
      <Text style={styles.subtitle}>Choisissez le plan adapté à vos besoins.</Text>

      {PLANS.map((plan) => {
        const isCurrent = plan.tier === 'Amateur';
        return (
          <View key={plan.tier} style={[styles.card, isCurrent && { borderColor: plan.color, borderWidth: 2 }]}>
            {isCurrent && <View style={[styles.currentBadge, { backgroundColor: plan.color }]}><Text style={styles.currentBadgeText}>ACTUEL</Text></View>}
            <Text style={styles.tierName}>{plan.tier}</Text>
            <Text style={[styles.price, { color: plan.color }]}>{plan.price}<Text style={styles.priceSub}>/mois</Text></Text>
            {plan.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <FontAwesomeIcon icon={faCheck} size={14} color={plan.color} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
            {!isCurrent && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: plan.color }]} onPress={() => handleUpgrade(plan.tier, plan.price)} disabled={loading === plan.tier}>
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
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30, fontFamily: FONT_FAMILY },
  card: { backgroundColor: COLORS.surface, borderRadius: 25, padding: 25, marginBottom: 25, elevation: 3, shadowColor: COLORS.shadow, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, position: 'relative' },
  currentBadge: { position: 'absolute', top: 0, right: 25, paddingHorizontal: 15, paddingVertical: 5, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  currentBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', fontFamily: FONT_FAMILY },
  tierName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 8, fontFamily: FONT_FAMILY },
  price: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 20, fontFamily: FONT_FAMILY },
  priceSub: { fontSize: 14, color: COLORS.textTertiary, marginLeft: 5, fontFamily: FONT_FAMILY },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 10, fontFamily: FONT_FAMILY },
  btn: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, fontFamily: FONT_FAMILY },
});
