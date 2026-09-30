import React, { useState } from 'react';
import useBlockBackButton from '@hooks/useBlockBackButton';
import {
    View,
    TouchableOpacity,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAuthStackParamList } from '@navigation/client/ClientAuthStack';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import { validateEmail, validatePassword, formatEmail } from '@utils/validation';
import { dismissKeyboardAndThen } from '@utils/keyboard';
import styles from './style';
import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import AppText from '@components/AppText';
import { setNotificationEnabled } from '@store/storage';
import { devDebugger } from '@utils/devDebugger';

type LoginScreenNavigationProp = NativeStackNavigationProp<ClientAuthStackParamList, 'login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    useBlockBackButton();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const backIcon = require('@assets/images/common/backIcon.png');
    const applogo = require('@assets/images/app/gigPay.png');
    const { signIn, completeProfile, setUserFlow, updateLastStep, saveName } = useAuth();

    const handleLogin = async () => {
        Keyboard.dismiss();
        const pError = validatePassword(password);
        const eError = validateEmail(email);

        if (eError || pError) {
            setEmailError(eError);
            setPasswordError(pError);
            return;
        }

        setEmailError('');
        setPasswordError('');
        setIsLoading(true);

        try {
            let deviceToken = undefined;
            try {
                deviceToken = await messaging().getToken();
            } catch (e) {
                devDebugger.log('Failed to fetch device token', e);
            }

            const deviceId = await DeviceInfo.getUniqueId();
            const deviceType = Platform.OS;

            const payload: any = {
                type: 'client',
                email,
                password,
                deviceId,
                deviceType,
            };

            if (deviceToken) {
                payload.deviceToken = deviceToken;
            }

            const response = await AuthService.login(payload);
            if (response.success) {
                const { data } = response;
                const accessToken = data?.token || '';
                const refreshToken = data?.refreshToken || '';
                const userId = data?._id || data?.userId?.toString() || '';
                const username = data?.fullName || data?.username || '';
                
                devDebugger.log('🚪 [Login] Client Login Successful!');
                devDebugger.log('🎫 [Login] Access Token received');
                devDebugger.log('🔁 [Login] Refresh Token received:', refreshToken);

                if (data.notificationEnabled !== undefined) {
                    setNotificationEnabled(data.notificationEnabled);
                }

                dismissKeyboardAndThen(() => {
                    if (data.onboardingStatus) {
                        const { setupOrganization } = data.onboardingStatus;
                        if (setupOrganization) {
                            completeProfile();
                        } else {
                            updateLastStep('setupOrganization');

                        }
                    } else if (data.isProfileComplete) {
                        completeProfile();
                    }

                    if (username) saveName(username);
                    signIn(accessToken, refreshToken, userId);
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: response.statusCode === 429 ? (strings.common.tooManyAttemptsTitle || 'Too Many Attempts') : 'Login Failed',
                    text2: response.message || 'Invalid credentials',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: error.message || strings.common.somethingWentWrong,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        setEmail('');
        setPassword('');
        setEmailError('');
        setPasswordError('');
        navigation.navigate('forgotPassword');
    };

    return (
        <CustomBackground>
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
                                    onPress={() => setUserFlow(null)}
                                >
                                    <Image source={backIcon} style={styles.backIcon} />
                                </TouchableOpacity>

                                {/* Logo */}
                                <Image source={applogo} style={styles.logo} />
                            </View>
                            {/* Title */}
                            <AppText style={styles.title}>{strings.common.welcome}</AppText>
                            <AppText style={styles.subtitle}>
                                {strings.auth.client.login.subtitle}
                            </AppText>

                            {/* Form Card */}
                            <View style={styles.formCard}>
                                {/* Email */}
                                <InputField
                                    label={strings.common.emailAddress}
                                    placeholder={strings.common.emailAddress}
                                    value={email}
                                    editable={!isLoading}
                                    onChangeText={(text: string) => {
                                        setEmail(formatEmail(text));
                                        if (emailError) setEmailError('');
                                    }}
                                    wrapperStyle={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={emailError}
                                    errorTextStyle={styles.errorText}
                                    maxLength={60}
                                />

                                {/* Password */}
                                <InputField
                                    label={strings.common.password}
                                    placeholder={strings.common.password}
                                    secureTextEntry
                                    value={password}
                                    editable={!isLoading}
                                    onChangeText={(text: string) => {
                                        setPassword(text);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    wrapperStyle={styles.input}
                                    showPasswordEye={true}
                                    maxLength={20}
                                    error={passwordError}
                                    errorTextStyle={styles.errorText}
                                />
                            </View>
                            {/* Forgot Password */}
                            <TouchableOpacity
                                style={styles.forgotContainer}
                                onPress={handleForgotPassword}
                            >
                                <AppText style={styles.forgot}>{strings.common.forgotPassword}</AppText>
                            </TouchableOpacity>

                            {/* Button */}
                            <LoginButton
                                text={strings.common.login}
                                onPress={handleLogin}
                                loading={isLoading}
                                disabled={isLoading}
                            />

                            {/* Sign Up */}
                            <AppText style={styles.signup}>
                                {strings.common.noAccount}{' '}
                                <AppText
                                    style={styles.signupLink}
                                    onPress={() => {
                                        dismissKeyboardAndThen(() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('signUp'));
                                    }}
                                >
                                    {strings.common.signUp}
                                </AppText>
                            </AppText>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </CustomBackground>
    );
};


export default LoginScreen;
