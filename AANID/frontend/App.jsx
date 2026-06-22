import React from 'react';
import { View, StatusBar } from 'react-native';
import CarteInteractive from '@aanid/rayan-frontend/src/screens/CarteInteractive';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E73BE" />
      <CarteInteractive />
    </View>
  );
}
