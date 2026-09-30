import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Animated,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import colors from '@styles/colors';
import { verticalScale } from '@styles/mixins';
import AppText from '@components/AppText';
import CustomToast from '@components/CustomToast';
import TopHeader from '@components/TopHeader';
import { Toast } from '@utils/ToastManager';
import { encryptPin, encryptWithRsa } from '@utils/cryptoUtils';
import strings from '@constants/strings';

import styles from './styles';
import {
  PinInputProps,
  PinInputRef,
  PinMode,
  ChangePinData,
  MODE_TITLES,
} from './types';
import PinDots from './components/PinDots';
import PinKeypad from './components/PinKeypad';

export { encryptPin, encryptWithRsa };
export type { PinMode, ChangePinData, PinInputRef, PinInputProps };

const lockIconImg = require('@assets/images/common/LockShield.png');

/** Helper function to shuffle digits [0..9] in random order */
const generateDigits = (randomize: boolean): string[] => {
  const baseDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  if (!randomize) return baseDigits;

  const shuffled = [...baseDigits];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PinInput = forwardRef<PinInputRef, PinInputProps>(
  (
    {
      visible,
      onClose,
      showBackButton = true,
      animationType = 'slide',
      mode,
      title,
      headerTitle,
      length = 4,
      value: controlledValue,
      onChange,
      onComplete,
      onCompleteEncrypted,
      onChangePinComplete,
      pinMismatchError,
      samePinError,
      onStepChange,
      isRandomOrder,
      randomOrder,
      isRandom: isRandomProp,
      randomizeKeypad,
      isshownumberArrangeOrder,
      showLockIcon = true,
      // footerText = strings.transactionPin.securityFooter,
      error,
      disabled = false,
      loading = false,
      autoShakeOnError = true,
      containerStyle,
      titleStyle,
      dotsContainerStyle,
      dotStyle,
      errorTextStyle,
      keypadContainerStyle,
      keyButtonStyle,
      keyTextStyle,
      // footerTextStyle,
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalPin, setInternalPin] = useState('');
    const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1);
    const [firstPin, setFirstPin] = useState('');
    const [currentPinVal, setCurrentPinVal] = useState('');
    const [setupError, setSetupError] = useState<string | null>(null);
    const [isErrorActive, setIsErrorActive] = useState(false);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMismatchResetting = useRef(false);
    const isTransitioningRef = useRef(false);
    const modalToastRef = useRef<any>(null);

    const setModalToastRef = useCallback((node: any) => {
      modalToastRef.current = node;
      if (node) {
        Toast.pushInstance(node);
      }
    }, []);

    // Boolean to manage whether keypad is ordered or random:
    // true (default): random/scrambled order
    // false: standard sequential order (1, 2, 3... 0)
    const isRandom = useMemo(() => {
      if (isRandomOrder !== undefined) return isRandomOrder;
      if (randomOrder !== undefined) return randomOrder;
      if (isRandomProp !== undefined) return isRandomProp;
      if (isshownumberArrangeOrder !== undefined) return !isshownumberArrangeOrder;
      if (randomizeKeypad !== undefined) return randomizeKeypad;
      return true;
    }, [isRandomOrder, randomOrder, isRandomProp, isshownumberArrangeOrder, randomizeKeypad]);

    // Keypad digits
    const [digits, setDigits] = useState<string[]>(() => generateDigits(isRandom));

    useEffect(() => {
      if (visible) {
        if (!isControlled) {
          setInternalPin('');
        }
        setSetupStep(1);
        setFirstPin('');
        setCurrentPinVal('');
        setSetupError(null);
        setIsErrorActive(false);
        setDigits(generateDigits(isRandom));
      } else {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }
        if (stepTimeoutRef.current) {
          clearTimeout(stepTimeoutRef.current);
          stepTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;
        isMismatchResetting.current = false;
        setIsErrorActive(false);
      }
    }, [visible, isControlled, isRandom]);

    useEffect(() => {
      return () => {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
        if (stepTimeoutRef.current) {
          clearTimeout(stepTimeoutRef.current);
        }
        if (modalToastRef.current) {
          Toast.popInstance(modalToastRef.current);
        }
      };
    }, []);

    useEffect(() => {
      setDigits(generateDigits(isRandom));
    }, [isRandom]);

    const pin = isControlled ? controlledValue : internalPin;
    const hasError = isErrorActive && Boolean(error || setupError);
    // Only display local errors (e.g. PIN mismatch) under the dots; API errors are shown via Toast
    const errorMessage = (isErrorActive && setupError) ? setupError : undefined;

    // Horizontal shake animation on error
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const triggerShake = useCallback(() => {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }, [shakeAnim]);

    useEffect(() => {
      if (error) {
        setIsErrorActive(true);
        if (autoShakeOnError) {
          triggerShake();
        }
        isMismatchResetting.current = true;
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
        resetTimeoutRef.current = setTimeout(() => {
          isMismatchResetting.current = false;
          if (!isControlled) {
            setInternalPin('');
          }
          onChange?.('');
          if (mode === 'change') {
            setSetupStep(1);
            setFirstPin('');
            setCurrentPinVal('');
            onStepChange?.(1);
          } else if (mode === 'setup') {
            setSetupStep(1);
            setFirstPin('');
            onStepChange?.(1);
          }
          if (isRandom) {
            setDigits(generateDigits(true));
          }
        }, 350);
      } else {
        setIsErrorActive(false);
      }
    }, [error, autoShakeOnError, triggerShake, isControlled, onChange, mode, onStepChange, isRandom]);

    const reshuffle = useCallback(() => {
      setDigits(generateDigits(isRandom));
    }, [isRandom]);

    const triggerComplete = useCallback(
      (completedPin: string) => {
        let encrypted = '';
        try {
          const result = encryptPin(completedPin);
          encrypted = result.encryptedPin;
          onCompleteEncrypted?.(result);
        } catch {
          // Encryption fallback
        }
        onComplete?.(completedPin, encrypted);
      },
      [onComplete, onCompleteEncrypted]
    );

    // Imperative ref methods
    useImperativeHandle(ref, () => ({
      clear: () => {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }
        if (stepTimeoutRef.current) {
          clearTimeout(stepTimeoutRef.current);
          stepTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;
        isMismatchResetting.current = false;
        if (!isControlled) {
          setInternalPin('');
        }
        setSetupStep(1);
        setFirstPin('');
        setCurrentPinVal('');
        setSetupError(null);
        setIsErrorActive(false);
        onChange?.('');
      },
      shake: triggerShake,
      getValue: () => pin,
      getEncryptedValue: () => {
        try {
          return encryptPin(pin).encryptedPin;
        } catch {
          return '';
        }
      },
      setValue: (val: string) => {
        const cleanVal = val.replace(/\D/g, '').slice(0, length);
        if (!isControlled) {
          setInternalPin(cleanVal);
        }
        onChange?.(cleanVal);
        if (cleanVal.length === length) {
          triggerComplete(cleanVal);
        }
      },
      reshuffle,
    }));

    const updatePin = (newPin: string) => {
      if (disabled || loading || isMismatchResetting.current || isTransitioningRef.current) return;
      if (setupError) setSetupError(null);
      if (isErrorActive) setIsErrorActive(false);

      if (!isControlled) {
        setInternalPin(newPin);
      }
      onChange?.(newPin);

      if (newPin.length === length) {
        isTransitioningRef.current = true;
        if (stepTimeoutRef.current) {
          clearTimeout(stepTimeoutRef.current);
        }

        if (mode === 'setup') {
          if (setupStep === 1) {
            setFirstPin(newPin);
            stepTimeoutRef.current = setTimeout(() => {
              isTransitioningRef.current = false;
              if (!isControlled) {
                setInternalPin('');
              }
              setSetupStep(2);
              setDigits(generateDigits(isRandom));
              onStepChange?.(2);
            }, 200);
          } else {
            if (newPin === firstPin) {
              stepTimeoutRef.current = setTimeout(() => {
                isTransitioningRef.current = false;
                triggerComplete(newPin);
              }, 200);
            } else {
              stepTimeoutRef.current = setTimeout(() => {
                isTransitioningRef.current = false;
                setIsErrorActive(true);
                setSetupError(pinMismatchError || strings.transactionPin.mismatchError);
                triggerShake();
                isMismatchResetting.current = true;
                if (resetTimeoutRef.current) {
                  clearTimeout(resetTimeoutRef.current);
                }
                resetTimeoutRef.current = setTimeout(() => {
                  isMismatchResetting.current = false;
                  setFirstPin('');
                  setSetupStep(1);
                  onStepChange?.(1);
                  if (!isControlled) {
                    setInternalPin('');
                  }
                  onChange?.('');
                  setDigits(generateDigits(isRandom));
                }, 400);
              }, 200);
            }
          }
        } else if (mode === 'change') {
          if (setupStep === 1) {
            setCurrentPinVal(newPin);
            stepTimeoutRef.current = setTimeout(() => {
              isTransitioningRef.current = false;
              if (!isControlled) {
                setInternalPin('');
              }
              setSetupStep(2);
              setDigits(generateDigits(isRandom));
              onStepChange?.(2);
            }, 200);
          } else if (setupStep === 2) {
            if (currentPinVal && newPin === currentPinVal) {
              stepTimeoutRef.current = setTimeout(() => {
                isTransitioningRef.current = false;
                setIsErrorActive(true);
                setSetupError(samePinError || strings.transactionPin.samePinError);
                triggerShake();
                isMismatchResetting.current = true;
                if (resetTimeoutRef.current) {
                  clearTimeout(resetTimeoutRef.current);
                }
                resetTimeoutRef.current = setTimeout(() => {
                  isMismatchResetting.current = false;
                  if (!isControlled) {
                    setInternalPin('');
                  }
                  onChange?.('');
                  setDigits(generateDigits(isRandom));
                }, 400);
              }, 200);
              return;
            }
            setFirstPin(newPin);
            stepTimeoutRef.current = setTimeout(() => {
              isTransitioningRef.current = false;
              if (!isControlled) {
                setInternalPin('');
              }
              setSetupStep(3);
              setDigits(generateDigits(isRandom));
              onStepChange?.(3);
            }, 200);
          } else {
            if (newPin === firstPin) {
              if (currentPinVal && newPin === currentPinVal) {
                stepTimeoutRef.current = setTimeout(() => {
                  isTransitioningRef.current = false;
                  setIsErrorActive(true);
                  setSetupError(samePinError || strings.transactionPin.samePinError);
                  triggerShake();
                  isMismatchResetting.current = true;
                  if (resetTimeoutRef.current) {
                    clearTimeout(resetTimeoutRef.current);
                  }
                  resetTimeoutRef.current = setTimeout(() => {
                    isMismatchResetting.current = false;
                    setFirstPin('');
                    setSetupStep(2);
                    onStepChange?.(2);
                    if (!isControlled) {
                      setInternalPin('');
                    }
                    onChange?.('');
                    setDigits(generateDigits(isRandom));
                  }, 400);
                }, 200);
                return;
              }
              let encCurrent = '';
              let encNew = '';
              try {
                encCurrent = encryptPin(currentPinVal).encryptedPin;
                encNew = encryptPin(newPin).encryptedPin;
              } catch {}
              onChangePinComplete?.({
                currentPin: currentPinVal,
                newPin,
                encryptedCurrentPin: encCurrent,
                encryptedNewPin: encNew,
              });
              stepTimeoutRef.current = setTimeout(() => {
                isTransitioningRef.current = false;
                triggerComplete(newPin);
              }, 200);
            } else {
              stepTimeoutRef.current = setTimeout(() => {
                isTransitioningRef.current = false;
                setIsErrorActive(true);
                setSetupError(pinMismatchError || strings.transactionPin.mismatchError);
                triggerShake();
                isMismatchResetting.current = true;
                if (resetTimeoutRef.current) {
                  clearTimeout(resetTimeoutRef.current);
                }
                resetTimeoutRef.current = setTimeout(() => {
                  isMismatchResetting.current = false;
                  setFirstPin('');
                  setSetupStep(2);
                  onStepChange?.(2);
                  if (!isControlled) {
                    setInternalPin('');
                  }
                  onChange?.('');
                  setDigits(generateDigits(isRandom));
                }, 400);
              }, 200);
            }
          }
        } else {
          stepTimeoutRef.current = setTimeout(() => {
            isTransitioningRef.current = false;
            triggerComplete(newPin);
          }, 200);
        }
      }
    };

    const handleDigitPress = (digit: string) => {
      if (disabled || loading || isMismatchResetting.current || isTransitioningRef.current || pin.length >= length) return;
      if (setupError) setSetupError(null);
      updatePin(pin + digit);
    };

    const handleDeletePress = () => {
      if (disabled || loading || isMismatchResetting.current || isTransitioningRef.current || pin.length === 0) return;
      if (setupError) setSetupError(null);
      updatePin(pin.slice(0, -1));
    };

    const handleClearAll = () => {
      if (disabled || loading || isMismatchResetting.current || isTransitioningRef.current || pin.length === 0) return;
      if (setupError) setSetupError(null);
      updatePin('');
    };

    // Determine the display title
    const displayTitle = useMemo(() => {
      if (mode === 'setup') {
        return setupStep === 1
          ? MODE_TITLES.create
          : MODE_TITLES.confirm;
      }
      if (mode === 'change') {
        if (setupStep === 1) return strings.transactionPin.enterCurrentTitle;
        if (setupStep === 2) return MODE_TITLES.create;
        return MODE_TITLES.confirm;
      }
      if (title) return title;
      if (mode && mode in MODE_TITLES) return MODE_TITLES[mode as keyof typeof MODE_TITLES];
      return strings.transactionPin.confirmNewTitle;
    }, [title, mode, setupStep]);

    const resolvedHeaderTitle = useMemo(() => {
      if (headerTitle !== undefined) return headerTitle;
      if (mode === 'change') return strings.transactionPin.resetScreenTitle;
      if (mode === 'setup') return strings.transactionPin.createScreenTitle;
      return strings.transactionPin.headerPinTitle ;
    }, [headerTitle, mode]);

    const handleBackAction = () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current);
        stepTimeoutRef.current = null;
      }
      isTransitioningRef.current = false;
      isMismatchResetting.current = false;
      if (mode === 'setup' && setupStep === 2) {
        setSetupStep(1);
        setFirstPin('');
        if (!isControlled) {
          setInternalPin('');
        }
        setSetupError(null);
        setIsErrorActive(false);
        setDigits(generateDigits(isRandom));
        onStepChange?.(1);
        return;
      }
      if (mode === 'change') {
        if (setupStep === 3) {
          setSetupStep(2);
          setFirstPin('');
          if (!isControlled) {
            setInternalPin('');
          }
          setSetupError(null);
          setIsErrorActive(false);
          setDigits(generateDigits(isRandom));
          onStepChange?.(2);
          return;
        }
        if (setupStep === 2) {
          setSetupStep(1);
          setCurrentPinVal('');
          if (!isControlled) {
            setInternalPin('');
          }
          setSetupError(null);
          setIsErrorActive(false);
          setDigits(generateDigits(isRandom));
          onStepChange?.(1);
          return;
        }
      }
      onClose?.();
    };

    const pinContent = (
      <View style={[styles.container, containerStyle]}>
        {/* Top Lock Badge */}
        {showLockIcon && (
          <View style={styles.lockBadgeContainer}>
            <Image
              source={lockIconImg}
              style={styles.lockBadge}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Title */}
        <AppText style={[styles.title, titleStyle]}>{displayTitle}</AppText>

        {/* 4 PIN Dots Indicator with Shake Animation */}
        <PinDots
          length={length}
          pinLength={pin.length}
          hasError={hasError}
          errorMessage={errorMessage}
          shakeAnim={shakeAnim}
          dotsContainerStyle={dotsContainerStyle}
          dotStyle={dotStyle}
          errorTextStyle={errorTextStyle}
        />

        {/* Loading Spinner */}
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginVertical: verticalScale(8) }}
          />
        )}

        {/* Numeric Keypad */}
        <PinKeypad
          digits={digits}
          pinLength={pin.length}
          disabled={disabled}
          loading={loading}
          onDigitPress={handleDigitPress}
          onDeletePress={handleDeletePress}
          onClearAll={handleClearAll}
          keypadContainerStyle={keypadContainerStyle}
          keyButtonStyle={keyButtonStyle}
          keyTextStyle={keyTextStyle}
        />
      </View>
    );

    if (visible !== undefined) {
      return (
        <Modal
          visible={visible}
          animationType={animationType}
          transparent={false}
          onRequestClose={handleBackAction}
        >
          <View style={styles.modalContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <CustomToast ref={setModalToastRef} />
            {showBackButton && (
              <TopHeader
                title={resolvedHeaderTitle}
                onBack={handleBackAction}
              />
            )}
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {pinContent}
            </ScrollView>
          </View>
        </Modal>
      );
    }

    return pinContent;
  }
);

PinInput.displayName = 'PinInput';

export default PinInput;
