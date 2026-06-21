import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: { loader: { '.js': 'jsx' } },
  resolve: {
    alias: [
      { find: 'react-native', replacement: 'react-native-web' },
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
    exclude: [
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
