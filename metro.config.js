const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure public folder is watched for changes
config.watchFolders = config.watchFolders || [];
config.watchFolders.push(__dirname + '/public');

module.exports = config;
