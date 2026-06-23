import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../constants/theme';

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
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  icon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A2A3A', outlineStyle: 'none', outlineWidth: 0 },
  toggle: { fontSize: 18, marginLeft: 8 },
});
