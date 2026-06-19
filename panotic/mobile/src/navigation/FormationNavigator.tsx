import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FormationScreen from '../screens/Formations/FormationScreen';
import FormationDetailScreen from '../screens/Formations/FormationDetailScreen';
import CoursePlayerScreen from '../screens/Formations/CoursePlayerScreen';

const Stack = createStackNavigator();

const FormationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#003366' },
        headerTintColor: '#fff',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="FormationList"
        component={FormationScreen}
        options={{ title: 'Catalogue des Formations' }}
      />
      <Stack.Screen
        name="FormationDetail"
        component={FormationDetailScreen}
        options={{ title: 'Détail de la Formation' }}
      />
      <Stack.Screen
        name="CoursePlayer"
        component={CoursePlayerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default FormationNavigator;
