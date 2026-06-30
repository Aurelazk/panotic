import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faMapLocation, faComment, faBuildingColumns, faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../constants/theme';
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
  EtatsDesLieux: { icon: faClipboardList, label: 'États des Lieux' },
  Formation: { icon: faBuildingColumns, label: 'Formation' },
  Social: { icon: faComment, label: 'Social' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const config = TAB_CONFIG[routeName] || { icon: faHouse, label: '' };
  return (
    <View style={[tabStyles.iconBg, focused && tabStyles.iconBgActive]}>
      <FontAwesomeIcon icon={config.icon} style={{ fontSize: 19 }} color={focused ? COLORS.tabActive : COLORS.tabInactive} />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconBg: { paddingHorizontal: 16, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  iconBgActive: { backgroundColor: COLORS.chipBg },
});

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarLabel: TAB_CONFIG[route.name]?.label ?? '',
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: { fontSize: 9.5, fontFamily: FONT_FAMILY, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { flex: 1, paddingTop: 2 },
        header: () => <TopNavbar />,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.tabBg,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 14,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
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
