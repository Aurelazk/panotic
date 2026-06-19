import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL } from '../../config/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
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
