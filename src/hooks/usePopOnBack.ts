import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Custom hook to intercept the default back action (hardware back button or iOS swipe back)
 * and pop a specific number of screens instead.
 *
 * @param popCount The number of screens to pop (default: 1)
 */
const usePopOnBack = (popCount: number = 1) => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (popCount <= 1) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Check if it's the standard GO_BACK action
      if (e.data.action.type === 'GO_BACK') {
        // Prevent default behavior
        e.preventDefault();
        // Pop the desired number of screens
        navigation.pop(popCount);
      }
    });

    return unsubscribe;
  }, [navigation, popCount]);
};

export default usePopOnBack;
