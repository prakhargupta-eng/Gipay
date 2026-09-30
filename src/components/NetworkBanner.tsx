import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, LayoutAnimation } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@styles/colors';

const NetworkBanner = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [bannerType, setBannerType] = useState<'offline' | 'online'>('offline');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const isConnectedRef = useRef<boolean | null>(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paddingBottom = Platform.OS === 'ios' ? Math.max((insets.bottom || 0) - 15, 10) : Math.max((insets.bottom || 0), 2);
  const targetHeight = paddingBottom + 30;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyConnected = state.isConnected && state.isInternetReachable !== false;

      if (isConnectedRef.current === null) {
        isConnectedRef.current = currentlyConnected;
        setIsConnected(currentlyConnected);
        return;
      }

      if (currentlyConnected === isConnectedRef.current) return;

      isConnectedRef.current = currentlyConnected;
      setIsConnected(currentlyConnected);

      if (!currentlyConnected) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBannerType('offline');
        setIsVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBannerType('online');
        setIsVisible(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsVisible(false);
        }, 3000);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          height: targetHeight,
          backgroundColor: bannerType === 'offline' ? '#323232' : colors.green,
        },
      ]}
    >
      <View style={{ height: targetHeight, paddingBottom, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Text style={styles.text}>
          {bannerType === 'offline' ? 'No internet connection' : 'Back online'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 4,
  },
});

export default NetworkBanner;
