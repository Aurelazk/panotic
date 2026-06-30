import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from '../../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';

const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    let villeId, villeNom;
    try {
      villeId = await AsyncStorage.getItem(VILLE_ID_KEY);
      villeNom = await AsyncStorage.getItem(VILLE_NOM_KEY);
    } catch {}
    dispatch(setCredentials({
      user: {
        id: '1',
        email,
        firstName: 'Citoyen',
        role: 'CITOYEN',
        villeId: villeId || undefined,
        villeNom: villeNom || undefined,
      },
      token: 'mock-token',
    }));
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>aanid</Text>
          <Text style={styles.tagline}>Transformation Urbaine</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardSubtitle}>Connectez-vous pour continuer</Text>

          <CustomInput icon="✉️" placeholder="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput icon="🔒" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <CustomButton title="Se connecter" onPress={handleLogin} />

          <SocialButtons />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 44, fontWeight: '800', fontStyle: 'italic', color: COLORS.primaryDark, fontFamily: FONT_FAMILY },
  tagline: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginTop: 4, fontFamily: FONT_FAMILY },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 32, elevation: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 40 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4, fontFamily: FONT_FAMILY },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, fontFamily: FONT_FAMILY },
  forgotRow: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 6 },
  forgotText: { color: COLORS.primary, fontSize: 12, fontWeight: '600', fontFamily: FONT_FAMILY },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: FONT_FAMILY },
  footerLink: { color: COLORS.primary, fontSize: 13, fontWeight: '700', fontFamily: FONT_FAMILY },
});
