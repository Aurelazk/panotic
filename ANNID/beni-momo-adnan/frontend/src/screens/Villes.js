import { View, Text, StyleSheet } from 'react-native';

export default function Villes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Villes</Text>
      <Text style={styles.subtitle}>Hub Central</Text>
      <Text style={styles.desc}>Béni & Momo Adnan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E73BE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 8 },
  desc: { fontSize: 12, color: '#fff', marginTop: 16 },
});
