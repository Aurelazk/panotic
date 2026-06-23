import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { payForFormation, getPaymentStatus } from '../services/formationService';

export default function PaiementMobile() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId, amount, currency, title } = route.params;

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await payForFormation(formationId, cleaned);
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Paiement réussi !</Text>
          <Text style={styles.successAmount}>
            {amount.toLocaleString()} {currency}
          </Text>
          <Text style={styles.successDesc}>
            Vous pouvez maintenant vous inscrire à la formation.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('FormationDetail', { formationId })}
          >
            <Text style={styles.doneBtnText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement Mobile Money</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Formation</Text>
          <Text style={styles.summaryTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant</Text>
            <Text style={styles.summaryPrice}>{amount.toLocaleString()} {currency}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          Entrez votre numéro Mobile Money pour effectuer le paiement.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="+229 XX XX XX XX"
            placeholderTextColor="#BDBDBD"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>
              Payer {amount.toLocaleString()} {currency}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureText}>
          Paiement sécurisé via Mobile Money
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3BB273',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  body: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryPrice: {
    fontFamily: 'CenturyGothic',
    fontSize: 20,
    fontWeight: '700',
    color: '#3BB273',
  },
  instruction: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  errorText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#E94E3C',
    marginBottom: 12,
  },
  payBtn: {
    backgroundColor: '#3BB273',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secureText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 12,
  },
  successCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    textAlign: 'center',
    lineHeight: 72,
    fontSize: 32,
    color: '#2E7D32',
    fontWeight: '700',
    marginBottom: 20,
    overflow: 'hidden',
  },
  successTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  successAmount: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: '700',
    color: '#3BB273',
    marginBottom: 12,
  },
  successDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: '#3BB273',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  doneBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
