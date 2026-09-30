import React, { useState } from 'react';
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
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import CustomBackground from '@components/CustomBackground';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';

import styles from './resetPasswordStyle';
import AppText from '@components/AppText';

type NavigationProp = NativeStackNavigationProp<ClientAuthStackParamList, 'resetPassword'>;
type ResetPasswordRouteProp = RouteProp<ClientAuthStackParamList, 'resetPassword'>;

const ResetPasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ResetPasswordRouteProp>();
    const { email, otpId } = route.params;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const backIcon = require('@assets/images/common/backIcon.png');

    const handleBack = () => {
        navigation.goBack();
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        // Password complexity rules
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        
        if (!newPassword) {
            newErrors.newPassword = strings.validation.passwordRequired;
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Minimum character should be 8';
        } else if (!passwordRegex.test(newPassword)) {
            newErrors.newPassword = 'At least one uppercase, lowercase, digit, and special character required';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = strings.validation.fieldMandatory('Confirm Password');
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = strings.validation.passwordsMatch;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        Keyboard.dismiss();
        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await AuthService.resetPassword({
                email,
                newPassword,
                confirmPassword,
                otpId: otpId,
                role: 'client'
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: strings.common.success,
                    text2: 'Password reset successfully'
                });
                navigation.pop(3);  
            } else {
                Toast.show({
                    type: 'error',
                    text1: strings.common.error,
                    text2: response.message || 'Failed to reset password'
                });
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: err.message || 'Something went wrong'
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

                                <AppText style={styles.headerTitle}>{strings.auth.client.resetPassword.screenTitle}</AppText>
                            </View>

                            <View style={styles.formCard}>
                                <InputField
                                    label={strings.auth.client.resetPassword.newPasswordLabel}
                                    placeholder={strings.auth.client.resetPassword.newPasswordPlaceholder}
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        setErrors(prev => ({ ...prev, newPassword: '' }));
                                    }}
                                    secureTextEntry={true}
                                    showPasswordEye={true}
                                    error={errors.newPassword}
                                    editable={!isLoading}
                                    wrapperStyle={styles.input}
                                />

                                {/* Password Checklist */}
                                <View style={styles.checklistContainer}>
                                    <AppText style={styles.checklistTitle}>{strings.auth.client.resetPassword.checklist.title}</AppText>
                                    <View style={styles.checkItem}>
                                        <AppText style={[styles.checkText, newPassword.length >= 8 ? styles.met : styles.unmet]}>
                                            • {strings.auth.client.resetPassword.checklist.minChar}
                                        </AppText>
                                    </View>
                                    <View style={styles.checkItem}>
                                        <AppText style={[styles.checkText, /[A-Z]/.test(newPassword) ? styles.met : styles.unmet]}>
                                            • {strings.auth.client.resetPassword.checklist.upperCase}
                                        </AppText>
                                    </View>
                                    <View style={styles.checkItem}>
                                        <AppText style={[styles.checkText, /[a-z]/.test(newPassword) ? styles.met : styles.unmet]}>
                                            • {strings.auth.client.resetPassword.checklist.lowerCase}
                                        </AppText>
                                    </View>
                                    <View style={styles.checkItem}>
                                        <AppText style={[styles.checkText, /\d/.test(newPassword) ? styles.met : styles.unmet]}>
                                            • {strings.auth.client.resetPassword.checklist.digit}
                                        </AppText>
                                    </View>
                                    <View style={styles.checkItem}>
                                        <AppText style={[styles.checkText, /[@$!%*?&#]/.test(newPassword) ? styles.met : styles.unmet]}>
                                            • {strings.auth.client.resetPassword.checklist.specialChar}
                                        </AppText>
                                    </View>
                                </View>

                                <InputField
                                    label={strings.auth.client.resetPassword.confirmPasswordLabel}
                                    placeholder={strings.auth.client.resetPassword.confirmPasswordPlaceholder}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                    }}
                                    secureTextEntry={true}
                                    showPasswordEye={true}
                                    error={errors.confirmPassword}
                                    editable={!isLoading}
                                    wrapperStyle={styles.input}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <LoginButton 
                                    text={strings.auth.client.resetPassword.submit} 
                                    onPress={handleResetPassword} 
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

export default ResetPasswordScreen;
