import React, { useState, useEffect, useRef } from 'react';
import { RouteProp } from '@react-navigation/native';
import useBlockBackButton from '@hooks/useBlockBackButton';
import {
    View,
    StatusBar,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity
} from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAuthStackParamList } from '@navigation/contractor/ContractorAuthStack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import { dismissKeyboardAndThen } from '@utils/keyboard';
import { useAuth } from '@context/AuthContext';
import styles from './styles';
import colors from '@styles/colors';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { useUserStore } from '@store/useUserStore';
import { Toast } from '@utils/ToastManager';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppText from '@components/AppText';

interface OTPParams {
    email?: string;
    mobile?: string;
    countryCode?: number;
    otpId?: string;
    flowType?: 'registration' | 'forgotPassword' | 'profileUpdate';
    expiresIn?: number;
}

type OTPScreenProps = NativeStackScreenProps<any, 'ContractorOTP'>;

const ContractorOTPScreen = ({ navigation, route }: OTPScreenProps) => {

    useBlockBackButton();
    const { signIn } = useAuth();
    const params = (route.params as OTPParams) || {};
    const { email, mobile, countryCode, otpId, flowType, expiresIn } = params;


    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [currentOtpId, setCurrentOtpId] = useState(otpId || '');
    const otpRef = useRef<OtpInputRef>(null);
    const { setUserFlow } = useAuth();
    const backIcon = require('@assets/images/common/backIcon.png');
    const applogo = require('@assets/images/app/gigPay.png');

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

    const handleVerify = async () => {

        if (otp.length !== 6) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: strings.validation.otpLength,
            });
            setOtp('');
            otpRef.current?.clear();
            return;
        }

        setIsLoading(true);
        try {
            const response = await AuthService.verifyOtp({
                email: email || '',
                otp,
                type: 'contractor',
                otpId: currentOtpId,
                role: 'contractor'
            });

            if (response.success) {
                // Logic for registration flow
                const data = response.data;
                const accessToken = data.accessToken || '';
                const refreshToken = data.refreshToken || '';
                const userId = data?._id || data?.userId?.toString() || data?.userInfo?.id || '';
                dismissKeyboardAndThen(() => {
                    signIn(accessToken, refreshToken, userId);
                });
            } else {

                Toast.show({
                    type: 'error',
                    text1: strings.common.error,
                    text2: response.message || strings.auth.contractor.signup.somethingWentWrong,
                });
                setOtp('');
                otpRef.current?.clear();
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: error.message || strings.auth.contractor.otp.unexpectedError,
            });
            setOtp('');
            otpRef.current?.clear();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        Keyboard.dismiss();
        setIsResending(true);
        try {
            const response = await AuthService.resendOtp({
                email: email || '',
                type: 'contractor',
                role: 'contractor'
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
                    text1: strings.common.error,
                    text2: response.message || strings.auth.contractor.otp.resendFailed,
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: error.message || 'Something went wrong.',
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
                    <View style={styles.flex1}>
                        <View style={styles.container}>
                            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

                            <View style={styles.header}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Image source={backIcon} style={styles.backIcon} />
                                </TouchableOpacity>

                                <Image source={applogo} style={styles.logo} />
                            </View>
                            <AppText style={styles.title}>{strings.auth.contractor.otp.screenTitle}</AppText>
                            <AppText style={styles.subtitle}>
                                {strings.auth.contractor.otp.subtitle} <AppText style={styles.emailText}>{email || (mobile ? `+${countryCode || 1} ${mobile}` : '')}</AppText>
                            </AppText>


                            <View
                                style={styles.otpContainer}
                                pointerEvents={isLoading || isResending ? 'none' : 'auto'}
                            >
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
                                    {strings.auth.contractor.otp.expiringIn} <AppText style={styles.timerCount}>{formatTime(timer)}</AppText>
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
                                    {strings.auth.contractor.otp.resendPrompt} <AppText
                                        style={[styles.resendLink, (isLoading || isResending || timer > 0) && { opacity: 0.5 }]}
                                        onPress={!(isLoading || isResending || timer > 0) ? handleResend : undefined}
                                    >{strings.auth.contractor.otp.resendAction}</AppText>
                                </AppText>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </CustomBackground>
    );
};

export default ContractorOTPScreen;