export const LAYERS = [
  { id: 'signalements', label: 'Signalements', icon: 'alert-circle' },
  { id: 'panneaux', label: 'Panneaux', icon: 'grid' },
  { id: 'zones', label: 'Zones', icon: 'square' },
  { id: 'heatmap', label: 'Chaleur', icon: 'thermometer' },
  { id: 'analyse', label: 'Analyse', icon: 'bar-chart' },
];

export const SIGNALEMENT_TYPES = [
  { label: 'Tous', value: 'tous', color: '#1E73BE' },
  { label: 'Bon État', value: 'BON_ETAT', color: '#3BB273' },
  { label: 'Dégradé', value: 'DEGRADE', color: '#F5A623' },
  { label: 'Obsolète', value: 'OBSOLETE', color: '#95A5A6' },
  { label: 'Dangereux', value: 'DANGEREUX', color: '#E94E3C' },
  { label: 'Illégal', value: 'ILLEGAL', color: '#9B59B6' },
  { label: 'En Travaux', value: 'TRAVAUX', color: '#3498DB' },
];

export const PANEL_TYPES = [
  { label: 'Tous Types', value: 'tous', icon: 'grid' },
  { label: 'Classique', value: 'CLASSIQUE', icon: 'square' },
  { label: 'Digital', value: 'DIGITAL', icon: 'monitor' },
  { label: 'Abribus', value: 'ABRIBUS', icon: 'navigation' },
  { label: 'Totem', value: 'TOTEM', icon: 'arrow-up' },
  { label: 'Autre', value: 'AUTRE', icon: 'more-horizontal' },
];

export const PANEL_STATUSES = [
  { label: 'Tous États', value: 'tous', color: '#1E73BE' },
  { label: 'Disponible', value: 'DISPONIBLE', color: '#3BB273' },
  { label: 'Loué', value: 'LOUE', color: '#F5A623' },
  { label: 'Maintenance', value: 'MAINTENANCE', color: '#E94E3C' },
];

export const INITIAL_REGION = {
  latitude: 6.5,
  longitude: 2.0,
  latitudeDelta: 4.0,
  longitudeDelta: 4.0,
};

export const API_BASE = 'http://localhost:4000/api/v1';
