import React, { useState } from 'react';
import useBlockBackButton from '@hooks/useBlockBackButton';
import {
    View,
    StatusBar,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAuthStackParamList } from '@navigation/client/ClientAuthStack';

import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';

import {
    validateEmail,
    validateFullName,
    validatePassword,
    formatEmail,
} from '@utils/validation';

import { dismissKeyboardAndThen } from '@utils/keyboard';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

import styles from './style';
import strings from '@constants/strings';

import { useAuth } from '@context/AuthContext';
import AuthService from '@config/authService';
import { useUserStore } from '@store/useUserStore';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

type SignUpScreenNavigationProp = NativeStackNavigationProp<
    ClientAuthStackParamList,
    'signUp'
>;

interface SignUpScreenProps {
    navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
    useBlockBackButton();

    const [orgName, setOrgName] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [orgError, setOrgError] = useState('');
    const [fullNameError, setFullNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [termsError, setTermsError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const backIcon = require('@assets/images/common/backIcon.png');
    const applogo = require('@assets/images/app/gigPay.png');

    const { setUserFlow } = useAuth();

    const handleRegister = async () => {
        Keyboard.dismiss();
        const fnError = validateFullName(fullName);
        const pError = validatePassword(password);
        const eError = validateEmail(email);

        let cpError = '';
        let oError = '';
        let tError = '';

        if (!orgName.trim()) {
            oError = strings.validation.fieldMandatory(
                strings.auth.client.signup.orgNameLabel,
            );
        }

        if (password !== confirmPassword) {
            cpError = strings.validation.passwordsMatch;
        }

        if (!termsAccepted) {
            tError = strings.validation.termsRequired;
        }

        setOrgError(oError);
        setFullNameError(fnError);
        setEmailError(eError);
        setPasswordError(pError);
        setConfirmPasswordError(cpError);
        setTermsError(tError);

        if (oError || fnError || pError || cpError || tError || eError) {
            return;
        }

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
                organisationName: orgName,
                contactPersonName: fullName,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                termsAccepted: termsAccepted,
                deviceId,
                deviceType,
 
            };

            if (deviceToken) {
                payload.deviceToken = deviceToken;
            }

            const response = await AuthService.clientRegister(payload);

            if (response.success) {
                const otpId = response.data?.otpId || '';
                const expiresIn = 59;

                useUserStore.getState().setTempFullName(fullName);

                dismissKeyboardAndThen(() =>
                    navigation.navigate('otpverification', {
                        email: email,
                        otpId: otpId,
                        expiresIn: expiresIn,
                        flowType: 'registration',
                    }),
                );
            } else {
                Toast.show({
                    type: 'error',
                    text1: strings.auth.client.signup.registrationFailed,
                    text2:
                        response.message ||
                        strings.auth.contractor.signup.somethingWentWrong,
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2:
                    error.message ||
                    strings.auth.contractor.signup.somethingWentWrong,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.flex1}>
            <StatusBar
                barStyle="dark-content"
                translucent
                backgroundColor="transparent"
            />

            <CustomBackground>
                <KeyboardAvoidingView
                    style={styles.flex1}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                >
                    <View style={styles.flex1}>

                        {/* SCROLL CONTENT */}
                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={styles.container}>

                                    {/* HEADER */}
                                    <View style={styles.header}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => setUserFlow(null)}
                                        >
                                            <Image
                                                source={backIcon}
                                                style={styles.backIcon}
                                            />
                                        </TouchableOpacity>

                                        <Image
                                            source={applogo}
                                            style={styles.logo}
                                        />
                                    </View>

                                    {/* TITLE */}
                                    <AppText style={styles.title}>
                                        {strings.auth.client.signup.screenTitle}
                                    </AppText>

                                    <AppText style={styles.subtitle}>
                                        {strings.auth.client.signup.subtitle}
                                    </AppText>

                                    {/* FORM */}
                                    <View style={styles.formFields}>

                                        {/* ORGANIZATION */}
                                        <InputField
                                            label={
                                                strings.auth.client.signup
                                                    .orgNameLabel
                                            }
                                            placeholder={
                                                strings.mock.techCorporate
                                            }
                                            value={orgName}
                                            editable={!isLoading}
                                            onChangeText={(text) => {
                                                let cleaned = text.replace(
                                                    /[^a-zA-Z0-9\s]/g,
                                                    '',
                                                );

                                                cleaned = cleaned.replace(
                                                    /\s\s+/g,
                                                    ' ',
                                                );

                                                if (cleaned.length > 0) {
                                                    cleaned =
                                                        cleaned.charAt(0).toUpperCase() +
                                                        cleaned.slice(1);
                                                }

                                                setOrgName(cleaned);

                                                if (orgError) {
                                                    setOrgError('');
                                                }
                                            }}
                                            wrapperStyle={styles.inputWrapper}
                                            error={orgError}
                                            errorTextStyle={styles.errorText}
                                            maxLength={50}
                                        />

                                        {/* FULL NAME */}
                                        <InputField
                                            label={
                                                strings.auth.client.signup
                                                    .fullNameLabel
                                            }
                                            placeholder={
                                                strings.mock.kelvinDoe
                                            }
                                            value={fullName}
                                            editable={!isLoading}
                                            onChangeText={(text) => {
                                                let cleaned = text.replace(
                                                    /[^a-zA-Z\s]/g,
                                                    '',
                                                );

                                                cleaned = cleaned.replace(
                                                    /\s\s+/g,
                                                    ' ',
                                                );

                                                if (cleaned.length > 0) {
                                                    cleaned =
                                                        cleaned.charAt(0).toUpperCase() +
                                                        cleaned.slice(1);
                                                }

                                                setFullName(cleaned);

                                                if (fullNameError) {
                                                    setFullNameError('');
                                                }
                                            }}
                                            wrapperStyle={styles.inputWrapper}
                                            error={fullNameError}
                                            errorTextStyle={styles.errorText}
                                            maxLength={50}
                                        />

                                        {/* EMAIL */}
                                        <InputField
                                            label={strings.common.emailAddress}
                                            placeholder={
                                                strings.common.emailAddress
                                            }
                                            value={email}
                                            editable={!isLoading}
                                            onChangeText={(text) => {
                                                setEmail(
                                                    formatEmail(text).trim(),
                                                );

                                                if (emailError) {
                                                    setEmailError('');
                                                }
                                            }}
                                            wrapperStyle={styles.inputWrapper}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            error={emailError}
                                            errorTextStyle={styles.errorText}
                                            maxLength={60}
                                        />

                                        {/* PASSWORD */}
                                        <InputField
                                            label={
                                                strings.auth.client.signup
                                                    .createPasswordLabel
                                            }
                                            placeholder={
                                                strings.mock
                                                    .passwordPlaceholder
                                            }
                                            secureTextEntry
                                            value={password}
                                            editable={!isLoading}
                                            onChangeText={(text) => {
                                                setPassword(text);

                                                if (passwordError) {
                                                    setPasswordError('');
                                                }
                                            }}
                                            wrapperStyle={styles.inputWrapper}
                                            showPasswordEye
                                            maxLength={20}
                                            error={passwordError}
                                            errorTextStyle={styles.errorText}
                                        />

                                        {/* CONFIRM PASSWORD */}
                                        <InputField
                                            label={
                                                strings.auth.client.signup
                                                    .confirmPasswordLabel
                                            }
                                            placeholder={
                                                strings.mock
                                                    .passwordPlaceholder
                                            }
                                            secureTextEntry
                                            value={confirmPassword}
                                            editable={!isLoading}
                                            onChangeText={(text) => {
                                                setConfirmPassword(text);

                                                if (
                                                    confirmPasswordError
                                                ) {
                                                    setConfirmPasswordError('');
                                                }
                                            }}
                                            wrapperStyle={styles.inputWrapper}
                                            showPasswordEye
                                            maxLength={20}
                                            error={confirmPasswordError}
                                            errorTextStyle={styles.errorText}
                                        />
                                    </View>

                                    {/* TERMS */}
                                    <View style={styles.termsRow}>
                                        <TouchableOpacity
                                            style={styles.term}
                                            onPress={() => {
                                                if (!isLoading) {
                                                    setTermsAccepted(
                                                        !termsAccepted,
                                                    );

                                                    if (termsError) {
                                                        setTermsError('');
                                                    }
                                                }
                                            }}
                                            activeOpacity={0.7}
                                            disabled={isLoading}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    termsAccepted &&
                                                    styles.checkboxChecked,
                                                ]}
                                            >
                                                {termsAccepted && (
                                                    <AppText
                                                        style={
                                                            styles.checkmark
                                                        }
                                                    >
                                                        ✓
                                                    </AppText>
                                                )}
                                            </View>
                                        </TouchableOpacity>

                                        <AppText style={styles.termsText}>
                                            {
                                                strings.auth.client.signup
                                                    .agreeTo
                                            }

                                            <AppText
                                                style={styles.termsLink}
                                                onPress={() =>
                                                    navigation.navigate(
                                                        'Information' as any,
                                                        { type: 'terms' },
                                                    )
                                                }
                                            >
                                                {
                                                    strings.auth.client.signup
                                                        .termsAndConditions
                                                }
                                            </AppText>

                                            {
                                                strings.auth.client.signup.and
                                            }

                                            <AppText
                                                style={styles.termsLink}
                                                onPress={() =>
                                                    navigation.navigate(
                                                        'Information' as any,
                                                        { type: 'privacy' },
                                                    )
                                                }
                                            >
                                                {
                                                    strings.auth.client.signup
                                                        .privacyAndPolicy
                                                }
                                            </AppText>
                                        </AppText>
                                    </View>

                                    {/* TERMS ERROR */}
                                    {termsError ? (
                                        <AppText
                                            style={[
                                                styles.errorText,
                                                styles.termsError,
                                            ]}
                                        >
                                            {termsError}
                                        </AppText>
                                    ) : null}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>

                    </View>
                </KeyboardAvoidingView>

                {/* BOTTOM BUTTON */}
                <View style={styles.bottomContainer}>
                    <View style={styles.buttonWrapper}>
                        <LoginButton
                            text={strings.common.register}
                            onPress={handleRegister}
                            loading={isLoading}
                            disabled={isLoading}
                        />
                    </View>

                    <AppText style={styles.loginOption}>
                        {strings.common.alreadyHaveAccount}{' '}
                        <AppText
                            style={styles.loginLink}
                            onPress={() => {
                                dismissKeyboardAndThen(() => {
                                    navigation.canGoBack()
                                        ? navigation.goBack()
                                        : navigation.navigate('login');
                                });
                            }}
                        >
                            {strings.common.logIn}
                        </AppText>
                    </AppText>
                </View>
            </CustomBackground>
        </View>
    );
};

export default SignUpScreen;