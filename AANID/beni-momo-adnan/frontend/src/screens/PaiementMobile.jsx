import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Linking } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCircleCheck, faLock, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { payForFormation, getPaymentStatus } from '../services/formationService';

const POLL_INTERVAL = 4000;

function openExternal(url) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

export default function PaiementMobile() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId, amount, currency, title } = route.params;

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // Transaction FedaPay en cours : { paymentUrl, transactionId }
  const [checkout, setCheckout] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const pollRef = useRef(null);

  const checkStatus = useCallback(async () => {
    try {
      const status = await getPaymentStatus(formationId);
      if (status.isPaid) {
        setCheckout(null);
        setSuccess(true);
        return true;
      }
      if (status.status === 'declined' || status.status === 'canceled' || status.status === 'expired') {
        setCheckout(null);
        setError('Le paiement a été refusé ou annulé. Veuillez réessayer.');
        return true;
      }
    } catch {
      // le sondage réessaiera
    }
    return false;
  }, [formationId]);

  useEffect(() => {
    if (!checkout) return undefined;
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [checkout, checkStatus]);

  const handlePay = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await payForFormation(formationId, cleaned);
      if (result.paymentUrl) {
        // FedaPay : ouvrir la page de paiement sécurisée
        setCheckout({ paymentUrl: result.paymentUrl, transactionId: result.transactionId });
        if (Platform.OS === 'web') {
          openExternal(result.paymentUrl);
        }
      } else {
        // Mode simulation (aucune clé FedaPay configurée côté serveur)
        setSuccess(true);
      }
    } catch (e) {
      setError(e.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNow = async () => {
    setVerifying(true);
    await checkStatus();
    setVerifying(false);
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 44 }} color="#6E8B5B" />
          </View>
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

  // Paiement FedaPay en cours — natif : WebView intégrée ; web : onglet externe + suivi
  if (checkout) {
    if (Platform.OS !== 'web') {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCheckout(null)}>
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Paiement sécurisé</Text>
          </View>
          <WebView
            source={{ uri: checkout.paymentUrl }}
            style={{ flex: 1 }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#C19A6B" />
              </View>
            )}
          />
          <View style={styles.pollBar}>
            <ActivityIndicator size="small" color="#9C7C4F" />
            <Text style={styles.pollBarText}>Vérification automatique du paiement…</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCheckout(null)}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement en cours</Text>
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
            Finalisez votre paiement sur la page sécurisée FedaPay qui vient de s'ouvrir.
            Cette page vérifie automatiquement l'état de votre transaction.
          </Text>

          <View style={styles.waitingRow}>
            <ActivityIndicator size="small" color="#9C7C4F" />
            <Text style={styles.waitingText}>En attente de confirmation…</Text>
          </View>

          <TouchableOpacity style={styles.payBtn} onPress={handleVerifyNow} disabled={verifying}>
            {verifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>J'ai payé — Vérifier</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.reopenBtn} onPress={() => openExternal(checkout.paymentUrl)}>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 12 }} color="#9C7C4F" />
            <Text style={styles.reopenBtnText}>Rouvrir la page de paiement</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} color="#fff" />
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
          Entrez votre numéro Mobile Money (MTN ou Moov) pour effectuer le paiement.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="+229 XX XX XX XX"
            placeholderTextColor="#C9BBA4"
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

        <View style={styles.secureRow}>
          <FontAwesomeIcon icon={faLock} style={{ fontSize: 10 }} color="#A89E90" />
          <Text style={styles.secureText}>Paiement sécurisé via FedaPay (Mobile Money & cartes)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F1E5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C7C4F',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  summaryLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2A24',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8DCC8',
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
    color: '#C19A6B',
  },
  instruction: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    lineHeight: 20,
    marginBottom: 16,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  waitingText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9C7C4F',
    fontWeight: '600',
  },
  pollBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    backgroundColor: '#F9F1E5',
    borderTopWidth: 1,
    borderTopColor: '#E8DCC8',
  },
  pollBarText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#9C7C4F',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: '#2E2A24',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#2E2A24',
    fontFamily: 'CenturyGothic',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  errorText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#C75D4F',
    marginBottom: 12,
  },
  payBtn: {
    backgroundColor: '#C19A6B',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
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
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
  },
  reopenBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9C7C4F',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  secureText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
    textAlign: 'center',
  },
  successCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(110,139,91,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 8,
  },
  successAmount: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: '700',
    color: '#C19A6B',
    marginBottom: 12,
  },
  successDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: '#C19A6B',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  doneBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
