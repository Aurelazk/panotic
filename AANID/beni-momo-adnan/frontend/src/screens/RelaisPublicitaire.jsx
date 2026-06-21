import { View, Text, StyleSheet } from 'react-native';

export default function RelaisPublicitaire() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relais Publicitaire</Text>
      <Text style={styles.desc}>Béni & Momo Adnan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5A623' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 12, color: '#fff', marginTop: 16 },
});
