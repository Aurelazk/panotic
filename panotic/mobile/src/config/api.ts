import { Platform } from 'react-native';

const DEV_HOST = Platform.select({
  android: '10.50.14.253',
  ios: '10.50.14.253',
  default: '10.50.14.253',
});

export const API_BASE_URL = Platform.OS === 'web'
  ? ''
  : `http://${DEV_HOST}:3000`;
