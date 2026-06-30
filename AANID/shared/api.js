/**
 * URL de base de l'API AANID (sans /api/v1).
 * - Web dev : chaîne vide → Vite proxy `/api` → localhost:4000
 * - Android émulateur : http://10.0.2.2:4000
 * - Production : définir AANID_API_URL (ex. https://aanid-api.onrender.com)
 */
function detectReactNative() {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
}

function fromEnv() {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.AANID_API_URL) return process.env.AANID_API_URL.replace(/\/$/, '');
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return null;
}

function getApiOrigin() {
  const env = fromEnv();
  if (env) return env;

  if (detectReactNative()) {
    // Émulateur Android → machine hôte ; appareil physique → remplacer par l'URL Render
    return 'http://10.0.2.2:4000';
  }

  // Web (Vite) : proxy relatif
  if (typeof window !== 'undefined' && window.location) {
    return '';
  }

  return 'http://localhost:4000';
}

function getApiBaseUrl() {
  const origin = getApiOrigin();
  if (!origin) return '/api/v1';
  return `${origin}/api/v1`;
}

module.exports = { getApiOrigin, getApiBaseUrl };
