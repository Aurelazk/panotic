import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { api } from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const MarketplaceScreen = () => {
  const navigation = useNavigation<any>();
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');

  const fetchPanels = async () => {
    try {
      const url = filterType !== 'tous'
        ? `/mapping/panels?type=${filterType}`
        : '/mapping/panels';
      const response = await api.get(url);
      setPanels(response.data);
    } catch (error) {
      console.error('Fetch panels error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPanels();
  }, [filterType]);

  const filteredPanels = search.trim()
    ? panels.filter(p =>
        p.type?.toLowerCase().includes(search.toLowerCase()) ||
        p.format?.toLowerCase().includes(search.toLowerCase()) ||
        p.regime?.toLowerCase().includes(search.toLowerCase())
      )
    : panels;

  const renderPanel = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CampaignDetail', { panelId: item.id })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200?text=Panneau+Publicitaire' }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardBadges}>
        <View style={styles.typeBadge}>
          <Text style={styles.badgeLabel}>{item.type.replace('_', ' ').toUpperCase()}</Text>
        </View>
        {item.estEclaire && (
          <View style={styles.lightBadge}>
            <Icon name="flash" size={10} color="#fff" />
            <Text style={styles.badgeLabel}>ÉCLAIRÉ</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.format} - {item.regime.toUpperCase()}</Text>
        <View style={styles.location}>
          <Icon name="location-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.locationText}>Cotonou, Bénin</Text>
        </View>
        
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>À partir de</Text>
          <Text style={styles.priceValue}>{item.type === 'grand_format' ? '50.000' : '15.000'} FCFA</Text>
          <Text style={styles.priceUnit}>/ mois</Text>
        </View>

        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => navigation.navigate('CampaignDetail', { panelId: item.id })}
        >
          <Text style={styles.bookBtnText}>Réserver cet espace</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <LinearGradient colors={['#0A1628', '#001B3D']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Icon name="megaphone-outline" size={22} color={COLORS.secondary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Espace Publicitaire</Text>
            <Text style={styles.headerSub}>Trouvez le panneau idéal pour votre campagne</Text>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par zone ou format..."
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['tous', 'grand_format', 'mobilier_urbain', 'petit_format'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.filterChipActive]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterText, filterType === type && styles.filterTextActive]}>
                {type.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPanels}
          keyExtractor={(item) => item.id}
          renderItem={renderPanel}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="search-outline" size={50} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Aucun panneau trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,102,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    borderRadius: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  filterRow: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.md,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: 'rgba(0,51,102,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lightBadge: {
    backgroundColor: 'rgba(255,102,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badgeLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 16,
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: '#1A2A3A',
    marginBottom: 4,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 5,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  priceValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  bookBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textTertiary,
    marginTop: 10,
    fontSize: 15,
  },
});

export default MarketplaceScreen;
