import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'react-native', replacement: path.resolve(__dirname, 'src/mocks/react-native-web-bridge.js') },
      { find: /^react-native-vector-icons\/.*/, replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-vector-icons', replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-maps', replacement: path.resolve(__dirname, 'src/mocks/maps-mock.tsx') },
      { find: 'react-native-map-clustering', replacement: path.resolve(__dirname, 'src/mocks/maps-mock.tsx') },
      { find: 'react-native-geolocation-service', replacement: path.resolve(__dirname, 'src/mocks/geolocation-mock.ts') },
      { find: 'react-native-safe-area-context', replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-screens', replacement: path.resolve(__dirname, 'src/mocks/screens-mock.tsx') },
      { find: 'react-native-keychain', replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-image-picker', replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-linear-gradient', replacement: path.resolve(__dirname, 'src/mocks/linear-gradient-mock.tsx') },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
    ],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  optimizeDeps: {
    exclude: [
      'react-native-vector-icons',
      'react-native-maps',
      'react-native-map-clustering',
    ],
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/signalements': 'http://localhost:3000',
      '/formations': 'http://localhost:3000',
      '/ugc': 'http://localhost:3000',
      '/mapping': 'http://localhost:3000',
      '/notifications': 'http://localhost:3000',
      '/publicite': 'http://localhost:3000',
      '/payments': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
    },
  },
});
