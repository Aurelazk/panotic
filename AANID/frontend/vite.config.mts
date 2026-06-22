import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      { find: 'react-native', replacement: path.resolve(__dirname, 'src/mocks/react-native-web-bridge.js') },
      { find: 'react-native-maps', replacement: path.resolve(__dirname, 'src/mocks/maps-mock.tsx') },
      { find: 'react-native-safe-area-context', replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-screens', replacement: path.resolve(__dirname, 'src/mocks/screens-mock.tsx') },
    ],
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js',
    ],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    exclude: [
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-maps',
      '@aanid/beni-momo-adnan-frontend',
      '@aanid/bryan-fanou-frontend',
      '@aanid/rayan-frontend',
      '@aanid/undef-frontend',
      '@aanid/w-d-frontend',
    ],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
