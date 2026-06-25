import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import ProfileNavigator from './ProfileNavigator';
import NotificationScreen from '../screens/Notifications/NotificationScreen';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Main" component={TabNavigator} />
          <RootStack.Screen name="Profile" component={ProfileNavigator} options={{ presentation: 'modal' }} />
          <RootStack.Screen name="Notifications" component={NotificationScreen} options={{ presentation: 'modal', headerShown: true, title: 'Notifications' }} />
        </RootStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
