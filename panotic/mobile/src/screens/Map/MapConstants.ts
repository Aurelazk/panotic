export const LAYERS = [
  { id: 'signalements', label: 'Signalements', icon: 'alert-circle-outline' },
  { id: 'panels', label: 'Panneaux', icon: 'easel-outline' },
  { id: 'zones', label: 'Zones', icon: 'map-outline' },
  { id: 'heatmap', label: 'Chaleur', icon: 'flame-outline' },
];

export const PANEL_TYPES = [
  { label: 'Tous Types', value: 'tous', icon: 'apps-outline' },
  { label: 'Grand Format', value: 'grand_format', icon: 'tablet-landscape-outline' },
  { label: 'Mobilier Urbain', value: 'mobilier_urbain', icon: 'library-outline' },
  { label: 'Petit Format', value: 'petit_format', icon: 'browsers-outline' },
  { label: 'Enseigne', value: 'enseigne', icon: 'megaphone-outline' },
];

export const PANEL_STATUSES = [
  { label: 'Tous États', value: 'tous' },
  { label: 'Bon État', value: 'bon', color: '#4CAF50' },
  { label: 'Dégradé', value: 'degrade', color: '#FFC107' },
  { label: 'À Remplacer', value: 'a_remplacer', color: '#F44336' },
];

export const SIGNALEMENT_FILTERS = [
  { label: 'Tous', value: 'tous' },
  { label: 'Bon État', value: 'bon_etat', color: '#4CAF50' },
  { label: 'Dégradé', value: 'degrade', color: '#FFA500' },
  { label: 'Obsolète', value: 'obsolete', color: '#808080' },
  { label: 'Dangereux', value: 'dangereux', color: '#FF0000' },
  { label: 'Illégal', value: 'illegal', color: '#800080' },
  { label: 'En Travaux', value: 'travaux', color: '#2196F3' },
];
