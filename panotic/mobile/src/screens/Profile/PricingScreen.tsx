import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { api } from '../../api/client';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PricingScreen = () => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const navigation = useNavigation<any>();

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/payments/subscription');
      setCurrentPlan(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch subscription error:', error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscription();
    }, [])
  );

  const handleUpgrade = async (plan: string, price: string) => {
    Alert.alert(
      'Confirmation de Paiement',
      `Souhaitez-vous souscrire au forfait ${plan.toUpperCase()} pour ${price} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Payer via Mobile Money',
          onPress: async () => {
            setUpgrading(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));
              await api.post('/payments/upgrade', { plan });
              Alert.alert('Succès', `Votre abonnement ${plan.toUpperCase()} est désormais actif !`);
              setUpgrading(false);
              fetchSubscription();
            } catch (error) {
              Alert.alert('Erreur', 'Le paiement a échoué.');
              setUpgrading(false);
            }
          }
        }
      ]
    );
  };

  const PLAN_ICONS: Record<string, string> = {
    Amateur: 'person-outline',
    Professionnel: 'briefcase-outline',
    Regie: 'shield-checkmark-outline',
  };

  const PlanCard = ({ tier, price, features, color, isCurrent }: any) => (
    <View style={[styles.planCard, isCurrent && { borderColor: color, borderWidth: 2 }]}>
      {isCurrent && (
        <View style={[styles.currentBadge, { backgroundColor: color }]}>
          <Text style={styles.currentBadgeText}>PLAN ACTUEL</Text>
        </View>
      )}
      <View style={styles.planIcon}>
        <Icon name={PLAN_ICONS[tier] || 'card-outline'} size={32} color={color} />
      </View>
      <Text style={styles.tierName}>{tier}</Text>
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color }]}>{price}</Text>
        <Text style={styles.priceSub}>/ mois</Text>
      </View>
      <View style={styles.features}>
        {features.map((f: string, i: number) => (
          <View key={i} style={styles.featureRow}>
            <Icon name="checkmark-circle" size={18} color={color} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      {!isCurrent && (
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: color }]}
          onPress={() => handleUpgrade(tier.toLowerCase(), price)}
          disabled={upgrading}
        >
          {upgrading ? <ActivityIndicator color="#fff" /> : <Text style={styles.upgradeBtnText}>Choisir ce plan</Text>}
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forfaits & Abonnement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subTitle}>Choisissez le plan adapté à vos besoins professionnels sur Panotic.</Text>

        <PlanCard
          tier="Amateur"
          price="0 FCFA"
          color="#666"
          isCurrent={!currentPlan || currentPlan.plan === 'amateur'}
          features={['Signalements illimités', 'Accès à la carte interactive', 'Flux communautaire (UGC)']}
        />

        <PlanCard
          tier="Professionnel"
          price="5 000 FCFA"
          color="#FF6600"
          isCurrent={currentPlan?.plan === 'professionnel'}
          features={['Audit complet (PDF/CSV)', 'Certifications de formation', 'Statistiques de signalements']}
        />

        <PlanCard
          tier="Regie"
          price="25 000 FCFA"
          color="#003366"
          isCurrent={currentPlan?.plan === 'regie'}
          features={['Gestion complète de l\'inventaire', 'Analyses de campagnes publicitaires', 'Accès API administrateur']}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
  },
  priceSub: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  features: {
    marginBottom: 25,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  upgradeBtn: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PricingScreen;
