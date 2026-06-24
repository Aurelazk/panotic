import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFormationById, updateProgress } from '../services/formationService';

export default function CoursePlayer() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId, moduleIndex: initialModule } = route.params;

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialModule || 0);
  const [modulesCompleted, setModulesCompleted] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFormationById(formationId);
        setFormation(data);
        setModulesCompleted(data.userProgress?.modulesCompleted || []);
      } catch {
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId, navigation]);

  const currentModule = formation?.modules?.[currentIndex];

  const handleToggleComplete = useCallback(async () => {
    if (!formation || !currentModule) return;
    setSaving(true);
    try {
      const isCurrentlyComplete = modulesCompleted.includes(currentModule.id);
      const result = await updateProgress(formationId, currentModule.id, !isCurrentlyComplete);
      setModulesCompleted(result.modulesCompleted);
    } catch {
      alert("Erreur lors de la mise à jour de la progression");
    } finally {
      setSaving(false);
    }
  }, [formation, currentModule, formationId, modulesCompleted]);

  const handleNext = () => {
    if (currentIndex < (formation?.modules?.length || 1) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3BB273" />
      </View>
    );
  }

  if (!formation || !currentModule) return null;

  const totalModules = formation.modules.length;
  const completedCount = modulesCompleted.length;
  const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const isCurrentComplete = modulesCompleted.includes(currentModule.id);
  const allComplete = completedCount === totalModules;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{formation.title}</Text>
          <Text style={styles.headerSubtitle}>
            Module {currentIndex + 1}/{totalModules}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {currentModule.imageUrl && (
          <Image source={{ uri: currentModule.imageUrl }} style={styles.moduleImage} />
        )}
        <Text style={styles.moduleTitle}>{currentModule.title}</Text>
        <Text style={styles.moduleDuration}>{currentModule.duration}</Text>
        <View style={styles.divider} />
        <Text style={styles.moduleContent}>{currentModule.content}</Text>
      </ScrollView>

      <View style={styles.footer}>
        {allComplete && (
          <View style={styles.allCompleteBanner}>
            <Text style={styles.allCompleteText}>
              ✓ Félicitations ! Vous avez terminé tous les modules.
            </Text>
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
              ← Précédent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeBtn, isCurrentComplete && styles.completeBtnDone]}
            onPress={handleToggleComplete}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.completeBtnText}>
                {isCurrentComplete ? '✓ Terminé' : 'Marquer terminé'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, currentIndex >= totalModules - 1 && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={currentIndex >= totalModules - 1}
          >
            <Text style={[styles.navBtnText, currentIndex >= totalModules - 1 && styles.navBtnTextDisabled]}>
              Suivant →
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.quitBtn}
          onPress={() => navigation.navigate('FormationDetail', { formationId })}
        >
          <Text style={styles.quitBtnText}>Retour à la formation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3BB273',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#3BB273',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 24,
  },
  moduleImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  moduleTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
  },
  moduleDuration: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  moduleContent: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
    paddingBottom: 32,
  },
  allCompleteBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  allCompleteText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#3BB273',
    fontWeight: '600',
  },
  navBtnTextDisabled: {
    color: '#BDBDBD',
  },
  completeBtn: {
    backgroundColor: '#3BB273',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completeBtnDone: {
    backgroundColor: '#2E7D32',
  },
  completeBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  quitBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  quitBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9E9E9E',
    textDecorationLine: 'underline',
  },
});
