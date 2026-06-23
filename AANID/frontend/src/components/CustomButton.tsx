import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function CustomButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[styles.text, variant === 'outline' ? styles.outlineText : styles.primaryText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%', marginVertical: 8 },
  primary: { backgroundColor: '#FF6600' },
  secondary: { backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '700' },
  primaryText: { color: '#fff' },
  outlineText: { color: COLORS.primary },
});
