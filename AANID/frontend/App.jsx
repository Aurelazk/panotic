import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@aanid/w-d-frontend';

import Villes from '@aanid/beni-momo-adnan-frontend/src/screens/Villes';
import Formations from '@aanid/beni-momo-adnan-frontend/src/screens/Formations';
import RelaisPublicitaire from '@aanid/beni-momo-adnan-frontend/src/screens/RelaisPublicitaire';
import EtatsDesLieux from '@aanid/bryan-fanou-frontend/src/screens/EtatsDesLieux';
import CarteInteractive from '@aanid/rayan-frontend/src/screens/CarteInteractive';
import Auth from '@aanid/w-d-frontend/src/screens/Auth';
import Profil from '@aanid/w-d-frontend/src/screens/Profil';
import PostsReseaux from '@aanid/undef-frontend/src/screens/PostsReseaux';
import Consultation from '@aanid/undef-frontend/src/screens/Consultation';

const Tab = createBottomTabNavigator();

const AANID_COLORS = {
  blue: '#1E73BE',
  orange: '#F5A623',
  green: '#3BB273',
  red: '#E94E3C',
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setFontsLoaded(true), 300);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={AANID_COLORS.blue} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: AANID_COLORS.blue,
              headerStyle: { backgroundColor: AANID_COLORS.blue },
              headerTintColor: '#fff',
            }}
          >
            <Tab.Screen name="Villes" component={Villes} />
            <Tab.Screen name="Relais" component={RelaisPublicitaire} />
            <Tab.Screen name="Formations" component={Formations} />
            <Tab.Screen name="États" component={EtatsDesLieux} />
            <Tab.Screen name="Posts" component={PostsReseaux} />
            <Tab.Screen name="Carte" component={CarteInteractive} />
            <Tab.Screen name="Consultation" component={Consultation} />
            <Tab.Screen name="Auth" component={Auth} />
            <Tab.Screen name="Profil" component={Profil} />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={AANID_COLORS.blue} />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
