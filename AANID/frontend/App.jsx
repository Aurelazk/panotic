import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Formations, FormationDetail, CoursePlayer, MesFormations, PaiementMobile } from '@aanid/beni-momo-adnan-frontend';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1E73BE" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Formations" component={Formations} />
        <Stack.Screen name="FormationDetail" component={FormationDetail} />
        <Stack.Screen name="CoursePlayer" component={CoursePlayer} />
        <Stack.Screen name="MesFormations" component={MesFormations} />
        <Stack.Screen name="PaiementMobile" component={PaiementMobile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
