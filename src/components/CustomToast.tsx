import React, { useImperativeHandle, useState, forwardRef } from 'react';
import { StyleSheet, View, Animated, Platform, StatusBar, Image, PanResponder } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@components/AppText';

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'notification';
  text1: string;
  text2?: string;
  duration?: number;
}

const CustomToast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ToastOptions | null>(null);
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(-100)).current;

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    show: (opts: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setOptions(opts);
      setVisible(true);

      const topOffset = Platform.OS === 'android'
        ? Math.max(insets.top, StatusBar.currentHeight || 0) + 10
        : insets.top + 10;

      Animated.spring(translateY, {
        toValue: topOffset,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, opts.duration || 3500);
    },
  }));

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20 || gestureState.vy < -0.5) {
          hide();
        }
      },
    })
  ).current;

  if (!visible || !options) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return { bg: colors.toastSuccess, title: 'Success' };
      case 'error': return { bg: colors.toastError, title: 'Error' };
      case 'notification': return { bg: colors.white, title: 'Info' };
      case 'info':
      default: return { bg: colors.toastInfo, title: 'Info' };
    }
  };

  const { bg: backgroundColor, title: defaultTitle } = getTypeStyles(options.type);
  const textColor = options.type === 'notification' ? colors.textDark : colors.white;

  return (
    <Animated.View 
      {...panResponder.panHandlers}
      style={[
        styles.container, 
        { backgroundColor, transform: [{ translateY }] },
        options.type === 'notification' && styles.notificationShadow
      ]}
    >
      {options.type === 'notification' && (
        <Image 
          source={require('@assets/images/common/bell.png')} 
          style={styles.bellIcon} 
        />
      )}
      <View style={styles.content}>
        <AppText style={[styles.title, { color: textColor }]}>{options.text1 || defaultTitle}</AppText>
        {options.text2 ? <AppText style={[styles.message, { color: textColor }]}>{options.text2}</AppText> : null}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: horizontalScale(20),
    right: horizontalScale(20),
    padding: horizontalScale(16),
    borderRadius: horizontalScale(12),
    zIndex: 9999,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  bellIcon: {
    width: horizontalScale(24),
    height: verticalScale(24),
    marginRight: horizontalScale(12),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  notificationShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    color: colors.white,
    fontFamily: Fonts.bold,
    fontSize: fontSize(14),
  },
  message: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    marginTop: verticalScale(2),
  },
});

export default CustomToast;
