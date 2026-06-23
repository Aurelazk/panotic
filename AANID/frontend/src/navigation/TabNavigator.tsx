import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faMapLocation, faComment, faBuildingColumns,
  faFlag, faBell, faCircleUser,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/theme';
import ProfileNavigator from './ProfileNavigator';

import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/Placeholder/SocialScreen';
import ReportScreen from '../screens/Placeholder/ReportScreen';
import FormationScreen from '../screens/Placeholder/FormationScreen';
import AdsScreen from '../screens/Placeholder/AdsScreen';
import CarteInteractive from '@aanid/rayan-frontend/src/screens/CarteInteractive';

const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<string, { icon: any; label: string }> = {
  Dashboard: { icon: faHouse, label: 'Accueil' },
  Carte: { icon: faMapLocation, label: 'Carte' },
  Social: { icon: faComment, label: 'Social' },
  Formation: { icon: faBuildingColumns, label: 'Formation' },
  Publicite: { icon: faFlag, label: 'Annonces' },
  Signalement: { icon: faBell, label: 'Signaler' },
  Profil: { icon: faCircleUser, label: 'Profil' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const config = TAB_CONFIG[routeName] || { icon: faHouse, label: '' };
  return (
    <View style={tabStyles.iconWrap}>
      <View style={[tabStyles.iconBg, focused && tabStyles.iconBgActive]}>
        <FontAwesomeIcon icon={config.icon} size={focused ? 20 : 18} color={focused ? '#FF6600' : '#6B7B8D'} />
      </View>
      <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>{config.label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 4, gap: 2 },
  iconBg: { width: 32, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  iconBgActive: { backgroundColor: 'rgba(255, 102, 0, 0.12)' },
  tabLabel: { fontSize: 9, fontWeight: '500', color: '#6B7B8D', letterSpacing: 0.2 },
  tabLabelActive: { color: '#FF6600', fontWeight: '700' },
});

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Carte" component={CarteInteractive} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Formation" component={FormationScreen} />
      <Tab.Screen name="Publicite" component={AdsScreen} />
      <Tab.Screen name="Signalement" component={ReportScreen} />
      <Tab.Screen name="Profil" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
