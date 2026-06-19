import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, StyleSheet, Platform, Dimensions } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import * as Keychain from 'react-native-keychain';
import { store, RootState } from './src/store';
import { setCredentials, logout } from './src/store/slices/authSlice';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
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
          const { data } = await api.get('/auth/me');
          const user = data.user || data;
          dispatch(setCredentials({ user, token: credentials.password }));
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
  const [screenWidth] = useState(Dimensions.get('window').width);
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && screenWidth > 600;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ErrorBoundary>
          <AppInitializer>
            {isDesktop ? (
              <View style={styles.desktopWrap}>
                <View style={styles.mobileFrame}>
                  <RootNavigator />
                </View>
              </View>
            ) : (
              <RootNavigator />
            )}
          </AppInitializer>
        </ErrorBoundary>
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
  desktopWrap: {
    flex: 1,
    backgroundColor: '#0A1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileFrame: {
    width: 393,
    height: '100%',
    maxHeight: 852,
    backgroundColor: '#F2F5F9',
    overflow: 'hidden',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 30,
  },
});

export default App;
