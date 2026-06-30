import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faMapLocation, faComment, faBuildingColumns, faBell,
} from '@fortawesome/free-solid-svg-icons';
import FormationNavigator from './FormationNavigator';
import ProfileNavigator from './ProfileNavigator';
import NotificationScreen from '../screens/Notifications/NotificationScreen';
import TopNavbar from '../components/TopNavbar';

import Villes from '@aanid/beni-momo-adnan-frontend/src/screens/Villes';
import SocialScreen from '../screens/Placeholder/SocialScreen';
import EtatsDesLieux from '@aanid/bryan-fanou-frontend/src/screens/EtatsDesLieux';
import CarteInteractive from '@aanid/rayan-frontend/src/screens/CarteInteractive';

const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<string, { icon: any; label: string }> = {
  Dashboard: { icon: faHouse, label: 'Accueil' },
  Carte: { icon: faMapLocation, label: 'Carte' },
  EtatsDesLieux: { icon: faBell, label: 'États des Lieux' },
  Formation: { icon: faBuildingColumns, label: 'Formation' },
  Social: { icon: faComment, label: 'Social' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const config = TAB_CONFIG[routeName] || { icon: faHouse, label: '' };
  return (
    <View style={tabStyles.iconWrap}>
      <View style={[tabStyles.iconBg, focused && tabStyles.iconBgActive]}>
        <FontAwesomeIcon icon={config.icon} size={focused ? 24 : 22} color={focused ? '#F5A623' : '#9CA3AF'} />
      </View>
      <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>{config.label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  iconBg: { width: '100%', height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  iconBgActive: { backgroundColor: 'rgba(245, 166, 35, 0.15)' },
  tabLabel: { fontSize: 10, fontWeight: '500', color: '#9CA3AF', letterSpacing: 0.2, fontFamily: 'CenturyGothic' },
  tabLabelActive: { color: '#F5A623', fontWeight: '700' },
});

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarShowLabel: false,
        tabBarItemStyle: { flex: 1 },
        header: () => <TopNavbar />,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: '#212121',
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
      })}
    >
      <Tab.Screen name="Dashboard" component={Villes} />
      <Tab.Screen name="Carte" component={CarteInteractive} />
      <Tab.Screen name="EtatsDesLieux" component={EtatsDesLieux} />
      <Tab.Screen name="Formation" component={FormationNavigator} />
      <Tab.Screen name="Social" component={SocialScreen} />
    </Tab.Navigator>
  );
}
