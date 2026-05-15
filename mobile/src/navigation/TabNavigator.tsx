import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

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
          let iconName = 'help-circle-outline';
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Carte') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Social') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Formation') iconName = focused ? 'school' : 'school-outline';
          else if (route.name === 'Publicité') iconName = focused ? 'megaphone' : 'megaphone-outline';
          else if (route.name === 'Signalement') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person-circle' : 'person-circle-outline';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: COLORS.white,
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Formation" component={FormationNavigator} />
      <Tab.Screen name="Publicité" component={PubliciteNavigator} />
      <Tab.Screen name="Signalement" component={ReportScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
