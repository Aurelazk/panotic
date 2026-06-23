import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Marker, Callout, Polygon, UrlTile, Heatmap } from 'react-native-maps';
import MapView from 'react-native-map-clustering/lib/ClusteredMapView';
import { COLORS } from '../constants/colors';
import { SIGNALEMENT_TYPES, PANEL_STATUSES, INITIAL_REGION } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';

const TILE_URLS = {
  standard: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const ICON_MAP = {
  CLASSIQUE: 'C', DIGITAL: 'D', ABRIBUS: 'A', TOTEM: 'T', AUTRE: '•',
};

function getSignalementColor(type) {
  const found = SIGNALEMENT_TYPES.find(t => t.value === type);
  return found ? found.color : COLORS.primary;
}

function getPanelColor(etat) {
  const found = PANEL_STATUSES.find(s => s.value === etat);
  return found ? found.color : COLORS.primary;
}

function getZoneFillColor(type) {
  return COLORS.zone[type] || 'rgba(0,0,0,0.1)';
}

function getZoneStrokeColor(type) {
  return COLORS.zoneStroke[type] || COLORS.primary;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function SignalementMarker({ item, onSelect }) {
  return (
    <Marker key={item.id} coordinate={{ latitude: item.lat, longitude: item.lng }}>
      <View style={[styles.markerSignalement, { backgroundColor: getSignalementColor(item.type) }]}>
        <View style={[styles.markerDot, { backgroundColor: COLORS.white }]} />
      </View>
      <Callout tooltip onPress={() => onSelect({ type: 'signalement', ...item })}>
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
}

function PanelMarker({ item, onSelect }) {
  const color = getPanelColor(item.etat);
  return (
    <Marker key={item.id} coordinate={{ latitude: item.lat, longitude: item.lng }}>
      <View style={[styles.markerPanel, { borderColor: color }]}>
        <View style={[styles.markerPanelInner, { backgroundColor: color }]}>
          <Text style={styles.panelIcon}>{ICON_MAP[item.type] || '•'}</Text>
        </View>
      </View>
      <Callout tooltip onPress={() => onSelect({ type: 'panneau', ...item })}>
        <View style={styles.calloutCard}>
          <View style={[styles.calloutHeader, { backgroundColor: color }]}>
            <Text style={styles.calloutTitle}>{item.type}</Text>
          </View>
          <View style={styles.calloutBody}>
            <View style={{ ...styles.infoRow }}>
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
}

function ZonePolygon({ item, onPress }) {
  return (
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
      onPress={() => onPress({ type: 'zone', ...item })}
    />
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

function TileError() {
  return (
    <View style={styles.loadingOverlay}>
      <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Erreur de chargement des tuiles</Text>
    </View>
  );
}

export default function MapMarkers({
  mapRef, mapType, activeLayer,
  signalements, panneaux, zones, heatmapPoints,
  onSelectItem, loading, tileError,
}) {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType="none"
      initialRegion={INITIAL_REGION}
      clusterColor={COLORS.primary}
    >
      <UrlTile
        urlTemplate={TILE_URLS[mapType] || TILE_URLS.standard}
        maximumZ={19}
        tileSize={256}
      />
      {activeLayer === 'signalements' && signalements.map((item) => (
        <SignalementMarker key={item.id} item={item} onSelect={onSelectItem} />
      ))}
      {activeLayer === 'panneaux' && panneaux.map((item) => (
        <PanelMarker key={item.id} item={item} onSelect={onSelectItem} />
      ))}
      {activeLayer === 'zones' && zones.map((item) => (
        <ZonePolygon key={item.id} item={item} onPress={onSelectItem} />
      ))}
      {activeLayer === 'heatmap' && heatmapPoints.length > 0 && (
        <Heatmap
          points={heatmapPoints}
          radius={40}
          opacity={0.6}
        />
      )}
      {loading && !tileError && <LoadingSkeleton />}
      {tileError && <TileError />}
    </MapView>
  );
}
