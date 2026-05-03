import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AdvertiserDashboard from '../screens/Ads/AdvertiserDashboard';
import MarketplaceScreen from '../screens/Ads/MarketplaceScreen';
import CampaignDetailScreen from '../screens/Ads/CampaignDetailScreen';

const Stack = createNativeStackNavigator();

const PubliciteNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#003366' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="AdvertiserDashboard" 
        component={AdvertiserDashboard} 
        options={{ title: 'Espace Publicitaire' }}
      />
      <Stack.Screen 
        name="Marketplace" 
        component={MarketplaceScreen} 
        options={{ title: 'Réserver un Espace' }}
      />
      <Stack.Screen 
        name="CampaignDetail" 
        component={CampaignDetailScreen} 
        options={{ title: 'Nouvelle Campagne' }}
      />
    </Stack.Navigator>
  );
};

export default PubliciteNavigator;
