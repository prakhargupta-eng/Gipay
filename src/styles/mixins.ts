import { Platform, Dimensions, StatusBar } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const FULL_SCREEN_HEIGHT = Dimensions.get('screen').height;

const frame = initialWindowMetrics?.frame ?? { height: SCREEN_HEIGHT };

export const BOTTOM_NAV_BAR_HEIGHT =
  frame.height - SCREEN_HEIGHT - (StatusBar.currentHeight || 0);

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;

export const horizontalScale = (size: number) =>
  (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const verticalScale = (size: number) =>
  (SCREEN_HEIGHT / guidelineBaseHeight) * size;

export const fontSize = (size: number, factor: number = 0.5) =>
  size + (horizontalScale(size) - size) * factor;
