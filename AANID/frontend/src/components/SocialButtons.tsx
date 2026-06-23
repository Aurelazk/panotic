import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SOCIALS = [
  { label: 'Google', icon: '🔵' },
  { label: 'Facebook', icon: '🔷' },
  { label: 'Twitter', icon: '🔵' },
];

export default function SocialButtons() {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OU</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        {SOCIALS.map((s) => (
          <TouchableOpacity key={s.label} style={styles.btn}>
            <Text style={styles.icon}>{s.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#E8ECF0' },
  or: { marginHorizontal: 12, fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  btn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E8ECF0',
  },
  icon: { fontSize: 22 },
});
