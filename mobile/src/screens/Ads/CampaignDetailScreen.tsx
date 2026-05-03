import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../api/client';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const CampaignDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { panelId, campaignId } = route.params || {};

  const [panel, setPanel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [media, setMedia] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (panelId) {
      fetchPanel();
    }
  }, [panelId]);

  const fetchPanel = async () => {
    setLoading(true);
    try {
      // We can use mapping/panels to get it or add a specific mapping/panels/:id
      const response = await api.get('/mapping/panels');
      const p = response.data.find((item: any) => item.id === panelId);
      setPanel(p);
    } catch (error) {
      console.error('Fetch panel error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickMedia = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res: any) => {
      if (!res.didCancel && res.assets) {
        setMedia(res.assets[0]);
      }
    });
  };

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setSubmitting(true);
    try {
      let creativeUrl = '';
      if (media) {
        const formData = new FormData();
        formData.append('file', {
          uri: media.uri,
          type: media.type,
          name: media.fileName || 'creative.jpg',
        } as any);

        const uploadRes = await api.post('/storage/upload', formData);
        creativeUrl = uploadRes.data.url;
      }

      // 1. Create Campaign
      const campaignRes = await api.post('/publicite/campaigns', {
        name,
        startDate,
        endDate,
        budget: panel?.type === 'grand_format' ? 50000 : 15000,
        creativeUrl,
      });

      // 2. Book Slot
      await api.post(`/publicite/bookings/${campaignRes.data.id}/${panelId}`, {
        faceIndex: 0,
      });

      Alert.alert('Succès', 'Votre campagne a été créée et l\'espace réservé !');
      navigation.navigate('AdvertiserDashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Une erreur est survenue lors de la réservation.';
      Alert.alert('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#003366" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réserver un Espace</Text>
        <Text style={styles.subtitle}>Configuration de votre campagne publicitaire</Text>
      </View>

      {panel && (
        <View style={styles.panelPreview}>
          <Image 
            source={{ uri: panel.imageUrl || 'https://via.placeholder.com/400x200?text=Panneau+Publicitaire' }} 
            style={styles.panelImage} 
          />
          <View style={styles.panelContent}>
            <Text style={styles.panelName}>{panel.type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.panelFormat}>{panel.format} - {panel.regime.toUpperCase()}</Text>
          </View>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Nom de la Campagne</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Lancement Nouveau Produit"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Date de Début</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date de Fin</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        <Text style={styles.label}>Visuel Publicitaire (Créatif)</Text>
        <TouchableOpacity style={styles.mediaBtn} onPress={handlePickMedia}>
          {media ? (
            <Image source={{ uri: media.uri }} style={styles.preview} />
          ) : (
            <View style={styles.mediaPlaceholder}>
              <Icon name="cloud-upload-outline" size={30} color="#999" />
              <Text style={styles.mediaText}>Télécharger le visuel</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapituel de la Réservation</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Coût de l'espace:</Text>
            <Text style={styles.summaryValue}>{panel?.type === 'grand_format' ? '50.000' : '15.000'} FCFA</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durée:</Text>
            <Text style={styles.summaryValue}>30 jours</Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }]}>
            <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>TOTAL ESTIMÉ:</Text>
            <Text style={[styles.summaryValue, { color: '#FF6600', fontSize: 18 }]}>
              {panel?.type === 'grand_format' ? '50.000' : '15.000'} FCFA
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Confirmer la Réservation</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#003366',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  panelPreview: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  panelImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  panelContent: {
    flex: 1,
  },
  panelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  panelFormat: {
    fontSize: 12,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
  },
  mediaBtn: {
    height: 180,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden',
  },
  mediaPlaceholder: {
    alignItems: 'center',
  },
  mediaText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  summaryCard: {
    backgroundColor: '#FFF5F0',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CC5200',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  submitBtn: {
    backgroundColor: '#FF6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6600',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default CampaignDetailScreen;
