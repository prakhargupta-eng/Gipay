import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import InputField from '@components/InputField';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { useAuth } from '@context/AuthContext';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const { signOut } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Validation States
    const validations = {
        minChar: newPassword.length >= 8,
        upperCase: /[A-Z]/.test(newPassword),
        lowerCase: /[a-z]/.test(newPassword),
        digit: /[0-9]/.test(newPassword),
        specialChar: /[@#$%^&*]/.test(newPassword),
    };

    const handleSave = async () => {
        // Reset errors
        const newErrors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        let hasError = false;

        if (!currentPassword) {
            newErrors.currentPassword = 'Old password is required';
            hasError = true;
        }
        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
            hasError = true;
        } else {
            const isPasswordStrong = Object.values(validations).every(v => v);
            if (!isPasswordStrong) {
                newErrors.newPassword = 'Password does not meet requirements';
                hasError = true;
            }
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });

        setIsLoading(true);
        try {
            const response = await AuthService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (response.success) {
                Alert.alert(
                    "Success",
                    strings.common.passwordChangedLogout,
                    [
                        {
                            text: "Logout",
                            onPress: () => signOut()
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                Toast.show({
                    type: 'error',
                    text2: response.message || 'Failed to change password',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Something went wrong',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const ValidationItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
        <View style={styles.validationRow}>
            <AppText style={[styles.bullet, { color: isValid ? '#22C55E' : '#EF4444' }]}>•</AppText>
            <AppText style={[styles.validationText, { color: isValid ? '#22C55E' : '#EF4444' }]}>
                {label}
            </AppText>
        </View>
    );

    return (
        <View style={styles.root}>
            <View style={{ flex: 1 }}>
                <TopHeader
                    title="Change Password"
                    onBack={() => navigation.goBack()}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.form}>
                            <InputField
                                label="Old Password"
                                placeholder="Enter Old Password"
                                value={currentPassword}
                                onChangeText={(text) => {
                                    setCurrentPassword(text);
                                    setErrors({ ...errors, currentPassword: '' });
                                }}
                                secureTextEntry
                                showPasswordEye
                                maxLength={100}
                                wrapperStyle={styles.inputWrapper}
                                error={errors.currentPassword}
                            />

                            <InputField
                                label="New Password"
                                placeholder="Enter New Password"
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    setErrors({ ...errors, newPassword: '' });
                                }}
                                secureTextEntry
                                showPasswordEye
                                maxLength={100}
                                wrapperStyle={styles.inputWrapper}
                                error={errors.newPassword}
                            />

                            <InputField
                                label="Confirm New Password"
                                placeholder="Enter Confirm New Password"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setErrors({ ...errors, confirmPassword: '' });
                                }}
                                secureTextEntry
                                showPasswordEye
                                maxLength={100}
                                wrapperStyle={styles.inputWrapper}
                                error={errors.confirmPassword}
                            />

                            <View style={styles.noteContainer}>
                                <AppText style={styles.noteTitle}>Note: Your Password is strong :</AppText>
                                <ValidationItem
                                    label="Minimum character should be 8."
                                    isValid={validations.minChar}
                                />
                                <ValidationItem
                                    label="At least one upper case letter (A-Z)."
                                    isValid={validations.upperCase}
                                />
                                <ValidationItem
                                    label="At least one lower case letter (a-z)."
                                    isValid={validations.lowerCase}
                                />
                                <ValidationItem
                                    label="There should be one digit (0-9)."
                                    isValid={validations.digit}
                                />
                                <ValidationItem
                                    label="At least one special character (e.g. @, #, $, %, &, *)"
                                    isValid={validations.specialChar}
                                />
                            </View>
                        </View>
                    </ScrollView>


                </KeyboardAvoidingView>
                <View style={styles.footer}>
                    <CustomButton
                        title={"Save Changes"}
                        onPress={handleSave}
                        textStyle={styles.saveBtnText}
                        style={styles.saveBtn}
                        disabled={isLoading}
                        loading={isLoading}
                    />

                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(40),
    },
    form: {
        flex: 1,
    },
    inputWrapper: {
        marginBottom: verticalScale(16),
        flex: 0, // Ensure it doesn't take up extra space
    },
    noteContainer: {
        marginTop: verticalScale(8),
    },
    noteTitle: {
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: '#4B5563',
        marginBottom: verticalScale(10),
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    bullet: {
        fontSize: fontSize(20),
        marginRight: horizontalScale(10),
        lineHeight: fontSize(20),
    },
    validationText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        lineHeight: fontSize(20),
    },
    footer: {
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(30),
        paddingTop: verticalScale(10),
    },
    saveBtn: {
        backgroundColor: colors.primary, // Dark navy/blue as per mockup
        height: verticalScale(52),
        borderRadius: horizontalScale(12),
    },
    saveBtnText: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.white,
    }
});

export default ChangePasswordScreen;
