import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Marker, Callout, Polygon, Region, Heatmap, UrlTile } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { api } from '../../api/client';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';

import { COLORS } from '../../constants/theme';
import { LAYERS, PANEL_TYPES, PANEL_STATUSES, SIGNALEMENT_FILTERS } from './MapConstants';
import { styles } from './MapStyles';

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
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      } else {
        await Geolocation.requestAuthorization('whenInUse');
      }
    } catch (e) {
      console.warn('Permission error', e);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeLayer) {
        case 'signalements':
          endpoint = `/signalements?type=${sigFilter}`;
          break;
        case 'panels':
          endpoint = `/mapping/panels?type=${panelTypeFilter}&etat=${panelStatusFilter}`;
          break;
        case 'zones':
          endpoint = '/mapping/zones';
          break;
        case 'heatmap':
          endpoint = '/signalements/heatmap';
          break;
      }

      if (endpoint) {
        const { data } = await api.get(endpoint);
        if (activeLayer === 'signalements') setSignalements(data);
        if (activeLayer === 'panels') setPanels(data);
        if (activeLayer === 'zones') setZones(data);
        if (activeLayer === 'heatmap') setHeatmapData(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeLayer, sigFilter, panelTypeFilter, panelStatusFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const performSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/mapping/search?q=${searchQuery}`);
      setSearchResults(data);
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  };

  const centerOnCoordinate = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
    setSearchResults(null);
    setSearchQuery('');
  };

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

  const getSignalementColor = (type: string) => 
    SIGNALEMENT_FILTERS.find((t) => t.value === type)?.color || COLORS.primary;

  const getPanelIcon = (type: string) => 
    PANEL_TYPES.find((t) => t.value === type)?.icon || 'radio-button-on-outline';

  const getPanelColor = (etat: string) => 
    PANEL_STATUSES.find((s) => s.value === etat)?.color || COLORS.primary;

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
          <Icon name="search-outline" size={20} color={COLORS.placeholder} />
          <TextInput
            placeholder="Rechercher panneaux, zones..."
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults(null); }}>
              <Icon name="close-circle" size={20} color={COLORS.placeholder} />
            </TouchableOpacity>
          )}
        </View>
        {searchResults && (
          <ScrollView style={styles.searchResults}>
            {searchResults.panels.map((p, i) => (
              <TouchableOpacity key={`p-${i}`} style={styles.searchResultItem} onPress={() => centerOnCoordinate(p.location.coordinates[1], p.location.coordinates[0])}>
                <Icon name="easel" size={16} color={COLORS.primary} />
                <Text style={styles.searchResultText}>Panneau {p.type.replace('_', ' ')} - {p.format}</Text>
              </TouchableOpacity>
            ))}
            {searchResults.zones.map((z, i) => (
              <TouchableOpacity key={`z-${i}`} style={styles.searchResultItem} onPress={() => centerOnCoordinate(z.boundary.coordinates[0][0][1], z.boundary.coordinates[0][0][0])}>
                <Icon name="map" size={16} color={COLORS.secondary} />
                <Text style={styles.searchResultText}>{z.name}</Text>
              </TouchableOpacity>
            ))}
            {searchResults.panels.length === 0 && searchResults.zones.length === 0 && (
              <Text style={{padding: 10, color: COLORS.textSecondary, textAlign: 'center'}}>Aucun résultat</Text>
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
              <Icon name={l.icon} size={18} color={activeLayer === l.id ? '#fff' : COLORS.textSecondary} />
              <Text style={[styles.tabText, activeLayer === l.id && styles.activeTabText]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.mapOptions}>
          <TouchableOpacity 
            style={styles.optionBtn} 
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Icon name={mapType === 'standard' ? 'map-outline' : 'earth-outline'} size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionBtn} onPress={centerOnUser}>
            <Icon name="locate-outline" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType === 'standard' ? (Platform.OS === 'android' ? 'none' : 'standard') : mapType}
        clusterColor={COLORS.primary}
        initialRegion={{
          latitude: 6.3653,
          longitude: 2.4183,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {mapType === 'standard' && (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
          />
        )}
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
            onPress={() => Alert.alert('Zone Info', `${item.name}\nType: ${item.type}`)}
          />
        ))}
      </MapView>

      {/* Bottom Filters */}
      <View style={styles.bottomControls}>
        {loading && <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginBottom: 10 }} />}
        
        {activeLayer === 'signalements' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {SIGNALEMENT_FILTERS.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setSigFilter(t.value)}
                style={[
                  styles.filterChip,
                  sigFilter === t.value && { backgroundColor: t.color || COLORS.primary },
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
                  <Icon name={t.icon} size={14} color={panelTypeFilter === t.value ? '#fff' : COLORS.textSecondary} />
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
                    panelStatusFilter === s.value && { backgroundColor: s.color || COLORS.primary, borderColor: s.color || COLORS.primary },
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

      <Modal visible={!!selectedPanel} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPanel(null)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            {selectedPanel && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Détails du Panneau</Text>
                <Image source={{ uri: 'https://via.placeholder.com/300x150.png?text=Photo+du+Panneau' }} style={styles.modalImage} />
                <View style={styles.infoRow}><Text style={styles.boldText}>Type:</Text><Text> {selectedPanel.type.replace('_',' ')}</Text></View>
                <View style={styles.infoRow}><Text style={styles.boldText}>Format:</Text><Text> {selectedPanel.format}</Text></View>
                <View style={styles.infoRow}><Text style={styles.boldText}>Régime:</Text><Text> {selectedPanel.regime}</Text></View>
                <View style={styles.infoRow}><Text style={styles.boldText}>État:</Text><Text> {selectedPanel.etat}</Text></View>
                <TouchableOpacity style={styles.modalBtn} onPress={() => { Alert.alert('Réservation', 'Demande envoyée.'); setSelectedPanel(null); }}>
                  <Text style={styles.modalBtnText}>Réserver / Signaler</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MapScreen;
