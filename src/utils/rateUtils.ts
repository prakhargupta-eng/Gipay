import { Platform, Linking } from 'react-native';
import Config from 'react-native-config';
import { devDebugger } from '@utils/devDebugger';

/**
 * Utility to open the App Store or Play Store for rating
 */
export const rateApp = () => {
  const GOOGLE_PACKAGE_NAME = Config.GOOGLE_PACKAGE_NAME; 
  const APPLE_APP_ID = Config.APPLE_APP_ID;

  const url = Platform.select({
    ios: `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${APPLE_APP_ID}?action=write-review`,
    android: `market://details?id=${GOOGLE_PACKAGE_NAME}`,
  });

  if (url) {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback if the store app isn't installed (e.g. on some simulators)
          const webUrl = Platform.select({
            ios: `https://apps.apple.com/app/id${APPLE_APP_ID}`,
            android: `https://play.google.com/store/apps/details?id=${GOOGLE_PACKAGE_NAME}`,
          });
          if (webUrl) {
            Linking.openURL(webUrl);
          }
        }
      })
      .catch((err) => devDebugger.error('An error occurred opening the store:', err));
  }
};
