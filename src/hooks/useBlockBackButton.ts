import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

/**
 * Custom hook to block the Android hardware back button.
 * When the screen is focused, pressing the back button will do nothing.
 */
const useBlockBackButton = () => {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        // Return true to prevent default back behavior
        return true;
      });

      return () => subscription.remove();
    }, [])
  );
};

export default useBlockBackButton;

