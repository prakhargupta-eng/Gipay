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
import { ClientAuthStackParamList } from '@navigation/client/ClientAuthStack';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import LoginButton from '@components/LoginButton';
import colors from '@styles/colors';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { dismissKeyboardAndThen } from '@utils/keyboard';

import styles from './verifyCodeStyle';
import { Toast } from '@utils/ToastManager';
import { useUserStore } from '@store/useUserStore';
import { useAuth } from '@context/AuthContext';
import AppText from '@components/AppText';

type NavigationProp = NativeStackNavigationProp<ClientAuthStackParamList, 'verifyCode'>;
type VerifyCodeRouteProp = RouteProp<ClientAuthStackParamList, 'verifyCode'>;

const VerifyCodeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { signIn, updateLastStep } = useAuth();
    const route = useRoute<VerifyCodeRouteProp>();
    const { email, mobile, otpId, flowType, role, countryCode: routeCountryCode } = route.params;
    const otpRef = useRef<OtpInputRef>(null);

    const activeCountryCode = routeCountryCode ? `+${routeCountryCode}` : '+1';

    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [currentOtpId, setCurrentOtpId] = useState(otpId || '');

    const backIcon = require('@assets/images/common/backIcon.png');

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
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
                if (flowType === 'forgotPassword') {
                    const response = await AuthService.registerVerifyOtp({
                        email: email || '',
                        otp: otp,
                        type: 'forgotPassword',
                        otpId: currentOtpId,
                        role: role || 'client'
                    });

                    if (response.success) {
                        dismissKeyboardAndThen(() => {
                            navigation.navigate('resetPassword' as any, { email: email || '', otpId: currentOtpId });
                        });
                    } else {
                        Toast.show({ type: 'error', text2: response.message || 'Invalid OTP' });
                    }
                } else if (flowType === 'profileUpdate') {
                    const verifyRes = await AuthService.verifyEmailUpdate({
                        email: email || '',
                        otpId: currentOtpId,
                        otp,
                        type: 'email-update',
                    });

                    if (verifyRes.success) {
                        dismissKeyboardAndThen(() => {
                            useUserStore.getState().updateClientEmail(email || '');
                            navigation.goBack();
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text2: verifyRes.message || strings.auth.client.otp.emailVerificationFailed,
                        });
                        setOtp('');
                        otpRef.current?.clear();
                    }
                } else if (flowType === 'mobile-update') {
                    // Strip active country code from mobile if necessary
                    const regex = new RegExp(`^\\${activeCountryCode}\\s?`);
                    const cleanMobile = (mobile || '').replace(regex, '').replace(/\\s+/g, '');
                    const verifyRes = await AuthService.verifyMobileUpdate({
                        mobile: cleanMobile,
                        countryCode: activeCountryCode,
                        otpId: currentOtpId,
                        type: 'mobile-update',
                        otp,
                    });

                    if (verifyRes.success) {
                        dismissKeyboardAndThen(() => {
                            useUserStore.getState().updateClientMobile(mobile || '');
                            navigation.goBack();
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text2: verifyRes.message || 'Mobile verification failed',
                        });
                        setOtp('');
                        otpRef.current?.clear();
                    }
                } else {
                    // Default registration / 'client' flow
                    const response = await AuthService.registerVerifyOtp({
                        email: email || '',
                        otp: otp,
                        type: 'client',
                        otpId: currentOtpId,
                        role: role || 'client'
                    });

                    if (response.success) {
                        const { data } = response;
                        const accessToken = data?.token || '';
                        const refreshToken = data?.refreshToken || '';
                        const userId = data?._id || data?.userId?.toString() || '';

                        dismissKeyboardAndThen(() => {
                            updateLastStep('setupOrganization');
                            signIn(accessToken, refreshToken, userId);
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: strings.auth.client.otp.verificationFailed,
                            text2: response.message || 'Invalid OTP',
                        });
                        setOtp('');
                        otpRef.current?.clear();
                    }
                }
            } catch (error: any) {
                Toast.show({ type: 'error', text2: error.message || 'Something went wrong' });
            } finally {
                setIsLoading(false);
            }
        } else {
            Toast.show({ type: 'error', text2: strings.validation.otpLength });
            setOtp('');
            otpRef.current?.clear();
        }
    };

    const handleResend = async () => {
        if (isResending) return;
        setIsResending(true);
        try {
            let resendType = 'client';
            if (flowType === 'mobile-update') resendType = 'mobile-update';
            else if (flowType === 'profileUpdate') resendType = 'email-update';
            else if (flowType === 'forgotPassword') resendType = 'forgotPassword';

            const resendPayload: any = {
                type: resendType,
                role: role || 'client'
            };

            if (mobile) {
                const regex = new RegExp(`^\\${activeCountryCode}\\s?`);
                resendPayload.mobile = mobile.replace(regex, '').replace(/\\s+/g, '');
                resendPayload.countryCode = activeCountryCode;
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
                Toast.show({ type: 'success', text2: response.message || strings.validation.otpSent });
            } else {
                Toast.show({ type: 'error', text2: response.message || 'Failed to resend OTP' });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text2: error.message || 'Something went wrong' });
        } finally {
            setIsResending(false);
        }
    };

    let headerTitle = strings.auth.client.forgotPassword.screenTitle;
    let titleText = strings.auth.client.otp.screenTitle;
    let subtitleText = strings.auth.client.otp.subtitle;
    let displayContact = email || '';

    if (flowType === 'profileUpdate') {
        headerTitle = strings.client.profileDetails.verifyEmail;
        titleText = strings.client.profileDetails.enterVerificationCode;
        subtitleText = strings.client.profileDetails.emailOtpSubtitle;
    } else if (flowType === 'mobile-update') {
        headerTitle = strings.client.profileDetails.verifyMobile;
        titleText = strings.client.profileDetails.enterVerificationCode;
        subtitleText = strings.client.profileDetails.mobileOtpSubtitle;
        displayContact = mobile?.startsWith(activeCountryCode) ? mobile : `${activeCountryCode} ${mobile || ''}`;
    } else if (flowType === 'forgotPassword') {
        titleText = strings.auth.client.forgotPassword.enterCode;
        subtitleText = strings.auth.client.forgotPassword.otpSubtitle;
    }

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
                                    {headerTitle}
                                </AppText>
                            </View>

                            <AppText style={styles.title}>
                                {titleText}
                            </AppText>
                            <AppText style={styles.subtitle}>
                                {subtitleText}
                                {' '}
                                <AppText style={styles.emailText}>
                                    {displayContact}
                                </AppText>
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
