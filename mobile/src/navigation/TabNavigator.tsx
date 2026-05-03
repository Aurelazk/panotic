import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import MapScreen from '../screens/Map/MapScreen';
import ReportScreen from '../screens/Report/ReportScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SocialScreen from '../screens/Social/SocialScreen';
import FormationNavigator from './FormationNavigator';
import PubliciteNavigator from './PubliciteNavigator';
import NotificationScreen from '../screens/Notifications/NotificationScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import PricingScreen from '../screens/Profile/PricingScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Carte') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Social') iconName = focused ? 'newspaper' : 'newspaper-outline';
          else if (route.name === 'Formation') iconName = focused ? 'school' : 'school-outline';
          else if (route.name === 'Publicité') iconName = focused ? 'megaphone' : 'megaphone-outline';
          else if (route.name === 'Signalement') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6600',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#003366' },
        headerTintColor: '#fff',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Formation" component={FormationNavigator} />
      <Tab.Screen name="Publicité" component={PubliciteNavigator} />
      <Tab.Screen name="Signalement" component={ReportScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Admin" component={AdminDashboardScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Pricing" component={PricingScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
