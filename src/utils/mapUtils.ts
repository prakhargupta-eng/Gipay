import { Linking, Platform, Alert, ActionSheetIOS } from 'react-native';
import { devDebugger } from '@utils/devDebugger';

/**
 * Helper to open external maps with a given latitude, longitude, and optional address or label.
 * Detects installed map apps (Apple Maps, Google Maps, Waze) and asks the user which to open.
 */
export const openExternalMap = async (
  latitude?: number | string,
  longitude?: number | string,
  labelOrAddress?: string
) => {
  const label = encodeURIComponent(labelOrAddress || 'Location');
  const query = labelOrAddress ? encodeURIComponent(labelOrAddress) : '';
  const latLng = latitude && longitude ? `${latitude},${longitude}` : '';

  // URL formats for iOS deep linking
  const urls = {
    apple: latLng ? `maps:0,0?q=${label}&ll=${latLng}` : `maps:0,0?q=${query}`,
    google: latLng ? `comgooglemaps://?q=${latLng}(${label})` : `comgooglemaps://?q=${query}`,
    waze: latLng ? `waze://?ll=${latLng}&navigate=yes` : `waze://?q=${query}&navigate=yes`,
  };

  // Google Maps url for Android
  const androidGoogleUrl = latLng ? `geo:0,0?q=${latLng}(${label})` : `geo:0,0?q=${query}`;

  const availableApps: { name: string; open: () => void }[] = [];

  if (Platform.OS === 'ios') {
    // Apple Maps is always available
    availableApps.push({
      name: 'Apple Maps',
      open: () => Linking.openURL(urls.apple).catch(err => devDebugger.error('Error opening Apple Maps:', err)),
    });

    // Check Google Maps
    try {
      const hasGoogleMaps = await Linking.canOpenURL('comgooglemaps://');
      if (hasGoogleMaps) {
        availableApps.push({
          name: 'Google Maps',
          open: () => Linking.openURL(urls.google).catch(err => devDebugger.error('Error opening Google Maps:', err)),
        });
      }
    } catch (e) {
      devDebugger.warn('Failed to check Google Maps availability:', e);
    }

    // Check Waze
    try {
      const hasWaze = await Linking.canOpenURL('waze://');
      if (hasWaze) {
        availableApps.push({
          name: 'Waze',
          open: () => Linking.openURL(urls.waze).catch(err => devDebugger.error('Error opening Waze:', err)),
        });
      }
    } catch (e) {
      devDebugger.warn('Failed to check Waze availability:', e);
    }
  } else {
    // Android
    availableApps.push({
      name: 'Google Maps',
      open: () => Linking.openURL(androidGoogleUrl).catch(err => devDebugger.error('Error opening Google Maps:', err)),
    });

    // Check Waze
    try {
      const hasWaze = await Linking.canOpenURL('waze://');
      if (hasWaze) {
        availableApps.push({
          name: 'Waze',
          open: () => Linking.openURL(urls.waze).catch(err => devDebugger.error('Error opening Waze:', err)),
        });
      }
    } catch (e) {
      devDebugger.warn('Failed to check Waze availability:', e);
    }
  }

  // If only one app is available, open it directly
  if (availableApps.length === 1) {
    availableApps[0].open();
    return;
  }

  // Show selection dialog
  if (Platform.OS === 'ios') {
    const options = [...availableApps.map(app => app.name), 'Cancel'];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Open Location In',
        message: 'Select a map application:',
      },
      buttonIndex => {
        if (buttonIndex !== options.length - 1) {
          availableApps[buttonIndex].open();
        }
      }
    );
  } else {
    Alert.alert(
      'Open Location In',
      'Select a map application:',
      [
        ...availableApps.map(app => ({
          text: app.name,
          onPress: app.open,
        })),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ],
      { cancelable: true }
    );
  }
};

/**
 * Converts a given radius from various measurement units to meters.
 */
export const convertToMeters = (
  radius: number,
  unit: string
): number => {
  switch (unit.toLowerCase()) {
    case 'meters':
    case 'meter':
    case 'm':
      return radius;
    case 'kilometers':
    case 'kilometer':
    case 'km':
      return radius * 1000;
    case 'miles':
    case 'mile':
    case 'mi':
      return radius * 1609.344;
    case 'feet':
    case 'foot':
    case 'ft':
      return radius * 0.3048;
    default:
      throw new Error(`Unsupported measurement unit: ${unit}`);
  }
};
