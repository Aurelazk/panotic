import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { COLORS } from '../constants/theme';

const twitterSource = { uri: new URL('../assets/social/twitter.png', import.meta.url).href };
const facebookSource = { uri: new URL('../assets/social/facebook.jpeg', import.meta.url).href };
const googleSource = { uri: new URL('../assets/social/google.png', import.meta.url).href };

const SocialButtons = () => {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.button} activeOpacity={0.7}>
          <Image source={twitterSource} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} activeOpacity={0.7}>
          <Image source={facebookSource} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} activeOpacity={0.7}>
          <Image source={googleSource} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default SocialButtons;
