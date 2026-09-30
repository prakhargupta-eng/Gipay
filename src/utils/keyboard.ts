import { Keyboard } from 'react-native';

/**
 * Dismisses the keyboard first, then executes the callback after a short delay.
 * This prevents visual glitches when navigating while the keyboard is open.
 */
export const dismissKeyboardAndThen = (callback: () => void) => {
  Keyboard.dismiss();
  // Small delay to let keyboard animation finish before navigating
  setTimeout(callback, 200);
};
