import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { api } from '../../api/client';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const THEMES = [
  { label: 'Environnement', value: 'environnement', icon: 'leaf-outline', color: '#4CAF50' },
  { label: 'Santé', value: 'sante', icon: 'heart-outline', color: '#F44336' },
  { label: 'Famille', value: 'famille', icon: 'people-outline', color: '#2196F3' },
];

const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('environnement');
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res: any) => {
      if (!res.didCancel && res.assets) {
        setMedia(res.assets[0]);
      }
    });
  };

  const handleCreatePost = async () => {
    if (content.length < 5) {
      Alert.alert('Attention', 'Votre message est trop court.');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = '';
      if (media) {
        const formData = new FormData();
        formData.append('file', {
          uri: media.uri,
          type: media.type,
          name: media.fileName || 'post.jpg',
        } as any);

        const uploadRes = await api.post('/storage/upload', formData);
        mediaUrl = uploadRes.data.url;
      }

      await api.post('/ugc', {
        content,
        theme: selectedTheme,
        mediaUrl,
      });

      Alert.alert('Succès', 'Votre message a été publié !');
      setContent('');
      setMedia(null);
      onPostCreated();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur lors de la publication';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Publication</Text>
          <TouchableOpacity onPress={handleCreatePost} disabled={loading} style={styles.postBtn}>
            <Text style={[styles.postButtonText, loading && { opacity: 0.5 }]}>Publier</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.themeSection}>
            <Text style={styles.label}>Thématique</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themes}>
              {THEMES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setSelectedTheme(t.value)}
                  style={[
                    styles.themeChip,
                    selectedTheme === t.value && { backgroundColor: t.color, borderColor: t.color },
                  ]}
                >
                  <Icon 
                    name={t.icon} 
                    size={16} 
                    color={selectedTheme === t.value ? '#fff' : '#666'} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.themeText, selectedTheme === t.value && { color: '#fff' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.input}
            placeholder="De quoi souhaitez-vous parler ?"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          {media?.assets && (
            <View style={styles.mediaPreview}>
              <Image source={{ uri: media.assets[0].uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
                <Icon name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.addMedia} onPress={handlePickImage}>
            <Icon name="image-outline" size={24} color="#003366" />
            <Text style={styles.addMediaText}>Ajouter une photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 5,
  },
  postBtn: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 12,
  },
  themeSection: {
    marginBottom: 25,
  },
  themes: {
    flexDirection: 'row',
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  themeText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    fontSize: 18,
    color: '#333',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  mediaPreview: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removeMedia: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  addMedia: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  addMediaText: {
    marginLeft: 10,
    color: '#003366',
    fontWeight: 'bold',
  },
});

export default CreatePostModal;
