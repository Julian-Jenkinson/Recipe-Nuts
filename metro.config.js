// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('ttf');

config.resolver.unstable_enablePackageExports = true;

config.resolver.unstable_conditionNames = [
  'require',
  'react-native',
  'default',
];

module.exports = config;
