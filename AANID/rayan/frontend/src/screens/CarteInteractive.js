import { View, Text, StyleSheet } from 'react-native';

export default function CarteInteractive() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carte Interactive</Text>
      <Text style={styles.desc}>Rayann</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3BB273' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 12, color: '#fff', marginTop: 16 },
});
