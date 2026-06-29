import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, SafeAreaView, Modal, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const API_BASE = '/api/v1';
const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';

const FLAGS = {
  'Bénin': '🇧🇯',
  "Côte d'Ivoire": '🇨🇮',
  'Sénégal': '🇸🇳',
  'Togo': '🇹🇬',
  'Burkina Faso': '🇧🇫',
  'Ghana': '🇬🇭',
  'Nigeria': '🇳🇬',
  'Mali': '🇲🇱',
  'Niger': '🇳🇪',
};

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pays, setPays] = useState('');
  const [villeId, setVilleId] = useState('');
  const [villeNom, setVilleNom] = useState('');
  const [villes, setVilles] = useState([]);
  const [loadingVilles, setLoadingVilles] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/villes`);
        if (res.ok) {
          const data = await res.json();
          setVilles(Array.isArray(data) ? data : []);
        }
      } catch {
        // API indisponible
      } finally {
        setLoadingVilles(false);
      }
    })();
  }, []);

  const countries = useMemo(() => {
    const unique = [...new Set(villes.map(v => v.pays))];
    return unique.sort();
  }, [villes]);

  const villesByCountry = useMemo(() => {
    if (!pays) return villes;
    return villes.filter(v => v.pays === pays);
  }, [villes, pays]);

  const filteredVilles = villesByCountry.filter(v =>
    v.nom.toLowerCase().includes(citySearch.toLowerCase()) ||
    v.pays.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!pays) {
      Alert.alert('Pays requis', 'Veuillez sélectionner votre pays.');
      return;
    }
    if (!villeId) {
      Alert.alert('Ville requise', 'Veuillez sélectionner votre ville.');
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    try {
      await AsyncStorage.setItem(VILLE_ID_KEY, villeId);
      await AsyncStorage.setItem(VILLE_NOM_KEY, villeNom);
    } catch {}

    setSubmitting(false);
    setShowWelcome(true);
    await new Promise(r => setTimeout(r, 2000));

    dispatch(setCredentials({
      user: {
        id: '1',
        email,
        firstName: name.split(' ')[0],
        fullName: name,
        role: 'CITOYEN',
        pays,
        villeId,
        villeNom,
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
          <Text style={styles.tagline}>Créez votre compte</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inscription</Text>
          <Text style={styles.cardSubtitle}>Rejoignez la communauté</Text>

          <CustomInput icon="👤" placeholder="Nom complet" value={name} onChangeText={setName} />
          <CustomInput icon="✉️" placeholder="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput icon="📞" placeholder="Téléphone" value={phone} onChangeText={setPhone} />

          <TouchableOpacity
            style={[styles.selector, !pays && styles.selectorEmpty]}
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectorIcon}>🌍</Text>
            <Text style={[styles.selectorText, !pays && styles.selectorTextEmpty]}>
              {pays ? `${FLAGS[pays] || ''} ${pays}` : 'Sélectionnez votre pays'}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selector, !villeId && styles.selectorEmpty, !pays && styles.selectorDisabled]}
            onPress={() => pays ? setShowCityPicker(true) : null}
            activeOpacity={pays ? 0.7 : 1}
          >
            <Text style={styles.selectorIcon}>📍</Text>
            <Text style={[styles.selectorText, !villeId && styles.selectorTextEmpty]}>
              {villeNom || (pays ? 'Sélectionnez votre ville' : 'Choisissez d\'abord un pays')}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>

          <CustomInput icon="🔒" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          <CustomButton title="S'inscrire" onPress={handleRegister} loading={submitting} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modale pays */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un pays</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={item => item}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                loadingVilles ? (
                  <ActivityIndicator size="large" color="#1E73BE" style={{ marginTop: 40 }} />
                ) : (
                  <Text style={styles.modalEmpty}>Aucun pays trouvé</Text>
                )
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, pays === item && styles.pickerItemActive]}
                  onPress={() => {
                    setPays(item);
                    setVilleId('');
                    setVilleNom('');
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemFlag}>{FLAGS[item] || '🌍'}</Text>
                  <Text style={styles.pickerItemText}>{item}</Text>
                  {pays === item && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modale ville */}
      <Modal visible={showCityPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une ville</Text>
              <TouchableOpacity onPress={() => { setShowCityPicker(false); setCitySearch(''); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher une ville..."
                placeholderTextColor="#9CA3AF"
                value={citySearch}
                onChangeText={setCitySearch}
              />
            </View>

            <FlatList
              data={filteredVilles}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>
                  {loadingVilles ? 'Chargement...' : 'Aucune ville trouvée'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, villeId === item.id && styles.pickerItemActive]}
                  onPress={() => {
                    setVilleId(item.id);
                    setVilleNom(item.nom);
                    setShowCityPicker(false);
                    setCitySearch('');
                  }}
                >
                  <View style={[styles.cityDot, { backgroundColor: item.couleur || '#1E73BE' }]} />
                  <View style={styles.pickerItemInfo}>
                    <Text style={styles.pickerItemTitle}>{item.nom}</Text>
                    <Text style={styles.pickerItemSub}>{item.region}</Text>
                  </View>
                  {villeId === item.id && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Écran de bienvenue */}
      <Modal visible={showWelcome} animationType="fade" transparent>
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeIcon}>🎉</Text>
            <Text style={styles.welcomeTitle}>Bienvenue, {name.split(' ')[0]} !</Text>
            <Text style={styles.welcomeSubtitle}>
              Vous êtes maintenant membre de la communauté AANID
            </Text>
            <View style={styles.welcomeCityRow}>
              <Text style={styles.welcomeCityPin}>📍</Text>
              <Text style={styles.welcomeCityName}>{villeNom}</Text>
            </View>
            <ActivityIndicator size="small" color="#1E73BE" style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>
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

  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  selectorEmpty: { borderColor: '#FF6600', borderStyle: 'dashed' },
  selectorDisabled: { opacity: 0.5 },
  selectorIcon: { fontSize: 16, marginRight: 10 },
  selectorText: { flex: 1, fontSize: 15, color: '#1A2A3A', fontWeight: '500' },
  selectorTextEmpty: { color: '#94A3B8', fontWeight: '400' },
  selectorArrow: { fontSize: 10, color: '#94A3B8' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalClose: { fontSize: 20, color: '#9CA3AF', padding: 4 },
  modalSearch: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#F5F7FA', borderRadius: 10, paddingHorizontal: 14, height: 44 },
  modalSearchIcon: { fontSize: 14, marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: 14, color: '#1F2937', padding: 0 },
  modalList: { paddingHorizontal: 16, paddingBottom: 16 },
  modalEmpty: { textAlign: 'center', color: '#9CA3AF', marginTop: 30, fontSize: 14 },

  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  pickerItemActive: { backgroundColor: '#EBF5FF' },
  pickerItemFlag: { fontSize: 20, marginRight: 12 },
  pickerItemText: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1 },
  pickerItemInfo: { flex: 1 },
  pickerItemTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  pickerItemSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  pickerCheck: { fontSize: 16, color: '#1E73BE', fontWeight: '700' },
  cityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },

  welcomeOverlay: { flex: 1, backgroundColor: 'rgba(0,27,61,0.85)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  welcomeCard: { backgroundColor: '#fff', borderRadius: 24, padding: 36, alignItems: 'center', width: '100%', maxWidth: 320 },
  welcomeIcon: { fontSize: 48, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  welcomeSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  welcomeCityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#EBF5FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  welcomeCityPin: { fontSize: 16, marginRight: 8 },
  welcomeCityName: { fontSize: 16, fontWeight: '700', color: '#1E73BE' },
});
