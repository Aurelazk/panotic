import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Auth Token
api.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        config.headers.Authorization = `Bearer ${credentials.password}`;
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401: Unauthorized (Token Expired)
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      // TODO: Implement Refresh Token logic here
      // For now, let's alert or redirect to login
      Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
    }

    // Handle 500: Server Error
    if (error.response?.status >= 500) {
      Alert.alert('Erreur serveur', 'Une erreur est survenue sur nos serveurs. Veuillez réessayer plus tard.');
    }

    return Promise.reject(error);
  }
);

/**
 * Generic Error Message Extractor
 */
export const getApiErrorMessage = (error: any, defaultMessage: string = 'Une erreur est survenue') => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message[0];
    }
    return error.response.data.message;
  }
  return defaultMessage;
};
