import { Platform } from 'react-native';

/**
 * Dev: Android emulator → host machine via 10.0.2.2; iOS simulator → localhost.
 * Device physique: définir l’IP de votre machine (même Wi‑Fi), ex. 192.168.1.10.
 */
const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : 'https://panotic.onrender.com';
