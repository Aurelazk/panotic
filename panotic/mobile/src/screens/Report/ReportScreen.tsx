import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import { api } from '../../api/client';
import { API_BASE_URL } from '../../config/api';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { COLORS } from '../../constants/theme';

const REPORT_TYPES = [
  { id: 'bon_etat', label: 'Bon État', icon: 'checkmark-circle-outline', color: '#4CAF50' },
  { id: 'degrade', label: 'Dégradé', icon: 'alert-circle-outline', color: '#FF9800' },
  { id: 'obsolete', label: 'Obsolète', icon: 'time-outline', color: '#9E9E9E' },
  { id: 'dangereux', label: 'Dangereux', icon: 'warning-outline', color: '#F44336' },
  { id: 'illegal', label: 'Illégal', icon: 'ban-outline', color: '#000000' },
  { id: 'travaux', label: 'En Travaux', icon: 'hammer-outline', color: '#2196F3' },
];

const ReportScreen = () => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('degrade');
  const [media, setMedia] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [recentSignalements, setRecentSignalements] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentSignalements();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
      getCurrentLocation();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de localisation',
          message: 'Panotic a besoin de votre position pour géolocaliser le signalement.',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchRecentSignalements = async () => {
    try {
      const response = await api.get('/signalements');
      setRecentSignalements(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const selectMedia = () => {
    Alert.alert(
      'Ajouter un média',
      'Choisissez le type et la source',
      [
        {
          text: '📸 Photo (Caméra)',
          onPress: () => launchCamera({ mediaType: 'photo', quality: 0.8 }, (res: any) => {
            if (!res.didCancel && res.assets) setMedia(res.assets[0]);
          }),
        },
        {
          text: '🎥 Vidéo (Caméra)',
          onPress: () => launchCamera({ mediaType: 'video', videoQuality: 'high', durationLimit: 30 }, (res: any) => {
            if (!res.didCancel && res.assets) setMedia(res.assets[0]);
          }),
        },
        {
          text: '🖼️ Galerie',
          onPress: () => launchImageLibrary({ mediaType: 'mixed', quality: 0.8 }, (res: any) => {
            if (!res.didCancel && res.assets) setMedia(res.assets[0]);
          }),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Erreur', 'Veuillez ajouter une description.');
      return;
    }

    if (!coords) {
      Alert.alert('Erreur', 'Localisation indisponible. Veuillez activer le GPS.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      let videoUrl = '';
      
      if (media) {
        const formData = new FormData();
        formData.append('file', {
          uri: media.uri,
          type: media.type,
          name: media.fileName || (media.type?.includes('video') ? 'upload.mp4' : 'upload.jpg'),
        } as any);

        const uploadResponse = await api.post('/storage/upload', formData);
        
        if (media.type?.includes('video')) {
          videoUrl = uploadResponse.data.url;
        } else {
          imageUrl = uploadResponse.data.url;
        }
      }

      await api.post('/signalements', {
        description,
        type,
        latitude: coords.latitude,
        longitude: coords.longitude,
        imageUrl,
        videoUrl,
      });

      Alert.alert('Succès', 'Signalement envoyé avec succès !');
      setDescription('');
      setMedia(null);
      fetchRecentSignalements();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string, voteType: 'confirm' | 'reject') => {
    try {
      await api.post(`/signalements/${id}/vote`, { type: voteType });
      Alert.alert('Merci !', 'Votre vote a été pris en compte.');
      fetchRecentSignalements();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue.';
      Alert.alert('Erreur', message);
    }
  };

  const downloadReport = (id: string) => {
    const url = `${API_BASE_URL}/signalements/${id}/report`;
    Linking.openURL(url).catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir le lien du rapport.'));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon name="add-circle-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Signalement Citoyen</Text>
        <Text style={styles.subtitle}>Contribuez à l'amélioration de votre cadre de vie</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nouveau Signalement</Text>
        
        <Text style={styles.label}>Nature du problème</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
          {REPORT_TYPES.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setType(item.id)}
              style={[
                styles.typeItem,
                type === item.id && { backgroundColor: item.color, borderColor: item.color }
              ]}
            >
              <Icon name={item.icon} size={20} color={type === item.id ? '#fff' : '#666'} />
              <Text style={[styles.typeLabel, type === item.id && styles.activeTypeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Preuve Visuelle (Photo ou Vidéo)</Text>
        <TouchableOpacity style={styles.mediaPicker} onPress={selectMedia}>
          {media ? (
            <View style={styles.previewContainer}>
              {media.type?.includes('video') ? (
                <View style={styles.videoPlaceholder}>
                  <Icon name="videocam" size={50} color="#FF6600" />
                  <Text style={styles.videoText}>Vidéo sélectionnée</Text>
                </View>
              ) : (
                <Image source={{ uri: media.uri }} style={styles.preview} />
              )}
              <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
                <Icon name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaPickerContent}>
              <Icon name="camera-outline" size={40} color="#FF6600" />
              <Text style={styles.mediaPickerText}>Capturer une photo ou vidéo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={20} color="#003366" />
          {locationLoading ? (
            <ActivityIndicator size="small" color="#003366" style={{ marginLeft: 10 }} />
          ) : (
            <Text style={styles.locationText}>
              {coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : 'Position en attente...'}
            </Text>
          )}
          <TouchableOpacity onPress={getCurrentLocation}>
            <Icon name="refresh-outline" size={20} color="#FF6600" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Description détaillée</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez précisément la situation (ex: panneau penché, affiche déchirée...)"
          placeholderTextColor="#999"
        />

        <TouchableOpacity 
          style={[styles.submitButton, (loading || !coords) && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading || !coords}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Envoyer le Signalement</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Derniers Signalements</Text>
        <TouchableOpacity onPress={fetchRecentSignalements}>
          <Icon name="reload-outline" size={20} color="#003366" />
        </TouchableOpacity>
      </View>

      {recentSignalements.map((item) => {
        const typeInfo = REPORT_TYPES.find(t => t.id === item.type) || REPORT_TYPES[1];
        return (
          <View key={item.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={[styles.statusBadge, { backgroundColor: typeInfo.color + '20' }]}>
                <Icon name={typeInfo.icon} size={14} color={typeInfo.color} />
                <Text style={[styles.statusText, { color: typeInfo.color }]}>{typeInfo.label.toUpperCase()}</Text>
              </View>
              <Text style={styles.reportDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.reportImage} resizeMode="cover" />
            )}
            <Text style={styles.reportDesc} numberOfLines={3}>{item.description}</Text>
            
            <View style={styles.actionsContainer}>
              <View style={styles.voteSection}>
                <TouchableOpacity onPress={() => handleVote(item.id, 'confirm')} style={styles.voteBtn}>
                  <Icon name="thumbs-up" size={18} color="#4CAF50" />
                  <Text style={[styles.voteText, { color: '#4CAF50' }]}>{item.votesCount || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleVote(item.id, 'reject')} style={styles.voteBtn}>
                  <Icon name="thumbs-down" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.rightActions}>
                {item.videoUrl && <Icon name="videocam-outline" size={20} color="#666" style={{ marginRight: 10 }} />}
                {item.imageUrl && <Icon name="image-outline" size={20} color="#666" style={{ marginRight: 15 }} />}
                <TouchableOpacity onPress={() => downloadReport(item.id)} style={styles.reportBtn}>
                  <Icon name="document-text-outline" size={16} color="#fff" />
                  <Text style={styles.reportBtnText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    backgroundColor: '#0A1628',
    marginHorizontal: -20,
    marginTop: -20,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 24,
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#001B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1628',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F2F5',
    paddingBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  typeLabel: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeLabel: {
    color: '#fff',
  },
  mediaPicker: {
    height: 160,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  mediaPickerContent: {
    alignItems: 'center',
  },
  mediaPickerText: {
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
  },
  videoText: {
    marginTop: 5,
    color: '#FF6600',
    fontWeight: '600',
  },
  removeMedia: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#003366',
    marginLeft: 10,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 25,
    color: '#333',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A1628',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#001B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 5,
  },
  reportDate: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  reportImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },
  reportDesc: {
    color: '#4A4A4A',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 15,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 5,
  },
  voteText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 14,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reportBtnText: {
    marginLeft: 5,
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default ReportScreen;
