import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import * as Keychain from 'react-native-keychain';
import { store, RootState } from './src/store';
import { setCredentials, logout } from './src/store/slices/authSlice';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';
import { api } from './src/api/client';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials && credentials.password) {
          // Attempt to fetch current user to verify token
          const { data } = await api.get('/users/me');
          dispatch(setCredentials({ user: data, token: credentials.password }));
        }
      } catch (error) {
        console.log('Auth initialization failed:', error);
        await Keychain.resetGenericPassword();
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <AppInitializer>
          <RootNavigator />
        </AppInitializer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
});

export default App;

