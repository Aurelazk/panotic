import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:4000/api/v1';
const TOKEN_KEY = '@aanid/v1/access_token';

async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Réponse serveur invalide');
  }

  if (!response.ok) {
    const error = new Error(data?.error || 'Une erreur est survenue');
    error.status = response.status;
    throw error;
  }

  return data;
}

async function authRequest(path, options = {}) {
  const token = await getToken();
  if (!token) throw Object.assign(new Error('Non authentifié'), { status: 401 });

  return request(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}

export async function getFormations(type) {
  const params = type && type !== 'toutes' ? `?type=${type}` : '';
  return request(`/formations${params}`);
}

export async function getFormationById(id) {
  return request(`/formations/${id}`);
}

export async function enroll(id) {
  return authRequest(`/formations/${id}/enroll`, { method: 'POST' });
}

export async function getMyFormations() {
  return authRequest('/formations/mine');
}

export async function updateProgress(id, moduleId, progress) {
  return authRequest(`/formations/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ moduleId, progress }),
  });
}
