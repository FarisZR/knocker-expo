const { withDangerousMod, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add PWA support
 */
const withPWA = (config) => {
  // Add web-specific configuration
  config = withDangerousMod(config, [
    'web',
    async (config) => {
      // Ensure we have web config
      if (!config.modResults) {
        config.modResults = {};
      }
      return config;
    },
  ]);

  return config;
};

module.exports = withPWA;
