import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import { COLORS } from '../constants/colors';
import { API_BASE } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';
import SearchBar from '../components/SearchBar';
import LayerTabs from '../components/LayerTabs';
import MapMarkers from '../components/MapMarkers';
import FilterBar from '../components/FilterBar';
import MapOptions from '../components/MapOptions';
import DetailModal from '../components/DetailModal';
import VilleSelector from '../components/VilleSelector';
import AnalyseVille from '../components/AnalyseVille';

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

  const handleLayerSelect = (layerId) => {
    setActiveLayer(layerId);
    if (layerId === 'analyse') setShowAnalyse(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Carte Interactive</Text>
      </View>

      <SearchBar
        query={searchQuery}
        onChange={setSearchQuery}
        onSubmit={performSearch}
        onClear={() => { setSearchQuery(''); setSearchResults(null); }}
        results={searchResults}
        onResultPress={centerOnCoordinate}
        onZoneResultPress={(z) => {
          if (z.boundary?.coordinates?.[0]?.[0]) {
            centerOnCoordinate(z.boundary.coordinates[0][0][1], z.boundary.coordinates[0][0][0]);
          }
        }}
      />

      <TouchableOpacity style={styles.villeBtn} onPress={() => setShowVilleSelector(true)}>
        <Text style={{ fontSize: 14 }}>📍</Text>
        <Text style={styles.villeBtnText}>
          {selectedVille === 'toutes' ? 'Toutes les villes' : (villes.find(v => v.id === selectedVille)?.nom || selectedVille)}
        </Text>
      </TouchableOpacity>

      <LayerTabs activeLayer={activeLayer} onSelect={handleLayerSelect} />
      <MapOptions mapType={mapType} onToggle={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')} />

      <MapMarkers
        mapRef={mapRef}
        mapType={mapType}
        activeLayer={activeLayer}
        signalements={signalements}
        panneaux={panneaux}
        zones={zones}
        heatmapPoints={heatmapPoints}
        onSelectItem={setSelectedItem}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <FilterBar
        activeLayer={activeLayer}
        sigFilter={sigFilter}
        panelTypeFilter={panelTypeFilter}
        panelStatusFilter={panelStatusFilter}
        onSigFilter={setSigFilter}
        onPanelTypeFilter={setPanelTypeFilter}
        onPanelStatusFilter={setPanelStatusFilter}
      />

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <VilleSelector
        visible={showVilleSelector}
        villes={villes}
        selected={selectedVille}
        onSelect={(villeId) => { setSelectedVille(villeId); setShowVilleSelector(false); }}
        onClose={() => setShowVilleSelector(false)}
      />

      <AnalyseVille
        visible={showAnalyse}
        villeId={selectedVille}
        villes={villes}
        apiGet={apiGet}
        onClose={() => { setShowAnalyse(false); setActiveLayer('signalements'); }}
      />
    </View>
  );
}
