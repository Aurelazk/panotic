import * as RNWeb from 'react-native-web';

// Mock for PermissionsAndroid
export const PermissionsAndroid = {
  request: async () => 'granted',
  check: async () => true,
  requestMultiple: async () => ({}),
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again' },
  PERMISSIONS: { ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION' },
};

// Mock for Alert
export const Alert = {
  alert: (title, message) => window.alert(`${title}\n\n${message}`),
};

// Re-export everything from react-native-web
export * from 'react-native-web';

// Merge RNWeb with our mocks for the default export
const ExportedRN = {
  ...RNWeb,
  PermissionsAndroid,
  Alert,
};

export default ExportedRN;
