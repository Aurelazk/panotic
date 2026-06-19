import { View, Text, StyleSheet } from 'react-native';

export default function PostsReseaux() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts / Réseaux</Text>
      <Text style={styles.desc}>undef (chef de projet)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5A623' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 12, color: '#fff', marginTop: 16 },
});
