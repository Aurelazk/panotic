import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../../../rayann/frontend/src/constants/colors';

export default function AdsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={styles.empty}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={styles.emptyTitle}>Espace Publicitaire</Text>
            <Text style={styles.emptyDesc}>Gérez vos campagnes et réservez des espaces.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyContent: { alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.4 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center' },
});
