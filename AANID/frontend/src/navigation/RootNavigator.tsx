import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../constants/theme';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import ProfileNavigator from './ProfileNavigator';
import NotificationScreen from '../screens/Notifications/NotificationScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primaryDark },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontFamily: FONT_FAMILY },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
