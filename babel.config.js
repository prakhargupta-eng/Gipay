module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
        root: ['.'],
        alias: {
          '@config': './src/config',
          '@api': './src/api',
          '@assets': './src/assets',
          '@common': './src/common',
          '@components': './src/components',
          '@containers': './src/containers',
          '@navigation': './src/navigation',
          '@store': './src/store',
          '@styles': './src/styles',
          '@utils': './src/utils',
          '@screens': './src/screens',
          '@localization': './src/localization',
          '@hooks': './src/hooks',
          '@context': './src/context',
          '@colors': './src/styles/colors',
          '@constants': './src/constants',
          '@strings': './src/constants/strings',
        },
      },
    ],
    // React Native Worklets plugin must be added here
    ['react-native-worklets/plugin', {}, 'react-native-worklets-plugin'],
    
    // ✅ MUST BE LAST
    ['react-native-reanimated/plugin', {}, 'react-native-reanimated-plugin'],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};