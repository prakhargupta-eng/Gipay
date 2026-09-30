import React, { useState, useEffect, useRef } from 'react';
import useBlockBackButton from '@hooks/useBlockBackButton';
import {
    View,
    StatusBar,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard,
    KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '@context/AuthContext';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientAuthStackParamList } from '@navigation/client/ClientAuthStack';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import { dismissKeyboardAndThen } from '@utils/keyboard';
import styles from './style';
import colors from '@styles/colors';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';

type OTPScreenProps = NativeStackScreenProps<ClientAuthStackParamList, 'otpverification'>;

const OTPScreen = ({ navigation, route }: OTPScreenProps) => {
    useBlockBackButton();
    const { signIn, updateLastStep } = useAuth();
    const { email, otpId, flowType } = route.params;
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [currentOtpId, setCurrentOtpId] = useState(otpId || '');
    const otpRef = useRef<OtpInputRef>(null);
    const applogo = require('@assets/images/app/gigPay.png');
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
                const response = await AuthService.registerVerifyOtp({
                    email: email,
                    otp: otp,
                    type: 'client',
                    otpId: currentOtpId,
                    role: 'client'
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
            } catch (error: any) {
                Toast.show({
                    type: 'error',
                    text2: error.message || strings.auth.contractor.signup.somethingWentWrong,
                });
                setOtp('');
                otpRef.current?.clear();
            } finally {
                setIsLoading(false);
            }
        } else {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: strings.validation.otpLength,
            });
            setOtp('');
            otpRef.current?.clear();
        }
    };

    const handleResend = async () => {
        if (isResending) return;

        Keyboard.dismiss();
        setIsResending(true);
        try {
            const response = await AuthService.resendOtp({
                email,
                type: flowType === 'profileUpdate' ? 'email-update' : (flowType === 'forgotPassword' ? 'forgotPassword' : 'client'),
                role: 'client'
            });
            if (response.success) {
                const newExpiresIn = 59;
                setTimer(newExpiresIn);
                setOtp('');
                otpRef.current?.clear();
                if (response.data?.otpId) {
                    setCurrentOtpId(response.data.otpId);
                }
                Toast.show({
                    type: 'success',
                    text1: strings.common.success,
                    text2: response.message || strings.validation.otpSent,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: strings.common.failed,
                    text2: response.message || strings.auth.client.otp.resendFailed,
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: error.message || strings.auth.contractor.signup.somethingWentWrong,
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <CustomBackground>
            <KeyboardAvoidingView
                behavior={undefined}
                style={styles.flex1}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={styles.flex1}
                        pointerEvents={isLoading || isResending ? 'none' : 'auto'}
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

                                <Image source={applogo} style={styles.logo} />
                            </View>

                            <AppText style={styles.title}>{strings.auth.client.otp.screenTitle}</AppText>
                            <AppText style={styles.subtitle}>
                                {strings.auth.client.otp.subtitle} <AppText style={styles.emailText}>{email}</AppText>
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
                                    {strings.auth.client.otp.expiringIn} <AppText style={styles.timerCount}>{formatTime(timer)}</AppText>
                                </AppText>
                            )}


                            {/* Fixed Bottom Section */}
                            <View style={styles.bottomContainer}>
                                <View style={styles.buttonWrapper}>
                                    <LoginButton
                                        text={strings.common.verify}
                                        onPress={handleVerify}
                                        loading={isLoading}
                                        disabled={isLoading}
                                    />
                                </View>

                                <AppText style={styles.resendText}>
                                    {strings.auth.client.otp.resendPrompt} <AppText
                                        style={[styles.resendLink, (isLoading || isResending || timer > 0) && { opacity: 0.5 }]}
                                        onPress={!(isLoading || isResending || timer > 0) ? handleResend : undefined}
                                    >{strings.auth.client.otp.resendAction}</AppText>
                                </AppText>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </CustomBackground>
    );
};

export default OTPScreen;