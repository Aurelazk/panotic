import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { api } from '../../api/client';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const FormationDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [formation, setFormation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState<any>(null);

  const fetchDetail = async () => {
    try {
      const [detailRes, progressRes] = await Promise.allSettled([
        api.get(`/formations/${route.params.id}`),
        api.get(`/formations/${route.params.id}/progress`),
      ]);
      if (detailRes.status === 'fulfilled') setFormation(detailRes.value.data);
      if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch detail error:', error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [route.params.id])
  );

  const handleEnroll = async () => {
    if (!formation.isFree) {
      Alert.alert(
        'Paiement requis',
        `Cette formation coûte ${formation.price} ${formation.currency}. Souhaitez-vous procéder au paiement ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Payer (Mobile Money)', 
            onPress: () => submitEnrollment('cinetpay', 'mock_trans_123') 
          },
          { 
            text: 'Payer (Carte)', 
            onPress: () => submitEnrollment('stripe', 'mock_trans_456') 
          },
        ]
      );
    } else {
      submitEnrollment();
    }
  };

  const submitEnrollment = async (provider?: string, transactionId?: string) => {
    setEnrolling(true);
    try {
      const metadata = transactionId ? { transactionId, provider } : {};
      await api.post(`/formations/${formation.id}/enroll`, metadata);
      Alert.alert('Succès', 'Votre inscription a été validée !');
      fetchDetail(); // Refresh count
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur lors de l\'inscription';
      Alert.alert('Attention', msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || !formation) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  const { width } = Dimensions.get('window');

  return (
    <ScrollView style={styles.container}>
      {formation.imageUrl ? (
        <Image source={{ uri: formation.imageUrl }} style={styles.image} />
      ) : (
        <LinearGradient colors={['#003366', '#001B3D']} style={styles.image}>
          <View style={styles.imageFallback}>
            <Icon name="school-outline" size={60} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>
      )}
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{formation.category.toUpperCase()}</Text>
          {formation.isFree ? (
            <View style={styles.freeBadge}><Text style={styles.freeText}>GRATUIT</Text></View>
          ) : (
            <View style={styles.paidBadge}><Text style={styles.paidText}>PAYANT</Text></View>
          )}
        </View>

        <Text style={styles.title}>{formation.title}</Text>
        <Text style={styles.description}>{formation.description}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon name="calendar-outline" size={20} color="#FF6600" />
            <Text style={styles.infoLabel}>Durée</Text>
            <Text style={styles.infoValue}>{formation.duration}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Icon name="people-outline" size={20} color="#FF6600" />
            <Text style={styles.infoLabel}>Places</Text>
            <Text style={styles.infoValue}>{formation.capacity - formation.enrolledCount} restantes</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Syllabus du module</Text>
        {formation.content?.map((phase: any, pIdx: number) => (
          <View key={pIdx} style={styles.phaseContainer}>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            {phase.steps?.map((step: any, sIdx: number) => (
              <View key={sIdx} style={styles.stepContainer}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.points?.map((point: string, ptIdx: number) => (
                  <View key={ptIdx} style={styles.pointRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        {!formation.isFree && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tarif de la formation</Text>
            <Text style={styles.priceValue}>{formation.price} {formation.currency}</Text>
          </View>
        )}

        {/* Progress Bar for enrolled users */}
        {formation.isEnrolled && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Votre progression</Text>
              <Text style={styles.progressPercent}>{Math.round(progress?.progressPercent || 0)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, progress?.progressPercent || 0)}%` }]} />
            </View>
            {progress?.quizPassed && (
              <View style={styles.certBadge}>
                <Icon name="ribbon" size={14} color="#4CAF50" />
                <Text style={styles.certBadgeText}>Certificat obtenu · Score: {progress.quizScore}%</Text>
              </View>
            )}
          </View>
        )}

        {formation.isEnrolled ? (
          <TouchableOpacity
            style={[styles.enrollButton, styles.continueButton]}
            onPress={() => navigation.navigate('CoursePlayer', { formation })}
          >
            <Icon name="play-circle-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.enrollButtonText}>
              {progress?.progressPercent > 0 ? 'Continuer la formation' : 'Démarrer la formation'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.enrollButton, enrolling && { opacity: 0.7 }]} 
            onPress={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enrollButtonText}>
                {formation.isFree ? "S'inscrire gratuitement" : "Procéder au paiement"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  image: {
    width: '100%',
    height: 250,
  },
  imageFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6600',
    letterSpacing: 1,
  },
  freeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  paidBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidText: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#DDD',
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
  },
  phaseContainer: {
    marginBottom: 25,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6600',
    paddingLeft: 15,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 10,
  },
  stepContainer: {
    marginBottom: 15,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingRight: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#666',
    marginTop: 8,
    marginRight: 10,
  },
  pointText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  priceContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D0E1FF',
  },
  priceLabel: {
    fontSize: 12,
    color: '#003366',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
  },
  enrollButton: {
    backgroundColor: '#FF6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButton: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#003366',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D0E1FF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13, color: '#003366', fontWeight: '600' },
  progressPercent: { fontSize: 13, color: '#FF6600', fontWeight: 'bold' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#D0E1FF',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#FF6600',
    borderRadius: 4,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  certBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default FormationDetailScreen;
