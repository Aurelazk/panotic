import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../store/api/authApi';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';
import { getApiErrorMessage } from '../../api/client';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      
      // Persist token securely
      await Keychain.setGenericPassword(email, result.access_token);
      
      // Update global state
      dispatch(setCredentials({ 
        user: result.user, 
        token: result.access_token 
      }));
      
    } catch (error) {
      const message = getApiErrorMessage(error, 'La connexion a échoué. Veuillez vérifier vos identifiants.');
      Alert.alert('Erreur de connexion', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Icon name="billboard" size={36} color={COLORS.primary} />
              <View style={styles.pinOverlay}>
                <Icon name="checkbox-marked-circle" size={18} color={COLORS.secondary} />
              </View>
            </View>
          </View>
          <Text style={styles.title}>PANOTIC</Text>
          <Text style={styles.tagline}>Plateforme Numérique de Panneautique</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.subtitle}>Connectez-vous pour gérer vos espaces et signalements.</Text>

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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
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
              <Text style={styles.signUpText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 15,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pinOverlay: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    backgroundColor: 'transparent',
  },
  tagline: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    ...SHADOWS.medium,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signUpText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;

