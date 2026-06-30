import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS, FONT_FAMILY } from '../constants/theme';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  icon?: string;
}

export default function CustomInput({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon }: Props) {
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !show}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Text style={styles.toggle}>{show ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, outlineStyle: 'none', outlineWidth: 0, fontFamily: FONT_FAMILY },
  toggle: { fontSize: 18, marginLeft: 8 },
});
