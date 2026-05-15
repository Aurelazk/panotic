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
});
