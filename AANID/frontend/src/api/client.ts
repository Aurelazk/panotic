import axios from 'axios';
import { store } from '../store';
import { API_BASE_URL } from '../config/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = require('../store/slices/authSlice');
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: any, fallback = 'Une erreur est survenue.') {
  if (error?.data?.message) return error.data.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
}
