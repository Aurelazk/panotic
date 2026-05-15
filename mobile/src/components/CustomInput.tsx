import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES } from '../constants/theme';

interface CustomInputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  showPasswordToggle,
  isPasswordVisible,
  onPasswordToggle,
}) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={20} color={COLORS.placeholder} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {showPasswordToggle && (
        <TouchableOpacity onPress={onPasswordToggle}>
          <Icon
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.placeholder}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    padding: 0,
  },
});

export default CustomInput;
