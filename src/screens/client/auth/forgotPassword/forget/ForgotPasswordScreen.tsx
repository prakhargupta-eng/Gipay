import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAuthStackParamList } from '@navigation/client/ClientAuthStack';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';
import { formatEmail } from '@utils/validation';

import styles from './forgotPasswordStyle';
import AppText from '@components/AppText';

type NavigationProp = NativeStackNavigationProp<ClientAuthStackParamList, 'forgotPassword'>;

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const backIcon = require('@assets/images/common/backIcon.png');
    const applogo = require('@assets/images/app/gigPay.png');

    const handleBack = () => {
        navigation.goBack();
    };

    const validateEmail = (email: string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (!email.trim()) {
            setError(strings.validation.fieldMandatory('Email'));
            return;
        }
        if (!validateEmail(email)) {
            setError(strings.validation.emailInvalid);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await AuthService.forgotPassword({ email, role: 'client' });
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: strings.common.success,
                    text2: response.message || 'OTP sent successfully to your email.'
                });
                const otpId = response.data?._id || response.data?.otpId || '';
                const expiresIn =  59;
                navigation.navigate('verifyCode', { 
                    email, 
                    otpId, 
                    flowType: 'forgotPassword', 
                    expiresIn,
                    role: 'client'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: strings.common.error,
                    text2: response.message || 'Email id not found. Please enter a valid email'
                });
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: err.message || strings.auth.contractor.login.somethingWentWrong
            });
        } finally {
            setIsLoading(false);
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

                                <AppText style={styles.headerTitle}>{strings.auth.client.forgotPassword.screenTitle}</AppText>
                            </View>

                            <View style={styles.formCard}>
                                <InputField
                                    label={strings.auth.client.forgotPassword.emailLabel}
                                    placeholder={strings.auth.client.forgotPassword.emailPlaceholder}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(formatEmail(text));
                                        setError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={error}
                                    editable={!isLoading}
                                    wrapperStyle={styles.input}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <LoginButton
                                    text={strings.auth.contractor.forgotPassword.submit}
                                    onPress={handleSubmit}
                                    loading={isLoading}
                                    disabled={isLoading}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default ForgotPasswordScreen;
