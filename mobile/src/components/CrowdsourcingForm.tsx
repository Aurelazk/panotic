import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { launchCamera, MediaType, PhotoQuality } from 'react-native-image-picker';
import { API_BASE_URL } from '../config/api';

interface CrowdsourcingFormProps {
  userId: number; // passed down from auth context or parent
}

export const CrowdsourcingForm: React.FC<CrowdsourcingFormProps> = ({ userId }) => {
  const [type, setType] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Request location permission for Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to report billboards.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  };

  const handleTakePhoto = async () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as PhotoQuality,
      saveToPhotos: true,
      includeBase64: false,
    };

    const result = await launchCamera(options);

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
      Alert.alert('Error', 'Could not open camera.');
    } else if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri || null);
      setPhotoFile({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'photo.jpg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!type || !size || !photoFile) {
      Alert.alert('Incomplete', 'Please fill all fields and take a photo.');
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    setLoading(true);

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Ensure accuracy is good enough (<= 15 meters)
        if (accuracy > 15) {
          setLoading(false);
          Alert.alert(
            'Low GPS Signal',
            `GPS accuracy is ${accuracy.toFixed(2)}m. It needs to be 15m or better. Please move to an open area.`
          );
          return;
        }

        try {
          const formData = new FormData();
          formData.append('userId', String(userId));
          formData.append('type', type);
          formData.append('size', size);
          formData.append('latitude', String(latitude));
          formData.append('longitude', String(longitude));
          formData.append('photo', photoFile as any);

          const apiUrl = `${API_BASE_URL}/api/crowdsourcing/submit`; 
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              // Note: Do not set Content-Type for FormData, fetch sets it automatically with boundary
            },
          });

          const data = await response.json();

          if (response.status === 201) {
            Alert.alert('Success', 'Billboard reported successfully and is pending review.');
            // Reset form
            setType('');
            setSize('');
            setPhotoUri(null);
            setPhotoFile(null);
          } else if (response.status === 409) {
            Alert.alert('Duplicate Found', data.error || 'Un panneau publicitaire est déjà répertorié à cet emplacement exact.');
          } else {
            Alert.alert('Error', data.error || 'An unexpected error occurred.');
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Failed to connect to the server.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        console.error(error);
        Alert.alert('Location Error', 'Unable to get your location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report a Billboard</Text>

      <TextInput
        style={styles.input}
        placeholder="Billboard Type (e.g., Digital, Static)"
        value={type}
        onChangeText={setType}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Size (e.g., 4x3m)"
        value={size}
        onChangeText={setSize}
        placeholderTextColor="#888"
      />

      <View style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No Photo Captured</Text>
          </View>
        )}
        <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
          <Text style={styles.cameraButtonText}>Take Live Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholderBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#888',
  },
  cameraButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8cd59a',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
