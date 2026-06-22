const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = {};

module.exports = withNativewind(mergeConfig(getDefaultConfig(__dirname), config));
