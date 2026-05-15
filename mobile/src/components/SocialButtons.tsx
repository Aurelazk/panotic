import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/theme';

const SocialButtons = () => {
  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or Sign In With</Text>
        <View style={styles.line} />
      </View>
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="twitter" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="google" size={24} color="#EA4335" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="apple" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.socialBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default SocialButtons;
