import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { store, RootState } from './src/store';
import { setCredentials, logout, setLoading } from './src/store/slices/authSlice';
import { API_BASE_URL } from './src/config/api';
import TabNavigator from './src/navigation/TabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

function RootNavigation() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const creds = await Keychain.getGenericPassword();
        if (cancelled) return;
        if (creds?.password) {
          const res = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${creds.password}` },
          });
          if (!cancelled) {
            dispatch(setCredentials({ user: res.data, token: creds.password }));
          }
        } else {
          dispatch(setLoading(false));
        }
      } catch {
        await Keychain.resetGenericPassword();
        if (!cancelled) {
          dispatch(logout());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigation />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
  },
});

export default App;
