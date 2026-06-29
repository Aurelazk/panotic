import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/theme';
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
      <StatusBar barStyle="light-content" backgroundColor="#001B3D" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>AANID</Text>
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
  root: { flex: 1, backgroundColor: '#001B3D' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  tagline: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginTop: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 32, elevation: 12, shadowColor: '#001B3D', shadowOpacity: 0.25, shadowRadius: 40 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 6 },
  forgotText: { color: '#FF6600', fontSize: 12, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 13 },
  footerLink: { color: '#FF6600', fontSize: 13, fontWeight: '700' },
});
