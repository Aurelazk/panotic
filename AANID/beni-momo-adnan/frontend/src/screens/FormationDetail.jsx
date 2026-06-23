import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFormationById, enroll, getPaymentStatus } from '../services/formationService';

function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
}

export default function FormationDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId } = route.params;

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFormationById(formationId);
        setFormation(data);
      } catch {
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId, navigation]);

  const handleEnroll = async () => {
    if (!formation.isFree) {
      try {
        const status = await getPaymentStatus(formationId);
        if (!status.isPaid) {
          navigation.navigate('PaiementMobile', {
            formationId,
            amount: formation.price,
            currency: formation.currency,
            title: formation.title,
          });
          return;
        }
      } catch {
        navigation.navigate('PaiementMobile', {
          formationId,
          amount: formation.price,
          currency: formation.currency,
          title: formation.title,
        });
        return;
      }
    }

    setEnrolling(true);
    try {
      await enroll(formationId);
      const updated = await getFormationById(formationId);
      setFormation(updated);
    } catch (e) {
      if (e.status === 401) {
        alert('Veuillez vous connecter pour vous inscrire');
      } else {
        alert(e.message || 'Inscription échouée. Veuillez réessayer.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const getCategoryColor = () => {
    const colors = {
      PANNEAUTIQUE: '#3BB273',
      ENVIRONNEMENT: '#2ECC71',
      SANTE: '#27AE60',
      INFRASTRUCTURE: '#1E8449',
    };
    return colors[formation?.category] || '#3BB273';
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3BB273" />
      </View>
    );
  }

  if (!formation) return null;

  const isEnrolled = formation.isEnrolled;
  const allModulesComplete = formation.userProgress?.modulesCompleted?.length === formation.modules?.length;
  const progress = formation.userProgress
    ? Math.round((formation.userProgress.modulesCompleted.length / formation.modules.length) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={[styles.hero, { backgroundColor: getCategoryColor() }]}>
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{formation.title}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{formation.category}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formation.duration}</Text>
            <Text style={styles.metaLabel}>Durée</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formation.enrolledCount}/{formation.capacity}</Text>
            <Text style={styles.metaLabel}>Inscrits</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formatPrice(formation.price, formation.isFree)}</Text>
            <Text style={styles.metaLabel}>Prix</Text>
          </View>
        </View>

        {isEnrolled && (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Progression</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% complété</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{formation.description}</Text>

        <Text style={styles.sectionTitle}>Modules ({formation.modules?.length || 0})</Text>
        {formation.modules?.map((mod, idx) => {
          const isModuleComplete = formation.userProgress?.modulesCompleted?.includes(mod.id);
          return (
            <TouchableOpacity
              key={mod.id}
              style={[styles.moduleRow, isModuleComplete && styles.moduleRowComplete]}
              disabled={!isEnrolled}
              onPress={() => {
                if (isEnrolled) {
                  navigation.navigate('CoursePlayer', {
                    formationId: formation.id,
                    moduleIndex: idx,
                  });
                }
              }}
            >
              <View style={[styles.moduleNumber, isModuleComplete && styles.moduleNumberComplete]}>
                <Text style={styles.moduleNumberText}>
                  {isModuleComplete ? '✓' : idx + 1}
                </Text>
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDuration}>{mod.duration}</Text>
              </View>
              {isEnrolled && <Text style={styles.moduleArrow}>›</Text>}
            </TouchableOpacity>
          );
        })}

        {!isEnrolled ? (
          <TouchableOpacity
            style={[styles.enrollBtn, { backgroundColor: getCategoryColor() }]}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enrollBtnText}>
                {formation.isFree ? "S'inscrire gratuitement" : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.enrolledBanner}>
            <Text style={styles.enrolledBannerText}>
              {allModulesComplete ? '✓ Formation terminée !' : '✓ Vous êtes inscrit'}
            </Text>
            {allModulesComplete && formation.userProgress?.completedAt && (
              <Text style={styles.completedDate}>
                Complétée le {new Date(formation.userProgress.completedAt).toLocaleDateString()}
              </Text>
            )}
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() =>
                navigation.navigate('CoursePlayer', {
                  formationId: formation.id,
                  moduleIndex: 0,
                })
              }
            >
              <Text style={styles.startBtnText}>
                {allModulesComplete ? 'Revoir' : 'Commencer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 12,
  },
  heroBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  body: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  metaLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 3,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  progressLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#3BB273',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 6,
    textAlign: 'right',
  },
  sectionTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10,
    marginTop: 8,
  },
  description: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 21,
    marginBottom: 16,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  moduleRowComplete: {
    opacity: 0.75,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3BB273',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleNumberComplete: {
    backgroundColor: '#2E7D32',
  },
  moduleNumberText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  moduleDuration: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  moduleArrow: {
    fontSize: 20,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  enrollBtn: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrollBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  enrolledBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  enrolledBannerText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 4,
  },
  completedDate: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 10,
  },
  startBtn: {
    backgroundColor: '#3BB273',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  startBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
