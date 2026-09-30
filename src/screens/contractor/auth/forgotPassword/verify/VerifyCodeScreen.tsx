import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Keyboard,
    ScrollView,
    StatusBar,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAuthStackParamList } from '@navigation/contractor/ContractorAuthStack';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import LoginButton from '@components/LoginButton';
import colors from '@styles/colors';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { dismissKeyboardAndThen } from '@utils/keyboard';
import { useAuth } from '@context/AuthContext';
import styles from './verifyCodeStyle';
import { Toast } from '@utils/ToastManager';
import { useUserStore } from '@store/useUserStore';
import AppText from '@components/AppText';


type NavigationProp = NativeStackNavigationProp<ContractorAuthStackParamList, 'verifyCode'>;
type VerifyCodeRouteProp = RouteProp<ContractorAuthStackParamList, 'verifyCode'>;

const VerifyCodeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<VerifyCodeRouteProp>();
    const { email, mobile, countryCode, otpId, flowType } = route.params;
    const otpRef = useRef<OtpInputRef>(null);

    const { signIn } = useAuth();

    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [currentOtpId, setCurrentOtpId] = useState(otpId || '');

    const backIcon = require('@assets/images/common/backIcon.png');

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');
        return `0${minutes}:${paddedSeconds}`;
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleVerify = async () => {
        if (otp.length === 6) {
            setIsLoading(true);
            try {
                if (flowType === 'profileUpdate') {
                    let verifyRes;
                    if (mobile) {
                        const cleanMobile = mobile.replace(/^\+1\s?/, '').replace(/\s+/g, '');
                        verifyRes = await AuthService.verifyMobileUpdate({
                            mobile: cleanMobile,
                            countryCode: String(countryCode || '1'),
                            otpId: currentOtpId,
                            type: 'mobile-update',
                            otp,
                        });
                    } else if (email) {
                        verifyRes = await AuthService.verifyEmailUpdate({
                            email,
                            otpId: currentOtpId,
                            otp,
                            type: 'email-update',
                        });
                    } else {
                        throw new Error('No contact information provided for verification');
                    }

                    if (verifyRes.success) {
                        dismissKeyboardAndThen(() => {
                            if (mobile) {
                                useUserStore.getState().updateContractorMobile(mobile);
                            } else if (email) {
                                useUserStore.getState().updateContractorEmail(email);
                            }
                            navigation.goBack();
                        });
                    } else {
                        Toast.show({ type: 'error', text1: 'Error', text2: verifyRes.message || 'Verification failed' });
                        setOtp('');
                        otpRef.current?.clear();
                    }
                    return;
                }

                const response = await AuthService.verifyOtp({
                    email: email || '',
                    otp: otp,
                    type: flowType === 'forgotPassword' ? 'forgotPassword' : 'contractor',
                    otpId: currentOtpId,
                    role: 'contractor'
                });

                if (response.success) {
                    if (flowType === 'forgotPassword') {
                        dismissKeyboardAndThen(() => {
                            navigation.navigate('resetPassword', { email: email || '', otpId: currentOtpId });
                        });
                    } else {
                        const data = response.data;
                        const accessToken = data.accessToken || '';
                        const refreshToken = data.refreshToken || '';
                        const userId = data?._id || data?.userId?.toString() || data?.userInfo?.id || '';
                        dismissKeyboardAndThen(() => {
                            signIn(accessToken, refreshToken, userId);
                        });
                    }
                } else {
                    Toast.show({ type: 'error', text1: 'Error', text2: response.message || 'Invalid OTP' });
                    setOtp('');
                    otpRef.current?.clear();
                }
            } catch (error: any) {
                Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Something went wrong' });
            } finally {
                setIsLoading(false);
            }
        } else {
            Toast.show({ type: 'error', text1: 'Error', text2: strings.validation.otpLength });
            setOtp('');
            otpRef.current?.clear();
        }
    };

    const handleResend = async () => {

        if (isResending) return;
        setIsResending(true);
        try {
            const resendPayload: any = {
                type: flowType === 'profileUpdate'
                    ? (mobile ? 'mobile-update' : 'email-update')
                    : (flowType === 'forgotPassword' ? 'forgotPassword' : 'contractor'),
                role: 'contractor'
            };

            if (mobile) {
                resendPayload.mobile = mobile.replace(/^\+1\s?/, '').replace(/\s+/g, '');
                resendPayload.countryCode = countryCode || 1;
            } else if (email) {
                resendPayload.email = email;
            }

            const response = await AuthService.resendOtp(resendPayload);

            if (response.success) {
                const newExpiresIn = 59;
                setTimer(newExpiresIn);
                setOtp('');
                otpRef.current?.clear();
                if (response.data?.otpId) {
                    setCurrentOtpId(response.data.otpId);
                }
                Toast.show({ type: 'success', text1: 'Success', text2: response.message || strings.validation.otpSent });
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: response.message || 'Failed to resend OTP' });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Something went wrong' });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <View style={styles.flex1}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.flex1}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.container}>
                            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

                            <View style={styles.header}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={handleBack}
                                >
                                    <Image source={backIcon} style={styles.backIcon} />
                                </TouchableOpacity>

                                <AppText style={styles.headerTitle}>
                                    {flowType === 'profileUpdate'
                                        ? (mobile ? 'Verify Mobile' : 'Verify Email')
                                        : strings.auth.client.forgotPassword.screenTitle}
                                </AppText>
                            </View>

                            <AppText style={styles.title}>
                                {flowType === 'profileUpdate'
                                    ? (mobile ? 'Mobile Verification' : 'Email Verification')
                                    : strings.auth.client.forgotPassword.enterCode}
                            </AppText>
                            <AppText style={styles.subtitle}>
                                {mobile ? strings.auth.client.forgotPassword.otpSubtitlePhone : strings.auth.client.forgotPassword.otpSubtitle} <AppText style={styles.emailText}>{mobile ? `+${countryCode || 1} ${mobile}` : email}</AppText>
                            </AppText>



                            <View style={styles.otpContainer}>
                                <OtpInput
                                    ref={otpRef}
                                    numberOfDigits={6}
                                    onTextChange={(text) => setOtp(text)}
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

                            {timer > 0 && (
                                <AppText style={styles.timerText}>
                                    {strings.auth.client.forgotPassword.expiringIn} <AppText style={styles.timerHighlight}>{formatTime(timer)}</AppText>
                                </AppText>
                            )}

                            <View style={styles.buttonContainer}>
                                <LoginButton
                                    text={strings.auth.client.forgotPassword.verify}
                                    onPress={handleVerify}
                                    loading={isLoading}
                                    disabled={isLoading}
                                />
                            </View>

                            <AppText style={styles.resendText}>
                                {strings.auth.client.forgotPassword.resendPrompt}
                                <AppText
                                    style={[
                                        styles.resendAction,
                                        (isLoading || isResending || timer > 0) && { color: colors.gray }
                                    ]}
                                    onPress={!(isLoading || isResending || timer > 0) ? handleResend : undefined}
                                >
                                    {strings.auth.client.forgotPassword.resendAction}
                                </AppText>
                            </AppText>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default VerifyCodeScreen;
