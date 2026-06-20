import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Enveloppe l'application et fournit l'état d'authentification global.
 * Restaure la session depuis AsyncStorage au démarrage.
 *
 * Usage dans l'application principale :
 *
 *   import { AuthProvider } from '@aanid/w-d-frontend';
 *
 *   export default function App() {
 *     return (
 *       <AuthProvider>
 *         <NavigationContainer>...</NavigationContainer>
 *       </AuthProvider>
 *     );
 *   }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getStoredUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        onLogin: handleLogin,
        onLogout: handleLogout,
        onProfileUpdate: handleProfileUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification.
 * Doit être utilisé à l'intérieur d'un AuthProvider.
 *
 * @returns {{
 *   user: object | null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   onLogin: (user: object) => void,
 *   onLogout: () => Promise<void>,
 *   onProfileUpdate: (user: object) => void,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}
