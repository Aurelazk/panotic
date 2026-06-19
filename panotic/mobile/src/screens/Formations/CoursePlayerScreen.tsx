import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { api } from '../../api/client';

const { width } = Dimensions.get('window');

const QUIZ_QUESTIONS = [
  {
    question: 'Qu\'est-ce que la panneautique dans le domaine public ?',
    options: ['La gestion des panneaux publicitaires urbains', 'La fabrication de panneaux en bois', 'Un type de mosaïque'],
    correct: 0,
  },
  {
    question: 'Que désigne le "Plan Piquet" dans un relevé d\'affichage ?',
    options: ['Un plan de clôture', 'Un relevé géolocalisé des supports publicitaires', 'Un plan de piquetage routier'],
    correct: 1,
  },
  {
    question: 'Quel est l\'objectif du zonage spécifique défini par le cahier des charges ?',
    options: ['Classer les zones par couleur', 'Assurer un développement harmonieux de l\'affichage urbain', 'Délimiter les zones de construction'],
    correct: 2,
  },
  {
    question: 'Quel document encadre les droits d\'exploitation dans le secteur de la panneautique ?',
    options: ['Le cahier des charges', 'Le Code de la route', 'La Constitution nationale'],
    correct: 0,
  },
];

const CoursePlayerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { formation } = route.params;

  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(QUIZ_QUESTIONS.length).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const phases = formation.content || [];
  const currentPhaseData = phases[currentPhase];
  const steps = currentPhaseData?.steps || [];
  const currentStepData = steps[currentStep];

  const totalSteps = phases.reduce((acc: number, p: any) => acc + (p.steps?.length || 0), 0);
  const doneSteps = phases.slice(0, currentPhase).reduce((acc: number, p: any) => acc + (p.steps?.length || 0), 0) + currentStep + 1;
  const progressPercent = Math.min(100, Math.round((doneSteps / totalSteps) * 100));

  const isLastStep = currentPhase === phases.length - 1 && currentStep === steps.length - 1;

  useFocusEffect(
    useCallback(() => {
      Animated.timing(progressAnim, {
        toValue: progressPercent,
        duration: 400,
        useNativeDriver: false,
      }).start();
      // Sync progress to backend
      api.patch(`/formations/${formation.id}/progress`, {
        phaseIndex: currentPhase,
        stepIndex: currentStep,
      }).catch(console.error);
    }, [currentPhase, currentStep])
  );

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else if (currentPhase < phases.length - 1) {
      setCurrentPhase(p => p + 1);
      setCurrentStep(0);
    } else {
      setShowQuiz(true);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else if (currentPhase > 0) {
      const prevPhase = currentPhase - 1;
      setCurrentPhase(prevPhase);
      setCurrentStep((phases[prevPhase]?.steps?.length || 1) - 1);
    }
  };

  const handleAnswer = (qIdx: number, aIdx: number) => {
    const updated = [...quizAnswers];
    updated[qIdx] = aIdx;
    setQuizAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    if (quizAnswers.includes(-1)) {
      Alert.alert('Attention', 'Veuillez répondre à toutes les questions.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/formations/${formation.id}/quiz`, { answers: quizAnswers });
      setQuizResult(res.data);
      setQuizSubmitted(true);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de soumettre le quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (showQuiz) {
    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => setShowQuiz(false)}>
            <Icon name="arrow-back" size={24} color="#003366" />
          </TouchableOpacity>
          <Text style={styles.quizHeaderTitle}>Évaluation finale</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
          {quizSubmitted && quizResult ? (
            <View style={styles.resultCard}>
              <Icon
                name={quizResult.passed ? 'checkmark-circle' : 'close-circle'}
                size={80}
                color={quizResult.passed ? '#4CAF50' : '#F44336'}
              />
              <Text style={[styles.resultTitle, { color: quizResult.passed ? '#4CAF50' : '#F44336' }]}>
                {quizResult.passed ? 'Félicitations !' : 'Continuez vos efforts !'}
              </Text>
              <Text style={styles.resultScore}>Score : {quizResult.score}%</Text>
              <Text style={styles.resultDesc}>
                {quizResult.passed
                  ? 'Vous avez réussi le quiz. Votre certificat est disponible !'
                  : 'Un score de 75% est requis. Révisez les modules et réessayez.'}
              </Text>
              {quizResult.passed && (
                <TouchableOpacity style={styles.certBtn} onPress={() => Alert.alert('Certificat', quizResult.certificateUrl)}>
                  <Icon name="ribbon-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.certBtnText}>Télécharger le Certificat</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>Retour aux formations</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.quizTitle}>Quiz de validation</Text>
              <Text style={styles.quizSubtitle}>{QUIZ_QUESTIONS.length} questions · 75% requis pour valider</Text>

              {QUIZ_QUESTIONS.map((q, qIdx) => (
                <View key={qIdx} style={styles.questionCard}>
                  <Text style={styles.questionText}>{qIdx + 1}. {q.question}</Text>
                  {q.options.map((opt, aIdx) => (
                    <TouchableOpacity
                      key={aIdx}
                      style={[styles.optionBtn, quizAnswers[qIdx] === aIdx && styles.optionSelected]}
                      onPress={() => handleAnswer(qIdx, aIdx)}
                    >
                      <View style={[styles.optionRadio, quizAnswers[qIdx] === aIdx && styles.optionRadioSelected]} />
                      <Text style={[styles.optionText, quizAnswers[qIdx] === aIdx && styles.optionTextSelected]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Soumettre le quiz</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{formation.title}</Text>
        <Text style={styles.headerProgress}>{progressPercent}%</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Phase / step indicator */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>
          Partie {currentPhase + 1}/{phases.length} · Étape {currentStep + 1}/{steps.length}
        </Text>
        <Text style={styles.phaseLabel}>{currentPhaseData?.title}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={styles.stepTitle}>{currentStepData?.title}</Text>
        {currentStepData?.points?.map((point: string, idx: number) => (
          <View key={idx} style={styles.pointRow}>
            <View style={styles.bullet} />
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, styles.prevBtn, (currentPhase === 0 && currentStep === 0) && styles.navBtnDisabled]}
          onPress={goPrev}
          disabled={currentPhase === 0 && currentStep === 0}
        >
          <Icon name="arrow-back" size={20} color="#003366" />
          <Text style={styles.prevBtnText}>Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={goNext}>
          <Text style={styles.nextBtnText}>{isLastStep ? 'Passer le Quiz' : 'Suivant'}</Text>
          <Icon name={isLastStep ? 'trophy' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
    marginHorizontal: 15,
  },
  headerProgress: { color: '#FF6600', fontWeight: 'bold', fontSize: 14 },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FF6600',
  },
  breadcrumb: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  breadcrumbText: { color: '#999', fontSize: 11 },
  phaseLabel: { color: '#FF6600', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
  scroll: { flex: 1 },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6600',
    marginTop: 7,
    marginRight: 12,
  },
  pointText: { fontSize: 15, color: '#444', lineHeight: 24, flex: 1 },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  navBtnDisabled: { opacity: 0.3 },
  prevBtn: { backgroundColor: '#f0f0f0' },
  prevBtnText: { color: '#003366', fontWeight: 'bold' },
  nextBtn: { backgroundColor: '#FF6600' },
  nextBtnText: { color: '#fff', fontWeight: 'bold' },
  // Quiz styles
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quizHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginLeft: 15 },
  quizTitle: { fontSize: 22, fontWeight: 'bold', color: '#003366', marginBottom: 5 },
  quizSubtitle: { color: '#999', fontSize: 13, marginBottom: 25 },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  questionText: { fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 15 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  optionSelected: { borderColor: '#FF6600', backgroundColor: '#FFF3E0' },
  optionRadio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#ccc', marginRight: 10,
  },
  optionRadioSelected: { borderColor: '#FF6600', backgroundColor: '#FF6600' },
  optionText: { color: '#555', flex: 1 },
  optionTextSelected: { color: '#E65100', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#003366',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultCard: { alignItems: 'center', paddingVertical: 40 },
  resultTitle: { fontSize: 26, fontWeight: 'bold', marginTop: 15 },
  resultScore: { fontSize: 18, color: '#333', marginTop: 10, marginBottom: 10 },
  resultDesc: { textAlign: 'center', color: '#666', lineHeight: 22, marginBottom: 30, paddingHorizontal: 20 },
  certBtn: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  certBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  backBtn: { padding: 12 },
  backBtnText: { color: '#003366', textDecorationLine: 'underline', fontSize: 14 },
});

export default CoursePlayerScreen;
