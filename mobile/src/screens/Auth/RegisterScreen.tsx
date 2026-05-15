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
import { useSignupMutation } from '../../store/api/authApi';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';
import { getApiErrorMessage } from '../../api/client';

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Icon name="account-plus-outline" size={36} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.title}>PANOTIC</Text>
          <Text style={styles.tagline}>Rejoignez la révolution urbaine</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeText}>Créer un compte</Text>
          <Text style={styles.subtitle}>Devenez un acteur du changement dans votre ville.</Text>

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
              <Text style={styles.loginText}>Se connecter</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RegisterScreen;

