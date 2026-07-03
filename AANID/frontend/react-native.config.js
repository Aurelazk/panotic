module.exports = {
  project: {
    android: {
      packageName: 'com.aanid',
    },
    ios: {},
  },
  dependencies: {
    // Carte native = Leaflet (WebView), pas Google Maps SDK
    'react-native-maps': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
