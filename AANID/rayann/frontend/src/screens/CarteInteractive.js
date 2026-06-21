import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Callout, Polygon, UrlTile } from 'react-native-maps';
import { COLORS } from '../constants/colors';
import {
  LAYERS,
  SIGNALEMENT_TYPES,
  PANEL_TYPES,
  PANEL_STATUSES,
  INITIAL_REGION,
  API_BASE,
} from '../constants/mapData';
import VilleSelector from '../components/VilleSelector';
import AnalyseVille from '../components/AnalyseVille';

const { width, height } = Dimensions.get('window');

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 999,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    elevation: 10,
  },
  topBarTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    left: 15,
    right: 15,
    zIndex: 200,
    elevation: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: 'CenturyGothic',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.textTertiary,
  },
  searchResults: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'CenturyGothic',
  },
  layerTabs: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 155 : 115,
    left: 15,
    right: 15,
    zIndex: 100,
    elevation: 10,
  },
  layerScroll: {
    flexDirection: 'row',
  },
  layerTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontFamily: 'CenturyGothic',
  },
  activeTabText: {
    color: COLORS.white,
  },
  mapOptions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 210 : 170,
    right: 15,
    zIndex: 100,
    alignItems: 'center',
  },
  optionBtn: {
    backgroundColor: COLORS.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.primary,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 10,
  },
  filterScroll: {
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'CenturyGothic',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  statusChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  modalBg: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 15,
    zIndex: 5,
    padding: 5,
  },
  modalCloseText: {
    fontSize: 22,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.primary,
    fontFamily: 'CenturyGothic',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'CenturyGothic',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'CenturyGothic',
    flex: 1,
  },
  modalBtn: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'CenturyGothic',
  },
  markerSignalement: {
    padding: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  markerPanel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerPanelInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelIcon: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  calloutCard: {
    width: 230,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calloutHeader: {
    padding: 10,
    alignItems: 'center',
  },
  calloutTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'CenturyGothic',
  },
  calloutBody: {
    padding: 12,
  },
  calloutDesc: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 18,
    fontFamily: 'CenturyGothic',
  },
  calloutDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'right',
    fontFamily: 'CenturyGothic',
  },
  emptyFilterText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 10,
    fontSize: 13,
    fontFamily: 'CenturyGothic',
  },
  villeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 155 : 115,
    right: 15,
    zIndex: 150,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
  },
  villeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 5,
    fontFamily: 'CenturyGothic',
  },
};

export default function CarteInteractive() {
  const mapRef = useRef(null);
  const [signalements, setSignalements] = useState([]);
  const [panneaux, setPanneaux] = useState([]);
  const [zones, setZones] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [villes, setVilles] = useState([]);
  const [selectedVille, setSelectedVille] = useState('toutes');
  const [showVilleSelector, setShowVilleSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeLayer, setActiveLayer] = useState('signalements');
  const [mapType, setMapType] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [sigFilter, setSigFilter] = useState('tous');
  const [panelTypeFilter, setPanelTypeFilter] = useState('tous');
  const [panelStatusFilter, setPanelStatusFilter] = useState('tous');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAnalyse, setShowAnalyse] = useState(false);

  const iconMap = {
    CLASSIQUE: 'C',
    DIGITAL: 'D',
    ABRIBUS: 'A',
    TOTEM: 'T',
    AUTRE: '•',
  };

  useEffect(() => {
    fetchVilles();
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
    } catch (e) {}
  };

  const apiGet = async (path) => {
    try {
      const response = await fetch(`${API_BASE}${path}`);
      return await response.json();
    } catch (error) {
      console.warn('API error:', path, error.message);
      return [];
    }
  };

  const fetchVilles = async () => {
    const data = await apiGet('/carte/villes');
    setVilles(data);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const villeParam = selectedVille !== 'toutes' ? `&villeId=${selectedVille}` : '';
      switch (activeLayer) {
        case 'signalements': {
          const data = await apiGet(`/carte/signalements?type=${sigFilter}${villeParam}`);
          setSignalements(Array.isArray(data) ? data : []);
          break;
        }
        case 'panneaux': {
          const data = await apiGet(`/carte/panneaux?type=${panelTypeFilter}&etat=${panelStatusFilter}${villeParam}`);
          setPanneaux(Array.isArray(data) ? data : []);
          break;
        }
        case 'zones': {
          const data = await apiGet(`/carte/zones${villeParam}`);
          setZones(Array.isArray(data) ? data : []);
          break;
        }
        case 'heatmap': {
          const data = await apiGet(`/carte/heatmap${villeParam}`);
          setHeatmapPoints(Array.isArray(data) ? data : []);
          break;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [activeLayer, sigFilter, panelTypeFilter, panelStatusFilter, selectedVille]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const performSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    const villeParam = selectedVille !== 'toutes' ? `&villeId=${selectedVille}` : '';
    const data = await apiGet(`/carte/recherche?q=${encodeURIComponent(searchQuery)}${villeParam}`);
    setSearchResults(data);
    setLoading(false);
  };

  const getSignalementColor = (type) => {
    const found = SIGNALEMENT_TYPES.find(t => t.value === type);
    return found ? found.color : COLORS.primary;
  };

  const getPanelColor = (etat) => {
    const found = PANEL_STATUSES.find(s => s.value === etat);
    return found ? found.color : COLORS.primary;
  };

  const getZoneFillColor = (type) => {
    return COLORS.zone[type] || 'rgba(0,0,0,0.1)';
  };

  const getZoneStrokeColor = (type) => {
    return COLORS.zoneStroke[type] || COLORS.primary;
  };

  const centerOnCoordinate = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
    setSearchResults(null);
    setSearchQuery('');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const renderSearchResults = () => {
    if (!searchResults) return null;
    const hasPanels = searchResults.panneaux && searchResults.panneaux.length > 0;
    const hasZones = searchResults.zones && searchResults.zones.length > 0;
    if (!hasPanels && !hasZones) {
      return (
        <View style={styles.searchResults}>
          <Text style={styles.emptyFilterText}>Aucun résultat trouvé</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
        {hasPanels && searchResults.panneaux.map((p, i) => (
          <TouchableOpacity
            key={`p-${i}`}
            style={styles.searchResultItem}
            onPress={() => centerOnCoordinate(p.lat, p.lng)}
          >
            <Text style={{ fontSize: 14 }}>📋</Text>
            <Text style={styles.searchResultText}>
              Panneau {p.type} - {p.format}
            </Text>
          </TouchableOpacity>
        ))}
        {hasZones && searchResults.zones.map((z, i) => (
          <TouchableOpacity
            key={`z-${i}`}
            style={styles.searchResultItem}
            onPress={() => {
              if (z.boundary && z.boundary.coordinates && z.boundary.coordinates[0] && z.boundary.coordinates[0][0]) {
                centerOnCoordinate(z.boundary.coordinates[0][0][1], z.boundary.coordinates[0][0][0]);
              }
            }}
          >
            <Text style={{ fontSize: 14 }}>🗺️</Text>
            <Text style={styles.searchResultText}>{z.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderSignalementMarker = (item) => (
    <Marker
      key={item.id}
      coordinate={{ latitude: item.lat, longitude: item.lng }}
    >
      <View style={[styles.markerSignalement, { backgroundColor: getSignalementColor(item.type) }]}>
        <View style={[styles.markerDot, { backgroundColor: COLORS.white }]} />
      </View>
      <Callout tooltip onPress={() => setSelectedItem({ type: 'signalement', ...item })}>
        <View style={styles.calloutCard}>
          <View style={[styles.calloutHeader, { backgroundColor: getSignalementColor(item.type) }]}>
            <Text style={styles.calloutTitle}>{item.type.replace('_', ' ')}</Text>
          </View>
          <View style={styles.calloutBody}>
            <Text style={styles.calloutDesc} numberOfLines={3}>{item.description}</Text>
            <Text style={styles.calloutDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );

  const renderPanelMarker = (item) => (
    <Marker
      key={item.id}
      coordinate={{ latitude: item.lat, longitude: item.lng }}
    >
      <View style={[styles.markerPanel, { borderColor: getPanelColor(item.etat) }]}>
        <View style={[styles.markerPanelInner, { backgroundColor: getPanelColor(item.etat) }]}>
          <Text style={styles.panelIcon}>{iconMap[item.type] || '•'}</Text>
        </View>
      </View>
      <Callout tooltip onPress={() => setSelectedItem({ type: 'panneau', ...item })}>
        <View style={styles.calloutCard}>
          <View style={[styles.calloutHeader, { backgroundColor: getPanelColor(item.etat) }]}>
            <Text style={styles.calloutTitle}>{item.type}</Text>
          </View>
          <View style={styles.calloutBody}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { width: 60 }]}>Format:</Text>
              <Text style={styles.infoValue}>{item.format}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { width: 60 }]}>Régime:</Text>
              <Text style={styles.infoValue}>{item.regime}</Text>
            </View>
            <Text style={styles.calloutDate}>{item.etat}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );

  const renderZonePolygon = (item) => (
    <Polygon
      key={item.id}
      coordinates={(item.boundary?.coordinates?.[0] || []).map(c => ({
        latitude: c[1],
        longitude: c[0],
      }))}
      fillColor={getZoneFillColor(item.type)}
      strokeColor={getZoneStrokeColor(item.type)}
      strokeWidth={2}
      tappable
      onPress={() => setSelectedItem({ type: 'zone', ...item })}
    />
  );

  const renderModalContent = () => {
    if (!selectedItem) return null;
    const item = selectedItem;

    if (item.type === 'signalement') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Signalement</Text>
          <View style={[styles.calloutHeader, { backgroundColor: getSignalementColor(item.type), borderRadius: 10, marginBottom: 15 }]}>
            <Text style={styles.calloutTitle}>{item.type?.replace('_', ' ')}</Text>
          </View>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />
          )}
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Description:</Text><Text style={styles.infoValue}>{item.description}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Statut:</Text><Text style={styles.infoValue}>{item.status}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Votes:</Text><Text style={styles.infoValue}>{item.votesCount}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Date:</Text><Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text></View>
        </ScrollView>
      );
    }

    if (item.type === 'panneau') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Détails du Panneau</Text>
          <View style={[styles.calloutHeader, { backgroundColor: getPanelColor(item.etat), borderRadius: 10, marginBottom: 15 }]}>
            <Text style={styles.calloutTitle}>{item.type}</Text>
          </View>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />
          )}
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Format:</Text><Text style={styles.infoValue}>{item.format}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Régime:</Text><Text style={styles.infoValue}>{item.regime}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>État:</Text><Text style={styles.infoValue}>{item.etat}</Text></View>
          {item.price && <View style={styles.infoRow}><Text style={styles.infoLabel}>Prix:</Text><Text style={styles.infoValue}>{item.price.toLocaleString()} FCFA</Text></View>}
        </ScrollView>
      );
    }

    if (item.type === 'zone') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Zone</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Nom:</Text><Text style={styles.infoValue}>{item.name}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Type:</Text><Text style={styles.infoValue}>{item.type}</Text></View>
        </ScrollView>
      );
    }

    return null;
  };

  const renderHeatmapOverlay = () => {
    if (heatmapPoints.length === 0) return null;
    return heatmapPoints.map((p, i) => (
      <Marker key={`heat-${i}`} coordinate={{ latitude: p.latitude, longitude: p.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={{
          width: Math.min(40, 10 + (p.weight || 1) * 2),
          height: Math.min(40, 10 + (p.weight || 1) * 2),
          borderRadius: 20,
          backgroundColor: `rgba(233, 78, 60, ${Math.min(0.8, 0.2 + (p.weight || 1) * 0.04)})`,
          borderWidth: 1,
          borderColor: `rgba(233, 78, 60, ${Math.min(0.9, 0.3 + (p.weight || 1) * 0.05)})`,
        }} />
      </Marker>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Carte Interactive</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            placeholder="Rechercher panneaux, zones..."
            placeholderTextColor={COLORS.textTertiary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults(null); }}>
              <Text style={{ fontSize: 18, color: COLORS.textTertiary }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {renderSearchResults()}
      </View>

      <TouchableOpacity
        style={styles.villeBtn}
        onPress={() => setShowVilleSelector(true)}
      >
        <Text style={{ fontSize: 14 }}>📍</Text>
        <Text style={styles.villeBtnText}>
          {selectedVille === 'toutes' ? 'Toutes les villes' : (villes.find(v => v.id === selectedVille)?.nom || selectedVille)}
        </Text>
      </TouchableOpacity>

      <View style={styles.layerTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.layerScroll}>
          {LAYERS.map((l) => (
            <TouchableOpacity
              key={l.id}
              onPress={() => {
                setActiveLayer(l.id);
                if (l.id === 'analyse') setShowAnalyse(true);
              }}
              style={[styles.layerTab, activeLayer === l.id && styles.activeTab]}
            >
              <Text style={{ fontSize: 14, color: activeLayer === l.id ? COLORS.white : COLORS.textSecondary }}>
                {l.icon === 'alert-circle' ? '⚠️' : l.icon === 'grid' ? '📋' : l.icon === 'square' ? '🔲' : l.icon === 'thermometer' ? '🌡️' : '📊'}
              </Text>
              <Text style={[styles.tabText, activeLayer === l.id && styles.activeTabText]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mapOptions}>
        <TouchableOpacity style={styles.optionBtn} onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}>
          <Text style={{ fontSize: 20 }}>{mapType === 'standard' ? '🗺️' : '🛰️'}</Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        initialRegion={INITIAL_REGION}
      >
        {mapType === 'standard' && (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
          />
        )}

        {activeLayer === 'signalements' && signalements.map(renderSignalementMarker)}
        {activeLayer === 'panneaux' && panneaux.map(renderPanelMarker)}
        {activeLayer === 'zones' && zones.map(renderZonePolygon)}
        {activeLayer === 'heatmap' && renderHeatmapOverlay()}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <View style={styles.bottomControls}>
        {activeLayer === 'signalements' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {SIGNALEMENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setSigFilter(t.value)}
                style={[styles.filterChip, sigFilter === t.value && { backgroundColor: t.color }]}
              >
                <Text style={[styles.filterText, sigFilter === t.value && { color: COLORS.white }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeLayer === 'panneaux' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {PANEL_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setPanelTypeFilter(t.value)}
                  style={[styles.filterChip, panelTypeFilter === t.value && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterText, panelTypeFilter === t.value && styles.activeFilterText]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {PANEL_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setPanelStatusFilter(s.value)}
                  style={[styles.statusChip, panelStatusFilter === s.value && { backgroundColor: s.color, borderColor: s.color }]}
                >
                  <View style={[styles.statusDot, { backgroundColor: s.color || COLORS.textTertiary }]} />
                  <Text style={[styles.filterText, panelStatusFilter === s.value && { color: COLORS.white }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedItem(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {renderModalContent()}
          </View>
        </View>
      </Modal>

      <VilleSelector
        visible={showVilleSelector}
        villes={villes}
        selected={selectedVille}
        onSelect={(villeId) => {
          setSelectedVille(villeId);
          setShowVilleSelector(false);
        }}
        onClose={() => setShowVilleSelector(false)}
      />

      <AnalyseVille
        visible={showAnalyse}
        villeId={selectedVille}
        villes={villes}
        apiGet={apiGet}
        onClose={() => {
          setShowAnalyse(false);
          setActiveLayer('signalements');
        }}
      />
    </View>
  );
}
