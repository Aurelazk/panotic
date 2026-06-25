import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faBell } from '@fortawesome/free-solid-svg-icons';

export default function TopNavbar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.sideBtn}>
        <FontAwesomeIcon icon={faCircleUser} size={22} color="#212121" />
      </TouchableOpacity>

      <Text style={styles.logoText}>aanid</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.sideBtn}>
        <FontAwesomeIcon icon={faBell} size={22} color="#212121" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F1E5',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  sideBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 26,
    fontStyle: 'italic',
    fontFamily: 'CenturyGothic',
    color: '#212121',
  },
});
