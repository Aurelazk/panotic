import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

interface FormationCardProps {
  formation: any;
  onPress: () => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  panneautique: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
  environnement: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
  vie_saine: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
  infrastructure: 'https://images.unsplash.com/photo-1541888946425-d81bb7b7c3e5?w=400',
};

const FormationCard: React.FC<FormationCardProps> = ({ formation, onPress }) => {
  const imageUri = formation.imageUrl || CATEGORY_IMAGES[formation.category];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {imageUri ? (
        <ImageBackground source={{ uri: imageUri }} style={styles.image}>
          <View style={styles.imageOverlay}>
            <View style={[styles.badge, formation.isFree ? styles.freeBadge : styles.paidBadge]}>
              <Text style={[styles.badgeText, formation.isFree ? styles.freeBadgeText : styles.paidBadgeText]}>
                {formation.isFree ? 'GRATUIT' : `${formation.price} ${formation.currency}`}
              </Text>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <LinearGradient colors={['#003366', '#001B3D']} style={styles.image}>
          <View style={styles.imageOverlay}>
            <View style={[styles.badge, formation.isFree ? styles.freeBadge : styles.paidBadge]}>
              <Text style={[styles.badgeText, formation.isFree ? styles.freeBadgeText : styles.paidBadgeText]}>
                {formation.isFree ? 'GRATUIT' : `${formation.price} ${formation.currency}`}
              </Text>
            </View>
            <View style={styles.iconPlaceholder}>
              <Icon name="school-outline" size={40} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </LinearGradient>
      )}
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{formation.category?.toUpperCase() || ''}</Text>
          </View>
          {formation.enrolledUsers?.length > 0 && (
            <View style={styles.enrolledBadge}>
              <Icon name="checkmark-circle" size={12} color="#4CAF50" />
              <Text style={styles.enrolledText}>INSCRIT</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{formation.title}</Text>
        
        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{formation.duration}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="people-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{((formation.capacity ?? 0) - (formation.enrolledCount ?? 0))} places restantes</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  iconPlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  freeBadge: {
    backgroundColor: '#4CAF50',
  },
  freeBadgeText: {
    color: '#fff',
  },
  paidBadge: {
    backgroundColor: '#fff',
  },
  paidBadgeText: {
    color: '#003366',
  },
  content: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  categoryText: {
    color: '#FF6600',
    fontSize: 10,
    fontWeight: 'bold',
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  enrolledText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
});

export default FormationCard;
