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
  Keyboard,
  RefreshControl,
  AppState
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAuthStackParamList } from '@navigation/contractor/ContractorAuthStack';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import {
    formatEmail,
    validateEmail,
    validateFullName,
    validatePassword,
} from '@utils/validation';
import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';
import fonts from '@assets/Fonts';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import Colors from '@styles/colors';
import AppText from '@components/AppText';
import colors from '@styles/colors';
import { devDebugger } from '@utils/devDebugger';

type ContractorSignUpScreenNavigationProp = NativeStackNavigationProp<ContractorAuthStackParamList, 'ContractorSignup'>;

interface ContractorSignUpScreenProps {
    navigation: ContractorSignUpScreenNavigationProp;
}

const ContractorSignUpScreen: React.FC<ContractorSignUpScreenProps> = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [fullNameError, setFullNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [termsError, setTermsError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { setUserFlow } = useAuth();
    const backIcon = require('@assets/images/common/backIcon.png');
    const applogo = require('@assets/images/app/gigPay.png');

    const handleRegister = async () => {
        Keyboard.dismiss();
        const fnError = validateFullName(fullName);
        const eError = validateEmail(email);
        const pError = validatePassword(password);
        let cpError = '';
        let tError = '';

        if (password !== confirmPassword) {
            cpError = strings.validation.passwordsMatch;
        }

        if (!termsAccepted) {
            tError = strings.validation.termsRequired;
        }

        setFullNameError(fnError);
        setEmailError(eError);
        setPasswordError(pError);
        setConfirmPasswordError(cpError);
        setTermsError(tError);

        if (fnError || eError || pError || cpError || tError) {
            return;
        }

        setIsLoading(true);
        try {
            const trimmedName = fullName.trim().replace(/\s+/g, ' ');
            let deviceToken = undefined;
            try {
                deviceToken = await messaging().getToken();
            } catch (e) {
                devDebugger.log('Failed to fetch device token', e);
            }

            const deviceId = await DeviceInfo.getUniqueId();
            const deviceType = Platform.OS;

            const payload: any = {
                fullName: trimmedName,
                email: email,
                password: password,
                termsAccepted: termsAccepted,
                deviceId,
                deviceType,
            };

            if (deviceToken) {
                payload.deviceToken = deviceToken;
            }

            const response = await AuthService.register(payload);

            if (response.success) {
                const otpId = response.data?.otpId || '';
                const expiresIn = 59;
                Keyboard.dismiss();
                navigation.navigate('ContractorOTP', { email, otpId, expiresIn });
            } else {
                Toast.show({
                    type: 'error',
                    text1: strings.auth.contractor.signup.registrationFailed,
                    text2: response.message || strings.auth.contractor.signup.somethingWentWrong,
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: error.message || strings.auth.contractor.signup.somethingWentWrong,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setIsRefreshing(true);
        // Clear all fields
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTermsAccepted(false);
        // Clear errors
        setFullNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setTermsError('');

        setTimeout(() => setIsRefreshing(false), 1000);
    }, []);

    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                Keyboard.dismiss();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <CustomBackground>
                <KeyboardAvoidingView
                    style={styles.root}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                >
                    <View style={styles.root}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={styles.container}>
                                    <View style={styles.header}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => setUserFlow(null)}
                                        >
                                            <Image source={backIcon} style={styles.backIcon} />
                                        </TouchableOpacity>

                                        <Image source={applogo} style={styles.logo} />
                                    </View>

                                <AppText style={styles.title}>{strings.auth.client.signup.screenTitle}</AppText>
                                <AppText style={styles.subtitle}>
                                    {strings.auth.contractor.signup.subtitle}
                                </AppText>

                                <View style={styles.formFields}>
                                    <InputField
                                        label={strings.auth.contractor.signup.fullName}
                                        placeholder={strings.auth.contractor.signup.fullNamePlaceholder}
                                        value={fullName}
                                        editable={!isLoading}
                                        onChangeText={(text) => {
                                            let cleaned = text.replace(/[^a-zA-Z\s]/g, '');
                                            cleaned = cleaned.replace(/\s\s+/g, ' ');
                                            if (cleaned.length > 0) {
                                                cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                                            }
                                            setFullName(cleaned);
                                            if (fullNameError) setFullNameError('');
                                        }}
                                        wrapperStyle={styles.inputWrapper}
                                        error={fullNameError}
                                        errorTextStyle={styles.errorText}
                                        maxLength={60}
                                    />

                                    <InputField
                                        label={strings.common.emailAddress}
                                        placeholder={strings.common.emailAddress}
                                        value={email}
                                        editable={!isLoading}
                                        onChangeText={(text) => {
                                            setEmail(formatEmail(text).trim());
                                            if (emailError) setEmailError('');
                                        }}
                                        wrapperStyle={styles.inputWrapper}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        error={emailError}
                                        errorTextStyle={styles.errorText}
                                        maxLength={60}
                                    />


                                    <InputField
                                        label={strings.auth.contractor.signup.password}
                                        placeholder={strings.auth.contractor.signup.passwordPlaceholder}
                                        secureTextEntry
                                        value={password}
                                        editable={!isLoading}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        wrapperStyle={styles.inputWrapper}
                                        showPasswordEye={true}
                                        maxLength={20}
                                        error={passwordError}
                                        errorTextStyle={styles.errorText}
                                    />

                                    <InputField
                                        label={strings.auth.contractor.signup.confirmPassword}
                                        placeholder={strings.auth.contractor.signup.passwordPlaceholder}
                                        secureTextEntry
                                        value={confirmPassword}
                                        editable={!isLoading}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (confirmPasswordError) setConfirmPasswordError('');
                                        }}
                                        wrapperStyle={styles.inputWrapper}
                                        showPasswordEye={true}
                                        maxLength={20}
                                        error={confirmPasswordError}
                                        errorTextStyle={styles.errorText}
                                    />
                                </View>

                                <View style={styles.termsContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (!isLoading) {
                                                setTermsAccepted(!termsAccepted);
                                                if (termsError) setTermsError('');
                                            }
                                        }}
                                        activeOpacity={0.7}
                                        disabled={isLoading}
                                    >
                                        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                                            {termsAccepted && <AppText style={styles.checkmark}>✓</AppText>}
                                        </View>
                                    </TouchableOpacity>
                                    <AppText style={styles.termsText}>
                                        {strings.auth.contractor.signup.acceptTermsPrefix}
                                        <AppText
                                            style={styles.termsLink}
                                            onPress={() => navigation.navigate('Information' as any, { type: 'terms' })}
                                        >
                                            {strings.auth.contractor.signup.termsAndConditionsLink}
                                        </AppText>
                                        {' '}and{' '}
                                        <AppText
                                            style={styles.termsLink}
                                            onPress={() => navigation.navigate('Information' as any, { type: 'privacy' })}
                                        >
                                            {strings.auth.contractor.signup.privacyAndPolicyLink}
                                        </AppText>
                                    </AppText>
                                </View>

                                {termsError ? <AppText style={[styles.errorText, { marginLeft: 0 }]}>{termsError}</AppText> : null}
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>

                    </View>
                </KeyboardAvoidingView>

                <View style={styles.bottomContainer}>
                    <View style={styles.buttonWrapper}>
                        <LoginButton
                            text={strings.auth.contractor.signup.createAccount}
                            onPress={handleRegister}
                            loading={isLoading}
                            disabled={isLoading}
                        />
                    </View>

                    <View style={styles.loginRow}>
                        <AppText style={styles.loginText}>{strings.common.alreadyHaveAccount}</AppText>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ContractorLogin')}
                            hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
                            style={styles.loginLinkTouch}
                            disabled={isLoading}
                        >
                            <AppText style={styles.loginLink}>{strings.common.logIn}</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(20),
        width: '100%',
    },
    logo: {
        width: verticalScale(196),
        height: horizontalScale(40),
        resizeMode: 'contain',
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
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: verticalScale(30),
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 6,
        textAlign: 'center',
        marginBottom: verticalScale(20),
    },
    formFields: {
        width: '100%',

    },
    inputWrapper: {
        marginBottom: verticalScale(5),
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(20),
        marginBottom: verticalScale(10),
    },
    termsTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
        backgroundColor: '#5A3FFF',
        borderColor: '#5A3FFF',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 14,
        color: '#9CA3AF',
        flex: 1,
        fontFamily: fonts.regular
    },
    termsLink: {
        color: '#5A3FFF',
        fontFamily: fonts.semiBold,
        fontSize: fontSize(12),
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: 10,
        backgroundColor: 'transparent',
    },
    buttonWrapper: {
        marginTop: 0,
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(14),
    },
    loginText: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    loginLink: {
        color: '#5A3FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    loginLinkTouch: {
        height: 44,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    errorText: {
        color: 'red',
        fontSize: 11,
        marginBottom: 10,
        marginLeft: 10,
    },
});

export default ContractorSignUpScreen;
