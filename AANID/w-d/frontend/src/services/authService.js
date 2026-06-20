import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: AsyncStorage is unencrypted. For production, use react-native-encrypted-storage
// to protect tokens against device-level data extraction.

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const KEYS = {
  ACCESS_TOKEN: '@aanid/v1/access_token',
  REFRESH_TOKEN: '@aanid/v1/refresh_token',
  USER: '@aanid/v1/user',
};

// ─── Internal request helpers ─────────────────────────────────────────────────

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
    error.code = data?.code;
    throw error;
  }

  return data;
}

async function authRequest(path, options = {}) {
  const token = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  if (!token) throw Object.assign(new Error('Non authentifié'), { status: 401 });

  try {
    return await request(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (err.status === 401) {
      try {
        await refreshTokens();
        const newToken = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
        return request(path, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        });
      } catch {
        // Refresh token révoqué ou expiré — forcer la déconnexion locale
        await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
        throw Object.assign(new Error('Session expirée. Reconnectez-vous.'), { status: 401, code: 'SESSION_EXPIRED' });
      }
    }
    throw err;
  }
}

// ─── Token management ─────────────────────────────────────────────────────────

export async function refreshTokens() {
  const refreshToken = await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  if (!refreshToken) throw Object.assign(new Error('Session expirée'), { status: 401 });

  const data = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, data.accessToken],
    [KEYS.REFRESH_TOKEN, data.refreshToken],
  ]);

  return data;
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const token = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  return !!token;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function register({ fullName, email, password, role }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email: email.trim().toLowerCase(), password, role }),
  });
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, data.accessToken],
    [KEYS.REFRESH_TOKEN, data.refreshToken],
    [KEYS.USER, JSON.stringify(data.user)],
  ]);

  return data;
}

export async function logout() {
  // Read both tokens before any network call to avoid rotation leak from authRequest's auto-refresh
  const [accessToken, refreshToken] = await Promise.all([
    AsyncStorage.getItem(KEYS.ACCESS_TOKEN),
    AsyncStorage.getItem(KEYS.REFRESH_TOKEN),
  ]);
  try {
    await request('/auth/logout', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // best-effort — local logout always proceeds
  } finally {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
  }
}

export async function verifyEmail(token) {
  return request(`/auth/verify-email/${token}`);
}

export async function resendVerification({ email }) {
  return request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function forgotPassword({ email }) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function resetPassword({ token, newPassword }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

// ─── Profile API ──────────────────────────────────────────────────────────────

export async function getProfile() {
  const data = await authRequest('/profile');
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(data.user));
  return data;
}

export async function updateProfile({ fullName }) {
  const data = await authRequest('/profile', {
    method: 'PATCH',
    body: JSON.stringify({ fullName }),
  });
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(data.user));
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  return authRequest('/profile/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getSubscription() {
  return authRequest('/profile/subscription');
}
