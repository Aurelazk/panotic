import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : 'https://panotic.onrender.com';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        headers.set('Authorization', `Bearer ${credentials.password}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Signalement', 'Formation'],
  endpoints: () => ({}),
});
