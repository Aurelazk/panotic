import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useSignupMutation } from '../../store/api/authApi';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';
import { getApiErrorMessage } from '../../api/client';

const { width, height } = Dimensions.get('window');
const logoSrc = { uri: new URL('../../assets/images/logo_clean.png', import.meta.url).href };

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 5000, useNativeDriver: true }),
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

  const orbTranslate = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      const result = await signup(formData).unwrap();
      await Keychain.setGenericPassword(formData.email, result.access_token);
      dispatch(setCredentials({
        user: result.user,
        token: result.access_token
      }));
      Alert.alert('Succès', 'Votre compte a été créé avec succès !');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Une erreur est survenue lors de l\'inscription.');
      Alert.alert('Erreur', message);
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
              top: height * 0.1,
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
              bottom: height * 0.12,
              left: -50,
              width: width * 0.4,
              height: width * 0.4,
              backgroundColor: 'rgba(255, 102, 0, 0.1)',
            },
          ]}
        />
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Icon name="chevron-left" size={26} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <Image source={logoSrc} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Rejoignez la révolution urbaine</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            ]}
          >
            <Text style={styles.sectionTitle}>Vos informations</Text>

            <CustomInput
              icon="account-outline"
              placeholder="Nom complet"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
            <CustomInput
              icon="email-outline"
              placeholder="Adresse email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <CustomInput
              icon="phone-outline"
              placeholder="+229 90 00 00 00"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
            <CustomInput
              icon="lock-outline"
              placeholder="Mot de passe"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              showPasswordToggle
              isPasswordVisible={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />

            <CustomButton
              title="S'inscrire"
              onPress={handleRegister}
              loading={isLoading}
            />

            <SocialButtons />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Se connecter</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 86,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.35)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#001B3D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
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
  footerLink: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RegisterScreen;
