import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { StatusBar, View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <RootNavigator />
    </Provider>
  );
}
