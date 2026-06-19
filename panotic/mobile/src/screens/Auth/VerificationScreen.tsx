import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { api } from '../../api/client';

const { width, height } = Dimensions.get('window');

const VerificationScreen = ({ navigation, route }: any) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<any[]>([]);

  const phone = route?.params?.phone || '';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ]),
    );
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      Animated.stagger(300, [
        Animated.parallel([
          Animated.timing(cardFade, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(cardSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const orbTranslate = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 4) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleConfirm = async () => {
    const otpCode = code.join('');
    if (otpCode.length < 4) {
      Alert.alert('Erreur', 'Veuillez entrer le code de vérification complet.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { code: otpCode, phone });
      Alert.alert('Succès', 'Code vérifié avec succès !');
      navigation.navigate('Login');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Code invalide.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { phone });
      Alert.alert('Succès', 'Un nouveau code vous a été envoyé.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de renvoyer le code.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.gradientStart} />
      <LinearGradient colors={['#001B3D', '#003366', '#0A2540']} style={styles.gradientBg}>
        <View style={styles.gradientOverlay} />
        <Animated.View
          style={[
            styles.orb,
            {
              top: height * 0.05,
              right: -40,
              width: width * 0.45,
              height: width * 0.45,
              backgroundColor: 'rgba(0, 51, 102, 0.25)',
              transform: [{ translateY: orbTranslate }],
            },
          ]}
        />
        <View
          style={[
            styles.orb,
            {
              bottom: height * 0.15,
              left: -50,
              width: width * 0.35,
              height: width * 0.35,
              backgroundColor: 'rgba(255, 102, 0, 0.1)',
            },
          ]}
        />
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.headerBar,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-left" size={26} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View
            style={[
              styles.illustrationWrap,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.illustrationGlow} />
            <View style={styles.illustrationCircle}>
              <Icon name="cellphone-check" size={44} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            ]}
          >
            <Text style={styles.title}>Code de vérification</Text>
            <Text style={styles.subtitle}>
              Saisissez le code envoyé à votre numéro.
            </Text>

            <View style={styles.otpRow}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref: any) => (inputs.current[index] = ref)}
                  style={[styles.otpInput, digit ? styles.otpFilled : null]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectionColor={COLORS.secondary}
                />
              ))}
            </View>

            <CustomButton title="Confirmer" onPress={handleConfirm} loading={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Code non reçu ? </Text>
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Renvoyer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.gradientStart,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  illustrationGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
  },
  illustrationCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 77, 153, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#001B3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  otpFilled: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(255, 102, 0, 0.06)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  resendText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default VerificationScreen;
