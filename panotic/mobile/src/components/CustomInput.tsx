import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/theme';

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
  const [isFocused, setIsFocused] = React.useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -10],
  });
  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.placeholder, COLORS.secondary],
  });
  const iconColor = isFocused ? COLORS.secondary : COLORS.placeholder;
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.secondary],
  });
  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });
  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor,
          borderWidth,
          shadowOpacity,
        },
      ]}
    >
      <Icon name={icon} size={20} color={iconColor} style={styles.icon} />
      <View style={styles.inputWrapper}>
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              transform: [{ scale: labelScale }],
              color: labelColor,
            },
          ]}
        >
          {placeholder}
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {showPasswordToggle && (
        <TouchableOpacity onPress={onPasswordToggle} style={styles.eyeButton}>
          <Icon
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.placeholder}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    height: 58,
    marginBottom: 16,
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
    height: 30,
  },
  label: {
    position: 'absolute',
    left: 0,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },
});

export default CustomInput;
