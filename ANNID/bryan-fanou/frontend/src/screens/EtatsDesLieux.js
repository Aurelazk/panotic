import { View, Text, StyleSheet } from 'react-native';

export default function EtatsDesLieux() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>États des lieux</Text>
      <Text style={styles.desc}>Bryan Fanou</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E94E3C' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 12, color: '#fff', marginTop: 16 },
});
