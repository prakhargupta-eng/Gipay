import React, { useRef } from 'react';
import CustomToast from '@components/CustomToast';
import { View, StyleSheet, Modal, TouchableOpacity, StatusBar } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import AuthService from '@config/authService';
import { ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import AppText from '@components/AppText';
import { Toast } from '@utils/ToastManager';

interface DeletePopupProps {
    visible: boolean;
    onClose: () => void;
}

const DeletePopup: React.FC<DeletePopupProps> = ({ visible, onClose }) => {
    const { signOut } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const toastRef = useRef<any>(null);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await AuthService.deleteAccount();
            if (response.success) {
                onClose();
                signOut();
                Toast.show({
                    type: 'success',
                    text1: strings.common.success,
                    text2: strings.common.deleteAccountSuccess,
                });
            } else {
                toastRef.current?.show({ type: 'error',
                    text2: response.message || strings.common.deleteAccountFailed,
                });
            }
        } catch (error: any) {
            toastRef.current?.show({ type: 'error',
                text1: strings.common.error,
                text2: error.message || strings.common.somethingWentWrong,
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <LottieView
                            source={require('@assets/animation/Delete icon animation.json')}
                            style={styles.popupIcon}
                            autoPlay
                            loop
                        />
                    </View>
                    
                    <AppText style={styles.message}>{strings.common.deleteAccountConfirmation}</AppText>
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={styles.noBtn} 
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <AppText style={styles.noText}>{strings.common.no}</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.yesBtn, isLoading && { opacity: 0.8 }]} 
                            onPress={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <AppText style={styles.yesText}>{strings.common.yes}</AppText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
          <CustomToast ref={toastRef} />
</Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: "90%",
        backgroundColor: colors.white,
        borderRadius: horizontalScale(30),
        padding: horizontalScale(24),
        alignItems: 'center',
    },
    iconContainer: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        marginBottom: verticalScale(20),
    },
    popupIcon: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    message: {
        fontSize: fontSize(18),
        fontFamily: fonts.medium,
        color: colors.black,
        textAlign: 'center',
        marginBottom: verticalScale(32),
        paddingHorizontal: horizontalScale(10),
    },
    buttonRow: {
        flexDirection: 'row',
        gap: horizontalScale(15),
        width: '100%',
    },
    noBtn: {
        flex: 1,
        height: verticalScale(52),
        borderRadius: horizontalScale(10),
        borderWidth: 1.5,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    yesBtn: {
        flex: 1,
        height: verticalScale(52),
        backgroundColor: colors.primary,
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    yesText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.white,
    },
});

export default DeletePopup;
