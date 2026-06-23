import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS } from '../../../rayann/frontend/src/constants/colors';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#001B3D" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>AANID</Text>
          <Text style={styles.tagline}>Créez votre compte</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inscription</Text>
          <Text style={styles.cardSubtitle}>Rejoignez la communauté</Text>

          <CustomInput icon="👤" placeholder="Nom complet" value={name} onChangeText={setName} />
          <CustomInput icon="✉️" placeholder="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput icon="📞" placeholder="Téléphone" value={phone} onChangeText={setPhone} />
          <CustomInput icon="🔒" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          <CustomButton title="S'inscrire" onPress={handleRegister} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Se connecter</Text>
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 13 },
  footerLink: { color: '#FF6600', fontSize: 13, fontWeight: '700' },
});
