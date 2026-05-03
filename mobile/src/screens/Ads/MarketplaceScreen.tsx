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
} from 'react-native';
import { api } from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

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
      style={styles.panelCard}
      onPress={() => navigation.navigate('CampaignDetail', { panelId: item.id })}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200?text=Panneau+Publicitaire' }} 
        style={styles.panelImage} 
      />
      <View style={styles.badgeContainer}>
        <View style={styles.typeBadge}>
          <Text style={styles.badgeText}>{item.type.replace('_', ' ').toUpperCase()}</Text>
        </View>
        {item.estEclaire && (
          <View style={styles.lightBadge}>
            <Icon name="flash" size={10} color="#fff" />
            <Text style={styles.badgeText}>ÉCLAIRÉ</Text>
          </View>
        )}
      </View>
      
      <View style={styles.panelInfo}>
        <Text style={styles.panelTitle}>{item.format} - {item.regime.toUpperCase()}</Text>
        <View style={styles.locationRow}>
          <Icon name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>Cotonou, Bénin</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>À partir de</Text>
          <Text style={styles.priceValue}>{item.type === 'grand_format' ? '50.000' : '15.000'} FCFA</Text>
          <Text style={styles.pricePeriod}>/ mois</Text>
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
      <View style={styles.searchBar}>
        <Icon name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par zone ou format..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['tous', 'grand_format', 'mobilier_urbain', 'petit_format'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.activeChip]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterText, filterType === type && styles.activeFilterText]}>
                {type.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPanels}
          keyExtractor={(item) => item.id}
          renderItem={renderPanel}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={{alignItems:'center', marginTop: 60}}>
              <Icon name="search-outline" size={50} color="#ccc" />
              <Text style={{color:'#999', marginTop:10}}>Aucun panneau trouvé</Text>
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
    backgroundColor: '#F8F9FA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeChip: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  panelCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  panelImage: {
    width: '100%',
    height: 180,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
  },
  typeBadge: {
    backgroundColor: 'rgba(0,51,102,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 5,
  },
  lightBadge: {
    backgroundColor: 'rgba(255,102,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  panelInfo: {
    padding: 15,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6600',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  bookBtn: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MarketplaceScreen;
