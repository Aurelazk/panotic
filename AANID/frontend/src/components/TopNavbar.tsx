import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faBell } from '@fortawesome/free-solid-svg-icons';

export default function TopNavbar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.sideBtn}>
        <FontAwesomeIcon icon={faCircleUser} size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <Image source={require('../../assets/aanid_logo.jpeg')} style={styles.logo} resizeMode="contain" />

      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.sideBtn}>
        <FontAwesomeIcon icon={faBell} size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E73BE',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  sideBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 32,
  },
});
