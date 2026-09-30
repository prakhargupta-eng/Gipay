import { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import strings from '@constants/strings';

export type PinMode = 'create' | 'confirm' | 'enter' | 'setup' | 'change';

export interface ChangePinData {
  currentPin: string;
  newPin: string;
  encryptedCurrentPin: string;
  encryptedNewPin: string;
}

export const MODE_TITLES: Record<'create' | 'confirm' | 'enter', string> = {
  create: strings.transactionPin.createTitle,
  confirm: strings.transactionPin.confirmTitle,
  enter: strings.transactionPin.enterTitle,
};

export interface PinInputRef {
  /** Clear the currently entered PIN */
  clear: () => void;
  /** Trigger a horizontal shake animation (e.g. on invalid PIN) */
  shake: () => void;
  /** Get the current PIN string */
  getValue: () => string;
  /** Get the RSA-encrypted PIN string */
  getEncryptedValue: () => string;
  /** Programmatically set the PIN value */
  setValue: (val: string) => void;
  /** Reshuffle the keypad numbers randomly */
  reshuffle: () => void;
}

export interface PinInputProps {
  /**
   * If provided, PinInput wraps itself in a full-screen Modal with TopHeader and Back Button.
   * If undefined, renders inline.
   */
  visible?: boolean;
  /** Callback fired when the modal back button or hardware back is pressed */
  onClose?: () => void;
  /** Whether to display the top back button in modal mode. Defaults to true */
  showBackButton?: boolean;
  /** Modal animation type. Defaults to 'slide' */
  animationType?: 'slide' | 'fade' | 'none';

  /**
   * Predefined mode to set title and behavior:
   * 1) 'create' -> "Create your transaction PIN"
   * 2) 'confirm' -> "Confirm your transaction PIN"
   * 3) 'enter' -> "Enter your transaction PIN"
   * 4) 'setup' -> 2-step setup: first "Create your transaction PIN", then "Confirm your transaction PIN", checks match.
   * 5) 'change' -> 3-step change PIN flow.
   */
  mode?: PinMode;
  /** Custom title text. When provided, overrides the mode title from outside */
  title?: string;
  /** Title displayed in the modal's TopHeader bar */
  headerTitle?: string;
  /** Total number of PIN digits. Defaults to 4 */
  length?: number;
  /** Controlled value of the PIN */
  value?: string;
  /** Callback fired whenever the PIN string changes */
  onChange?: (pin: string) => void;
  /** Callback fired when all digits (e.g. 4 digits) are entered with plain PIN and RSA encrypted PIN */
  onComplete?: (pin: string, encryptedPin?: string) => void;
  /** Optional callback specifically returning an object with { pin, encryptedPin } */
  onCompleteEncrypted?: (result: { pin: string; encryptedPin: string }) => void;
  /** Callback fired when mode="change" successfully confirms the new PIN */
  onChangePinComplete?: (data: ChangePinData) => void;
  /** Error message shown when new PIN and confirm PIN do not match in setup mode */
  pinMismatchError?: string;
  /** Error message shown when new PIN is the same as current PIN in change mode */
  samePinError?: string;
  /** Callback fired when step changes in setup mode (step 1 or 2) */
  onStepChange?: (step: 1 | 2 | 3) => void;
  /**
   * Boolean to manage whether keypad numbers appear in standard order or random order:
   * - true (default): Random / scrambled order
   * - false: Standard sequential order (1, 2, 3, 4, 5, 6, 7, 8, 9, 0)
   */
  isRandomOrder?: boolean;
  /** Alias for isRandomOrder */
  randomOrder?: boolean;
  /** Alias for isRandomOrder */
  isRandom?: boolean;
  /** Whether the on-screen numbers should be randomized every time the UI appears. Defaults to true */
  randomizeKeypad?: boolean;
  /**
   * If true, numbers appear in standard arranged order (1, 2, 3... 0).
   * If false, numbers appear in random/scrambled order.
   */
  isshownumberArrangeOrder?: boolean;
  /** Show lock droplet badge at the top. Defaults to true */
  showLockIcon?: boolean;
  /** Footer security note at the bottom. Defaults to "This keeps your account secure." */
  footerText?: string;
  /** Error message or boolean flag indicating error state */
  error?: string | boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether an operation is loading (disables keypad, shows indicator) */
  loading?: boolean;
  /** Automatically trigger shake animation when error prop changes to truthy */
  autoShakeOnError?: boolean;

  // Custom styling props
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  dotsContainerStyle?: StyleProp<ViewStyle>;
  dotStyle?: StyleProp<ImageStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
  keypadContainerStyle?: StyleProp<ViewStyle>;
  keyButtonStyle?: StyleProp<ViewStyle>;
  keyTextStyle?: StyleProp<TextStyle>;
  footerTextStyle?: StyleProp<TextStyle>;
}
