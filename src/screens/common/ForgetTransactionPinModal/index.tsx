import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import AppText from '@components/AppText';
import TopHeader from '@components/TopHeader';
import LoginButton from '@components/LoginButton';
import CustomToast from '@components/CustomToast';
import { Toast } from '@utils/ToastManager';
import PinInput from '@components/PinInput';
import AuthService from '@config/authService';
import { encryptPin } from '@utils/cryptoUtils';
import { useUserStore } from '@store/useUserStore';
import { devDebugger } from '@utils/devDebugger';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import { ForgetTransactionPinScreenProps, ResetTransactionPinScreenProps } from './types';

const emailIcon = require('@assets/images/common/email.png');

const ForgetTransactionPinScreen: React.FC<ForgetTransactionPinScreenProps> = ({
  route,
  onClose,
  email,
  onSuccess,
}) => {
  const navigation = useNavigation<any>();
  const storeClientEmail = useUserStore((state) => state.clientProfile?.user?.email);
  const storeContractorEmail = useUserStore((state) => state.profile?.user?.email);
  const targetEmail = route?.params?.email || email || storeClientEmail || storeContractorEmail || '';

  // Step state: 1 = Verify Email, 2 = Enter OTP, 3 = Create PIN
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const [pinResetToken, setPinResetToken] = useState('');
  const [timer, setTimer] = useState(59);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // PIN Reset State
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [pinError, setPinError] = useState<string | undefined>(undefined);

  const otpRef = useRef<OtpInputRef>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const modalToastRef = useRef<any>(null);

  const setModalToast = useCallback((node: any) => {
    if (modalToastRef.current && !node) {
      Toast.popInstance(modalToastRef.current);
    }
    modalToastRef.current = node;
    if (node) {
      Toast.pushInstance(node);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (modalToastRef.current) {
        Toast.popInstance(modalToastRef.current);
      }
    };
  }, []);

  // Format timer mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const paddedSeconds = String(seconds).padStart(2, '0');
    return `0${minutes}:${paddedSeconds}`;
  };

  // Start / restart timer countdown
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer(59);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto clear OTP field on expiration
          setOtp('');
          otpRef.current?.clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Reset all states on mount / cleanup on unmount
  useEffect(() => {
    setStep(1);
    setOtp('');
    setOtpId('');
    setPinResetToken('');
    setPinError(undefined);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (modalToastRef.current) {
        Toast.popInstance(modalToastRef.current);
      }
    };
  }, []);

  // Step 1: Send OTP action (do not show success toast this time only)
  const handleSendOtpStep1 = async () => {
    if (!targetEmail) {
      Toast.show({
        type: 'error',
        text2: strings.transactionPin.noRegisteredEmail,
      });
      return;
    }

    Keyboard.dismiss();
    setIsSendingOtp(true);

    try {
      devDebugger.log('📤 [ForgetTransactionPinModal] Sending OTP to:', targetEmail);
      const response = await AuthService.forgotPinSendOtp({
        email: targetEmail,
        channel: 'email',
      });

      if (response.success) {
        const id = response.data?.otpId || response.data?._id || response.data?.id || '';
        setOtpId(id);
        startTimer();
        setStep(2);
        // Do NOT show success toast on initial send per requirement
      } else {
        const errMsg = response.message || strings.auth.client.otp.resendFailed;
        Toast.show({
          type: 'error',
          text2: errMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [ForgetTransactionPinModal] Error sending OTP:', error);
      const errMsg = error?.message || strings.auth.contractor.signup.somethingWentWrong;
      Toast.show({
        type: 'error',
        text2: errMsg,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Resend OTP action (POST /api/v1/pin/forgot-pin/resend-otp)
  const handleResendOtp = async () => {
    if (!targetEmail || isSendingOtp || timer > 0) return;

    Keyboard.dismiss();
    setIsSendingOtp(true);
    setOtp('');
    otpRef.current?.clear();

    try {
      devDebugger.log('🔁 [ForgetTransactionPinModal] Resending OTP via forgotPinResendOtp to:', targetEmail);
      const response = await AuthService.forgotPinResendOtp({
        email: targetEmail,
        channel: 'email',
      });

      if (response.success) {
        const id = response.data?.otpId || response.data?._id || response.data?.id || '';
        if (id) setOtpId(id);
        startTimer();
        Toast.show({
          type: 'success',
          text2: response.message || strings.validation.otpSent,
        });
      } else {
        const errMsg = response.message || strings.auth.client.otp.resendFailed;
        Toast.show({
          type: 'error',
          text2: errMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [ForgetTransactionPinModal] Error resending OTP:', error);
      const errMsg = error?.message || strings.auth.contractor.signup.somethingWentWrong;
      Toast.show({
        type: 'error',
        text2: errMsg,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP action
  const handleVerifyOtp = async (codeToVerify?: string) => {
    if (isVerifyingOtp) return;
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      Toast.show({
        type: 'error',
        text2: strings.validation.otpLength,
      });
      setOtp('');
      otpRef.current?.clear();
      return;
    }

    if (timer === 0) {
      Toast.show({
        type: 'error',
        text2: strings.transactionPin.codeExpiredError,
      });
      setOtp('');
      otpRef.current?.clear();
      return;
    }

    Keyboard.dismiss();
    setIsVerifyingOtp(true);

    try {
      devDebugger.log('🔐 [ForgetTransactionPinModal] Verifying OTP:', { otp: code, otpId });
      const response = await AuthService.forgotPinVerifyOtp({
        otp: code,
        otpId,
      });

      if (response.success) {
        const token =
          response.data?.pinResetToken ||
          response.data?.token ||
          response.data?.resetToken ||
          '';
        setPinResetToken(token);
        setStep(3);
      } else {
        const errMsg = response.message || strings.transactionPin.otpVerifyFailed;
        Toast.show({
          type: 'error',
          text2: errMsg,
        });
        // Auto clear field on invalid / expired OTP
        setOtp('');
        otpRef.current?.clear();
      }
    } catch (error: any) {
      devDebugger.log('❌ [ForgetTransactionPinModal] Error verifying OTP:', error);
      const errMsg = error?.message || strings.transactionPin.otpVerifyFailed;
      Toast.show({
        type: 'error',
        text2: errMsg,
      });
      // Auto clear field on invalid / expired OTP
      setOtp('');
      otpRef.current?.clear();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Reset PIN Complete action
  const handleResetPinComplete = async (newPin: string, encryptedNewPin?: string) => {
    setIsResettingPin(true);
    setPinError(undefined);

    try {
      const encPin = encryptedNewPin || encryptPin(newPin).encryptedPin;
      devDebugger.log('🔐 [ForgetTransactionPinModal] Submitting new PIN:', {
        pinResetToken,
        newPin: encPin,
      });

      const response = await AuthService.forgotPinReset({
        pinResetToken,
        newPin: encPin,
        newTransactionPin: encPin,
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text2: response.message || strings.transactionPin.resetSuccess,
        });
        const { clientProfile, setClientProfile, profile, setProfile } = useUserStore.getState();
        useUserStore.getState().setIsPIN(true);
        useUserStore.getState().setIsPINSet(true);
        if (clientProfile) {
          setClientProfile({
            ...clientProfile,
            isPIN: true,
            isPINSet: true,
            user: { ...clientProfile.user, isPIN: true, isPINSet: true },
            profile: { ...clientProfile.profile, isPIN: true, isPINSet: true },
          } as any);
        }
        if (profile) {
          setProfile({
            ...profile,
            isPIN: true,
            isPINSet: true,
            user: { ...profile.user, isPIN: true, isPINSet: true },
            profile: { ...profile.profile, isPIN: true, isPINSet: true },
          } as any);
        }
        onSuccess?.();
        route?.params?.onSuccess?.();
        if (onClose) {
          onClose();
        } else if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } else {
        const errMsg = response.message || strings.transactionPin.resetFailed;
        setPinError(errMsg);
        Toast.show({
          type: 'error',
          text2: errMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [ForgetTransactionPinModal] Error resetting PIN:', error);
      const errMsg = error?.message || strings.transactionPin.resetFailed;
      setPinError(errMsg);
      Toast.show({
        type: 'error',
        text2: errMsg,
      });
    } finally {
      setIsResettingPin(false);
    }
  };

  // Back action per step
  const handleBackPress = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      if (onClose) {
        onClose();
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <TopHeader title={strings.transactionPin.forgetScreenTitle } onBack={handleBackPress} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: Verify Email Screen */}
            {step === 1 && (
              <>
                <AppText style={styles.title}>{strings.transactionPin.verifyEmailTitle}</AppText>
                <AppText style={styles.subtitle}>
                  {strings.transactionPin.verifyEmailSubtitle}
                </AppText>

                <AppText style={styles.fieldLabel}>{strings.transactionPin.registeredEmailLabel}</AppText>
                <View style={styles.emailBox}>
                  <Image source={emailIcon} style={styles.emailIcon} />
                  <AppText style={styles.emailValueText} numberOfLines={1}>
                    {targetEmail}
                  </AppText>
                </View>

                <View style={styles.bottomContainer}>
                  <View style={styles.buttonWrapper}>
                    <LoginButton
                      text={strings.transactionPin.sendOtp}
                      loading={isSendingOtp}
                      disabled={isSendingOtp || !targetEmail}
                      onPress={handleSendOtpStep1}
                    />
                  </View>
                </View>
              </>
            )}

            {/* STEP 2: Enter OTP Screen */}
            {step === 2 && (
              <>
                <AppText style={styles.title}>{strings.transactionPin.enterVerificationCodeTitle}</AppText>
                <AppText style={styles.subtitle}>
                  {strings.transactionPin.sentVerificationCodeTo}{' '}
                  <AppText style={styles.emailHighlightText}>{targetEmail}</AppText>
                </AppText>

                {/* 6-Digit OTP Input matching OTPScreen */}
                <View style={styles.otpContainer}>
                  <OtpInput
                    ref={otpRef}
                    numberOfDigits={6}
                    disabled={isVerifyingOtp}
                    onTextChange={(text) => {
                      setOtp(text);
                    }}
                    focusColor={colors.primary}
                    theme={{
                      containerStyle: styles.otpInputContainer,
                      pinCodeContainerStyle: styles.otpPinCodeContainer,
                      pinCodeTextStyle: styles.otpPinCodeText,
                      focusedPinCodeContainerStyle: styles.otpPinCodeFocused,
                      filledPinCodeContainerStyle: styles.otpPinCodeContainer,
                    }}
                  />
                </View>

                {/* Timer Countdown */}
                {timer > 0 && (
                  <AppText style={styles.timerText}>
                    {strings.auth.client.otp.expiringIn}{' '}
                    <AppText style={styles.timerCount}>{formatTime(timer)}</AppText>
                  </AppText>
                )}

                {/* Fixed Bottom Section */}
                <View style={styles.bottomContainer}>
                  <View style={styles.buttonWrapper}>
                    <LoginButton
                      text={strings.common.verify}
                      onPress={() => handleVerifyOtp()}
                      loading={isVerifyingOtp}
                      disabled={isVerifyingOtp || otp.length !== 6}
                    />
                  </View>

                  <View style={styles.resendRow}>
                    <AppText style={styles.resendText}>
                      {strings.auth.client.otp.resendPrompt}{' '}
                    </AppText>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={timer > 0 || isSendingOtp}
                      activeOpacity={0.7}
                    >
                      <AppText
                        style={[
                          styles.resendLink,
                          (isSendingOtp || timer > 0) && styles.resendLinkDisabled,
                        ]}
                      >
                        {isSendingOtp
                          ? strings.transactionPin.resending
                          : strings.auth.client.otp.resendAction}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* STEP 3: Create PIN Screen */}
            {step === 3 && (
              <PinInput
                showLockIcon={false}
                mode="setup"
                loading={isResettingPin}
                error={pinError}
                title={strings.transactionPin.createTitle}
                onComplete={(newPin, encPin) =>
                  handleResetPinComplete(newPin, encPin)
                }
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <CustomToast ref={setModalToast} />
    </View>
  );
};

export { ForgetTransactionPinScreen as ResetTransactionPinScreen };
export default ForgetTransactionPinScreen;
