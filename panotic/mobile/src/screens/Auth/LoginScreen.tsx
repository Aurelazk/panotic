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
import { useLoginMutation } from '../../store/api/authApi';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';
import { getApiErrorMessage } from '../../api/client';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const logoSrc = { uri: new URL('../../assets/images/logo_clean.png', import.meta.url).href };

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(orb1Anim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1Anim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(orb2Anim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Anim, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.stagger(300, [
        Animated.parallel([
          Animated.timing(cardFade, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlide, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const orb1Translate = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const orb2Translate = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    try {
      const result = await login({ email, password }).unwrap();
      await Keychain.setGenericPassword(email, result.access_token);
      dispatch(setCredentials({
        user: result.user,
        token: result.access_token
      }));
    } catch (error) {
      const message = getApiErrorMessage(error, 'La connexion a échoué.');
      Alert.alert('Erreur de connexion', message);
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
              top: height * 0.08,
              right: -50,
              width: width * 0.5,
              height: width * 0.5,
              backgroundColor: 'rgba(0, 51, 102, 0.3)',
              transform: [{ translateY: orb1Translate }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            {
              bottom: height * 0.15,
              left: -60,
              width: width * 0.55,
              height: width * 0.55,
              backgroundColor: 'rgba(255, 102, 0, 0.12)',
              transform: [{ translateY: orb2Translate }],
            },
          ]}
        />
        <View
          style={[
            styles.orb,
            {
              top: height * 0.5,
              right: -30,
              width: width * 0.3,
              height: width * 0.3,
              backgroundColor: 'rgba(0, 77, 153, 0.15)',
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
          <View style={styles.spacer} />

          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Image source={logoSrc} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Transformation Urbaine</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardFade,
                transform: [{ translateY: cardSlide }],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Bienvenue</Text>
            <Text style={styles.cardSubtitle}>
              Connectez-vous pour gérer vos espaces et signalements.
            </Text>

            <CustomInput
              icon="email-outline"
              placeholder="Adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              icon="lock-outline"
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showPasswordToggle
              isPasswordVisible={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Se connecter"
              onPress={handleLogin}
              loading={isLoading}
            />

            <SocialButtons />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.bottomSpacer} />
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
  spacer: {
    height: 16,
  },
  bottomSpacer: {
    height: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 97,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.35)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#001B3D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 6,
  },
  forgotText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
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

export default LoginScreen;
