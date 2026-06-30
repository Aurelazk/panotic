import { Platform } from 'react-native';

/**
 * Origine du backend (sans /api/v1).
 * Production : définir AANID_API_URL au build ou remplacer PRODUCTION_API_ORIGIN.
 */
export const PRODUCTION_API_ORIGIN = 'https://aanid-api.onrender.com';

function resolveOrigin(): string {
  const env =
    (typeof process !== 'undefined' && process.env?.AANID_API_URL) ||
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL);

  if (env) return env.replace(/\/$/, '');

  if (!__DEV__) return PRODUCTION_API_ORIGIN;

  if (Platform.OS === 'web') return '';

  // Émulateur Android → localhost de la machine hôte
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';

  return 'http://localhost:4000';
}

export const API_ORIGIN = resolveOrigin();
export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api/v1` : '/api/v1';
