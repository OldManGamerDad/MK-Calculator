const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Node.js polyfills for web
config.resolver.alias = {
  ...config.resolver.alias,
  os: false,
  tty: false,
  fs: false,
  path: false,
};

module.exports = config;