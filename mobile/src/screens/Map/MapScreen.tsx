import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { Marker, Callout, Polygon, PROVIDER_GOOGLE, Region, Heatmap } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { api } from '../../api/client';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';

const LAYERS = [
  { id: 'signalements', label: 'Signalements', icon: 'alert-circle-outline' },
  { id: 'panels', label: 'Panneaux', icon: 'easel-outline' },
  { id: 'zones', label: 'Zones', icon: 'map-outline' },
  { id: 'heatmap', label: 'Chaleur', icon: 'flame-outline' },
];

const PANEL_TYPES = [
  { label: 'Tous Types', value: 'tous', icon: 'apps-outline' },
  { label: 'Grand Format', value: 'grand_format', icon: 'tablet-landscape-outline' },
  { label: 'Mobilier Urbain', value: 'mobilier_urbain', icon: 'library-outline' },
  { label: 'Petit Format', value: 'petit_format', icon: 'browsers-outline' },
  { label: 'Enseigne', value: 'enseigne', icon: 'megaphone-outline' },
];

const PANEL_STATUSES = [
  { label: 'Tous États', value: 'tous' },
  { label: 'Bon État', value: 'bon', color: '#4CAF50' },
  { label: 'Dégradé', value: 'degrade', color: '#FFC107' },
  { label: 'À Remplacer', value: 'a_remplacer', color: '#F44336' },
];

const SIGNALEMENT_FILTERS = [
  { label: 'Tous', value: 'tous' },
  { label: 'Bon État', value: 'bon_etat', color: '#4CAF50' },
  { label: 'Dégradé', value: 'degrade', color: '#FFA500' },
  { label: 'Obsolète', value: 'obsolete', color: '#808080' },
  { label: 'Dangereux', value: 'dangereux', color: '#FF0000' },
  { label: 'Illégal', value: 'illegal', color: '#800080' },
  { label: 'En Travaux', value: 'travaux', color: '#2196F3' },
];

const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const [signalements, setSignalements] = useState<any[]>([]);
  const [panels, setPanels] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{panels: any[], zones: any[]} | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<any>(null);

  const [activeLayer, setActiveLayer] = useState('signalements');
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [loading, setLoading] = useState(false);

  // Filters
  const [sigFilter, setSigFilter] = useState('tous');
  const [panelTypeFilter, setPanelTypeFilter] = useState('tous');
  const [panelStatusFilter, setPanelStatusFilter] = useState('tous');

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    } else {
      await Geolocation.requestAuthorization('whenInUse');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeLayer === 'signalements') {
        const res = await api.get(`/signalements?type=${sigFilter}`);
        setSignalements(res.data);
      } else if (activeLayer === 'panels') {
        const res = await api.get(`/mapping/panels?type=${panelTypeFilter}&etat=${panelStatusFilter}`);
        setPanels(res.data);
      } else if (activeLayer === 'zones') {
        const res = await api.get('/mapping/zones');
        setZones(res.data);
      } else if (activeLayer === 'heatmap') {
        const res = await api.get('/signalements/heatmap');
        setHeatmapData(res.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/mapping/search?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  };

  const centerOnCoordinate = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    setSearchResults(null);
    setSearchQuery('');
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeLayer, sigFilter, panelTypeFilter, panelStatusFilter])
  );

  const centerOnUser = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const region: Region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        };
        mapRef.current?.animateToRegion(region, 1000);
      },
      (error) => Alert.alert('Erreur', 'Impossible de récupérer votre position.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getSignalementColor = (type: string) => {
    const found = SIGNALEMENT_FILTERS.find((t) => t.value === type);
    return found ? found.color : '#003366';
  };

  const getPanelIcon = (type: string) => {
    const found = PANEL_TYPES.find((t) => t.value === type);
    return found ? found.icon : 'radio-button-on-outline';
  };

  const getPanelColor = (etat: string) => {
    const found = PANEL_STATUSES.find((s) => s.value === etat);
    return found ? found.color : '#003366';
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'commerciale': return 'rgba(33, 150, 243, 0.3)';
      case 'residentielle': return 'rgba(76, 175, 80, 0.3)';
      case 'speciale': return 'rgba(156, 39, 176, 0.3)';
      case 'interdite': return 'rgba(244, 67, 54, 0.3)';
      default: return 'rgba(0, 0, 0, 0.2)';
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Rechercher panneaus, zones..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults(null); }}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        {searchResults && (
          <ScrollView style={styles.searchResults}>
            {searchResults.panels.map((p, i) => (
              <TouchableOpacity key={`p-${i}`} style={styles.searchResultItem} onPress={() => centerOnCoordinate(p.location.coordinates[1], p.location.coordinates[0])}>
                <Icon name="easel" size={16} color="#003366" />
                <Text style={styles.searchResultText}>Panneau {p.type.replace('_', ' ')} - {p.format}</Text>
              </TouchableOpacity>
            ))}
            {searchResults.zones.map((z, i) => (
              <TouchableOpacity key={`z-${i}`} style={styles.searchResultItem} onPress={() => centerOnCoordinate(z.boundary.coordinates[0][0][1], z.boundary.coordinates[0][0][0])}>
                <Icon name="map" size={16} color="#2196F3" />
                <Text style={styles.searchResultText}>{z.name}</Text>
              </TouchableOpacity>
            ))}
            {searchResults.panels.length === 0 && searchResults.zones.length === 0 && (
              <Text style={{padding: 10, color: '#666', textAlign: 'center'}}>Aucun résultat</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Top Layer & Map Options */}
      <View style={styles.topControls}>
        <View style={styles.layerTabs}>
          {LAYERS.map((l) => (
            <TouchableOpacity
              key={l.id}
              onPress={() => setActiveLayer(l.id)}
              style={[styles.layerTab, activeLayer === l.id && styles.activeTab]}
            >
              <Icon name={l.icon} size={18} color={activeLayer === l.id ? '#fff' : '#666'} />
              <Text style={[styles.tabText, activeLayer === l.id && styles.activeTabText]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.mapOptions}>
          <TouchableOpacity 
            style={styles.optionBtn} 
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Icon name={mapType === 'standard' ? 'map-outline' : 'earth-outline'} size={24} color="#003366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionBtn} onPress={centerOnUser}>
            <Icon name="locate-outline" size={24} color="#FF6600" />
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        clusterColor="#003366"
        initialRegion={{
          latitude: 6.3653,
          longitude: 2.4183,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Heatmap Layer */}
        {activeLayer === 'heatmap' && heatmapData.length > 0 && (
          <Heatmap
            points={heatmapData}
            radius={40}
            opacity={0.7}
            gradient={{
              colors: ['#000000', '#00e5ff', '#00ff00', '#ffff00', '#ff0000'],
              startPoints: [0.01, 0.25, 0.50, 0.75, 1],
              colorMapSize: 256
            }}
          />
        )}

        {/* Signalements Layer */}
        {activeLayer === 'signalements' && signalements.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
            }}
          >
            <View style={[styles.customMarker, { backgroundColor: getSignalementColor(item.type) }]}>
              <Icon name="alert-outline" size={16} color="#fff" />
            </View>
            <Callout tooltip>
              <View style={styles.calloutCard}>
                <View style={[styles.calloutHeader, { backgroundColor: getSignalementColor(item.type) }]}>
                  <Text style={styles.calloutTitle}>{item.type.toUpperCase().replace('_', ' ')}</Text>
                </View>
                <View style={styles.calloutBody}>
                  <Text style={styles.calloutDesc} numberOfLines={3}>{item.description}</Text>
                  {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.calloutImage} />
                  )}
                  <Text style={styles.calloutDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Panels Layer */}
        {activeLayer === 'panels' && panels.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
            }}
          >
            <View style={[styles.panelMarker, { borderColor: getPanelColor(item.etat) }]}>
              <View style={[styles.panelIconBg, { backgroundColor: getPanelColor(item.etat) }]}>
                <Icon name={getPanelIcon(item.type)} size={14} color="#fff" />
              </View>
            </View>
            <Callout tooltip onPress={() => setSelectedPanel(item)}>
              <View style={styles.calloutCard}>
                <View style={[styles.calloutHeader, { backgroundColor: getPanelColor(item.etat) }]}>
                  <Text style={styles.calloutTitle}>{item.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <View style={styles.calloutBody}>
                  <View style={styles.infoRow}>
                    <Icon name="resize-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>Format: {item.format}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="business-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>Régime: {item.regime.toUpperCase()}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="bulb-outline" size={14} color={item.estEclaire ? '#FFC107' : '#ccc'} />
                    <Text style={styles.infoText}>{item.estEclaire ? 'Éclairé' : 'Non éclairé'}</Text>
                  </View>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Zones Layer */}
        {activeLayer === 'zones' && zones.map((item) => (
          <Polygon
            key={item.id}
            coordinates={item.boundary.coordinates[0].map((c: any) => ({
              longitude: c[0],
              latitude: c[1],
            }))}
            fillColor={getZoneColor(item.type)}
            strokeColor="rgba(0,0,0,0.5)"
            strokeWidth={1}
            tappable
            onPress={() => Alert.alert('Zone Info', `${item.name}\nType: ${item.type}\nFacteur Tarif: x${item.tariffFactor}`)}
          />
        ))}
      </MapView>

      {/* Bottom Filters */}
      <View style={styles.bottomControls}>
        {loading && <ActivityIndicator size="small" color="#FF6600" style={{ marginBottom: 10 }} />}
        
        {activeLayer === 'signalements' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {SIGNALEMENT_FILTERS.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setSigFilter(t.value)}
                style={[
                  styles.filterChip,
                  sigFilter === t.value && { backgroundColor: t.color || '#003366' },
                ]}
              >
                <Text style={[styles.filterText, sigFilter === t.value && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeLayer === 'panels' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginBottom: 8 }]}>
              {PANEL_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setPanelTypeFilter(t.value)}
                  style={[
                    styles.filterChip,
                    panelTypeFilter === t.value && styles.activePanelFilter,
                  ]}
                >
                  <Icon name={t.icon} size={14} color={panelTypeFilter === t.value ? '#fff' : '#666'} />
                  <Text style={[styles.filterText, { marginLeft: 5 }, panelTypeFilter === t.value && { color: '#fff' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {PANEL_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setPanelStatusFilter(s.value)}
                  style={[
                    styles.statusChip,
                    panelStatusFilter === s.value && { backgroundColor: s.color || '#003366', borderColor: s.color || '#003366' },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: s.color || '#ccc' }]} />
                  <Text style={[styles.filterText, panelStatusFilter === s.value && { color: '#fff' }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
      <Modal visible={!!selectedPanel} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPanel(null)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            {selectedPanel && (
              <>
                <Text style={styles.modalTitle}>Détails du Panneau</Text>
                <Image source={{ uri: 'https://via.placeholder.com/300x150.png?text=Photo+du+Panneau' }} style={styles.modalImage} />
                <View style={styles.infoRow}><Text style={styles.boldText}>Type:</Text><Text> {selectedPanel.type.replace('_',' ')}</Text></View>
                <View style={styles.infoRow}><Text style={styles.boldText}>Format:</Text><Text> {selectedPanel.format}</Text></View>
                <View style={styles.infoRow}><Text style={styles.boldText}>Régime:</Text><Text> {selectedPanel.regime}</Text></View>
                <View style={styles.infoRow}><Text style={styles.boldText}>État:</Text><Text> {selectedPanel.etat}</Text></View>
                <TouchableOpacity style={styles.modalBtn} onPress={() => { Alert.alert('Réservation', 'Demande envoyée.'); setSelectedPanel(null); }}>
                  <Text style={styles.modalBtnText}>Réserver / Signaler</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topControls: {
    position: 'absolute',
    top: 120,
    left: 15,
    right: 15,
    zIndex: 10,
  },
  layerTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  layerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#003366',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 15,
    right: 15,
    zIndex: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 350,
  },
  modalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#003366',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  boldText: {
    fontWeight: 'bold',
    width: 70,
  },
  modalBtn: {
    backgroundColor: '#FF6600',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapOptions: {
    position: 'absolute',
    top: 60,
    right: 0,
    alignItems: 'center',
  },
  optionBtn: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterScroll: {
    paddingHorizontal: 15,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  statusChip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activePanelFilter: {
    backgroundColor: '#FF6600',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  customMarker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  panelMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  panelIconBg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  calloutHeader: {
    padding: 8,
    alignItems: 'center',
  },
  calloutTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutBody: {
    padding: 12,
  },
  calloutDesc: {
    fontSize: 13,
    color: '#444',
    marginBottom: 10,
    lineHeight: 18,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  calloutDate: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default MapScreen;
