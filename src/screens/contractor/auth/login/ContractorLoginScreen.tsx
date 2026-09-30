import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAuthStackParamList } from '../../../../navigation/contractor/ContractorAuthStack';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import { verticalScale, horizontalScale } from '@styles/mixins';
import { formatEmail, validateEmail, validatePassword } from '@utils/validation';
import { useAuth } from '@context/AuthContext';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import Fonts from '@assets/Fonts';
import { dismissKeyboardAndThen } from '@utils/keyboard';
import AppText from '@components/AppText';
import { setNotificationEnabled } from '@store/storage';
import { devDebugger } from '@utils/devDebugger';

type ContractorLoginScreenNavigationProp = NativeStackNavigationProp<ContractorAuthStackParamList, 'ContractorLogin'>;

interface ContractorLoginScreenProps {
    navigation: ContractorLoginScreenNavigationProp;
}

const ContractorLoginScreen: React.FC<ContractorLoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, completeProfile, preferredAuthScreen, setUserFlow, updateLastStep } = useAuth();
    const backIcon = require('@assets/images/common/backIcon.png');
    const applogo = require('@assets/images/app/gigPay.png');

    React.useEffect(() => {
        if (preferredAuthScreen === 'signup') {
            navigation.navigate('ContractorSignup');
            // Reset to prevent loop if user comes back to login
            setUserFlow('contractor', 'login');
        }
    }, [preferredAuthScreen]);

    const handleLogin = async () => {

        Keyboard.dismiss();
        const eError = validateEmail(email);
        const pError = validatePassword(password);

        if (eError || pError) {
            setEmailError(eError);
            setPasswordError(pError);
            return;
        }

        setEmailError('');
        setPasswordError('');
        setIsLoading(true);
        dismissKeyboardAndThen(async () => {
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
                    type: 'contractor',
                    email: email,
                    password: password,
                    deviceId,
                    deviceType,
                };

                if (deviceToken) {
                    payload.deviceToken = deviceToken;
                }

                const response = await AuthService.login(payload);

                if (response.success && response.data) {
                    const data = response.data;
                    const accessToken = data.token || '';
                    const refreshToken = data.refreshToken
                    const userId = data?._id || data?.userId?.toString() || '';

                    devDebugger.log('🚪 [Login] Contractor Login Successful!');
                    devDebugger.log('🎫 [Login] Access Token received');
                    devDebugger.log('🔁 [Login] Refresh Token received:', refreshToken);

                    if (data.notificationEnabled !== undefined) {
                        setNotificationEnabled(data.notificationEnabled);
                    }

                    // Handle Onboarding Redirection
                    if (data.onboardingStatus) {
                        const status = data.onboardingStatus;
                        if (status.identity === false) {
                            updateLastStep('CompleteProfileStep1');
                        // } else if (status.isKyc === false) {
                        //     updateLastStep('CompleteProfileStep2');
                         } 
                        else if (status.profile === false) {
                            updateLastStep('CompleteProfileStep3');
                        } else if (status.documents === false) {
                            updateLastStep('CompleteProfileStep4');
                        } else {
                            completeProfile();
                        }
                    } else if (data.onboardingStep === 'PROFILE_COMPLETED' || data.isProfileComplete) {
                        completeProfile();
                    }

                    signIn(accessToken, refreshToken, userId);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: response.statusCode === 429 ? (strings.common.tooManyAttemptsTitle || 'Too Many Attempts') : strings.common.error,
                        text2: response.message || strings.auth.contractor.login.invalidCredentials || 'Invalid credentials',
                    });
                }
            } catch (error: any) {
                Toast.show({
                    type: 'error',
                    text1: strings.common.error,
                    text2: error.message || strings.auth.contractor.login.somethingWentWrong || strings.common.somethingWentWrong,
                });
            } finally {
                setIsLoading(false);
            }
        })
    };

    return (
        <CustomBackground>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
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

                                <Image source={applogo} style={styles.logo} />
                            </View>

                            <AppText style={styles.title}>{strings.common.welcome}</AppText>
                            <AppText style={styles.subtitle}>
                                {strings.auth.contractor.login.subtitle}
                            </AppText>

                            <View style={styles.formCard}>
                                <InputField
                                    label={strings.common.emailId}
                                    placeholder={strings.common.emailId}
                                    value={email}
                                    editable={!isLoading}
                                    onChangeText={(text) => {
                                        setEmail(formatEmail(text));
                                        if (emailError) setEmailError('');
                                    }}
                                    wrapperStyle={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    error={emailError}
                                    errorTextStyle={styles.errorText}
                                    maxLength={60}
                                />

                                <InputField
                                    label={strings.common.password}
                                    placeholder={strings.common.password}
                                    secureTextEntry
                                    value={password}
                                    editable={!isLoading}
                                    onChangeText={(text) => {
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

                            <TouchableOpacity
                                style={{ alignSelf: 'flex-end', marginTop: verticalScale(10), marginBottom: verticalScale(20), height: 30, justifyContent: 'center' }}
                                onPress={() => {
                                    setEmail('');
                                    setPassword('');
                                    setEmailError('');
                                    setPasswordError('');
                                    navigation.navigate('ForgotPassword');
                                }}
                            >
                                <AppText style={[styles.forgot, { marginTop: 0, marginBottom: 0, alignSelf: 'auto' }]}>{strings.common.forgotPassword}</AppText>
                            </TouchableOpacity>

                            <LoginButton
                                text={strings.common.login}
                                onPress={handleLogin}
                                loading={isLoading}
                                disabled={isLoading}
                            />

                            <View style={styles.signupRow}>
                                <AppText style={styles.signupText}>{strings.common.noAccount}</AppText>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('ContractorSignup')}
                                    hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
                                    style={styles.signupLinktouch}
                                >
                                    <AppText style={styles.signupLink}>{strings.common.signUp}</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </CustomBackground>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    logo: {
        width: verticalScale(196),
        height: horizontalScale(40),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: verticalScale(56),
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 6,
        textAlign: 'center',
    },
    formCard: {
        marginTop: verticalScale(24),
        minHeight: verticalScale(160),
    },
    input: {
        marginBottom: verticalScale(10),
    },
    forgot: {
        alignSelf: 'flex-end',
        color: '#5A3FFF',
        marginTop: verticalScale(10),
        marginBottom: verticalScale(20),
        fontSize: 13,
    },
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(20),
    },
    signupText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontFamily: Fonts.regular,
    },
    signupLink: {
        color: '#5A3FFF',
        fontSize: 13,
        fontFamily: Fonts.regular
    },
    errorText: {
        color: 'red',
        fontSize: 11,
        marginTop: 5,
        marginLeft: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(40),
        width: '100%',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
    },
    backIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    signupLinktouch: {
        height: 44,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
});


export default ContractorLoginScreen;
