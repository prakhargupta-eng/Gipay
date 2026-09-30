import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  StatusBarStyle,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface StatusBarBlurViewProps {
  /**
   * Status bar content style ('light-content' | 'dark-content' | 'default').
   * Default: 'light-content'
   */
  barStyle?: StatusBarStyle;
  /**
   * Whether the status bar is translucent.
   * Default: true
   */
  translucent?: boolean;
  /**
   * Background color passed to StatusBar (Android).
   * Default: 'transparent'
   */
  backgroundColor?: string;
  /**
   * Blur style for BlurView.
   * Default: 'prominent'
   */
  blurType?:
  | 'prominent'
  | 'regular'
  | 'dark'
  | 'light'
  | 'xlight'
  | 'extraDark'
  | 'thinMaterial'
  | 'ultraThinMaterial'
  | 'material'
  | 'thickMaterial'
  | 'chromeMaterial'
  | 'thinMaterialDark'
  | 'ultraThinMaterialDark'
  | 'materialDark'
  | 'thickMaterialDark'
  | 'chromeMaterialDark'
  | 'thinMaterialLight'
  | 'ultraThinMaterialLight'
  | 'materialLight'
  | 'thickMaterialLight'
  | 'chromeMaterialLight';
  /**
   * Blur intensity (default: 15).
   */
  blurAmount?: number;
  /**
   * Percentage of background view that shows through the blur (0.0 to 1.0).
   * Default: 0.2 (20% background shows through, 80% blur).
   */
  backgroundVisibility?: number;
  /**
   * Whether to show the blur effect. When false, only the default StatusBar is active.
   * Default: true
   */
  showBlur?: boolean;
  /**
   * Custom style for the status bar container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional children inside the status bar view.
   */
  children?: React.ReactNode;
}

export default function StatusBarBlurView({
  barStyle = 'light-content',
  translucent = true,
  backgroundColor = 'transparent',
  blurType = 'prominent',
  blurAmount = 15,
  backgroundVisibility = 0.3,
  showBlur = true,
  style,
  children,
}: Readonly<StatusBarBlurViewProps>) {
  const insets = useSafeAreaInsets();

  // Calculate safe status bar height across iOS & Android devices
  const defaultStatusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;
  const statusBarHeight =
    insets.top > 0 ? insets.top : defaultStatusBarHeight;

  const isDark =
    barStyle === 'light-content' ||
    blurType === 'dark' ||
    blurType === 'extraDark' ||
    (typeof blurType === 'string' && blurType.toLowerCase().includes('dark'));

  // Calculate opacity so ~20% of the background view shows through
  const blurOpacity = 1 - Math.max(0, Math.min(1, backgroundVisibility));

  // Android BlurView only supports 'dark' | 'light' | 'xlight'
  let androidBlurType: 'dark' | 'light' | 'xlight' = 'light';
  if (blurType === 'light' || blurType === 'xlight') {
    androidBlurType = blurType;
  } else if (isDark) {
    androidBlurType = 'dark';
  }

  // Android blurRadius max is 25
  const androidBlurRadius = Math.min(25, Math.max(1, Math.round(blurAmount * 0.8)));

  // Translucent overlay color for both iOS and Android to let the background shine through
  const overlayColor = isDark
    ? 'rgba(10, 15, 30, 0.20)'
    : 'rgba(255, 255, 255, 0.20)';

  return (
    <>
      <StatusBar
        translucent={translucent}
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />
      {showBlur && (
        <View
          pointerEvents="none"
          style={[styles.statusBarBlur, { height: statusBarHeight }, style]}
        >
        <BlurView
          style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}
          blurType={Platform.OS === 'android' ? androidBlurType : blurType}
          blurAmount={blurAmount}
          blurRadius={androidBlurRadius}
          overlayColor={overlayColor}
        />
        {Platform.OS === 'ios' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: overlayColor },
            ]}
          />
        )}
        {children}
      </View>
      )}
    </>
  );
}

// Keep alias for backwards compatibility if needed
export { StatusBarBlurView as GlassStatusBarScreen };

const styles = StyleSheet.create({
  statusBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    overflow: 'hidden',
  },
});
