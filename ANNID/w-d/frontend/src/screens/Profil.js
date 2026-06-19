import { View, Text, StyleSheet } from 'react-native';

export default function Profil() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.desc}>W-D</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E73BE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 12, color: '#fff', marginTop: 16 },
});
