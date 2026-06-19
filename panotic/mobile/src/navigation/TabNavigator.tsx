import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/Home/HomeScreen';
import MapScreen from '../screens/Map/MapScreen';
import ReportScreen from '../screens/Report/ReportScreen';
import ProfileNavigator from './ProfileNavigator';
import SocialScreen from '../screens/Social/SocialScreen';
import FormationNavigator from './FormationNavigator';
import PubliciteNavigator from './PubliciteNavigator';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, label }: { name: string; focused: boolean; label: string }) => (
  <View style={tabStyles.iconWrap}>
    <View style={[tabStyles.iconBg, focused && tabStyles.iconBgActive]}>
      <Icon name={name} size={focused ? 24 : 22} color={focused ? COLORS.secondary : '#6B7B8D'} />
    </View>
    <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 2,
  },
  iconBg: {
    width: 32,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBgActive: {
    backgroundColor: 'rgba(255, 102, 0, 0.12)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6B7B8D',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
});

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName = 'help-circle-outline';
          let label = '';
          if (route.name === 'Dashboard') { iconName = focused ? 'grid' : 'grid-outline'; label = 'Accueil'; }
          else if (route.name === 'Carte') { iconName = focused ? 'map' : 'map-outline'; label = 'Carte'; }
          else if (route.name === 'Social') { iconName = focused ? 'chatbubbles' : 'chatbubbles-outline'; label = 'Social'; }
          else if (route.name === 'Formation') { iconName = focused ? 'school' : 'school-outline'; label = 'Formation'; }
          else if (route.name === 'Publicité') { iconName = focused ? 'megaphone' : 'megaphone-outline'; label = 'Annonces'; }
          else if (route.name === 'Signalement') { iconName = focused ? 'add-circle' : 'add-circle-outline'; label = 'Signaler'; }
          else if (route.name === 'Profil') { iconName = focused ? 'person-circle' : 'person-circle-outline'; label = 'Profil'; }
          return <TabIcon name={iconName} focused={focused} label={label} />;
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: '#6B7B8D',
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: '#0A1628',
          height: 62,
          paddingBottom: 6,
          paddingTop: 4,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          elevation: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
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
      <Tab.Screen name="Profil" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
