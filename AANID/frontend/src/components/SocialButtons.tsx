import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { COLORS, FONT_FAMILY } from '../constants/theme';

const SOCIALS = [
  { label: 'Google', icon: faGoogle, color: '#DB4437' },
  { label: 'Facebook', icon: faFacebookF, color: '#1877F2' },
  { label: 'X', icon: faXTwitter, color: '#000' },
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
            <FontAwesomeIcon icon={s.icon} size={22} color={s.color} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  or: { marginHorizontal: 12, fontSize: 12, color: COLORS.textTertiary, fontWeight: '600', fontFamily: FONT_FAMILY },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  btn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

});
