import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../rayann/frontend/src/constants/colors';

export default function DefaultScreen({ title, emoji }: { title: string; emoji?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji || '🚧'}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>Module en cours de développement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 },
  emoji: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center' },
});
