import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import LottieView from 'lottie-react-native';
import AppText from '@components/AppText';

interface ConfirmationPopupProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    subMessage?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    animationSource?: any;
    isDestructive?: boolean;
    hideCancelButton?: boolean;
    animationStyle?: any;
    iconContainerStyle?: any;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
    visible,
    onClose,
    onConfirm,
    message,
    subMessage,
    confirmText = 'Yes',
    cancelText = 'No',
    isLoading = false,
    animationSource,
    isDestructive = false,
    hideCancelButton = false,
    animationStyle,
    iconContainerStyle,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {animationSource && (
                        <View style={[styles.iconContainer, iconContainerStyle]}>
                            <LottieView
                                source={animationSource}
                                style={[styles.popupIcon, animationStyle]}
                                autoPlay
                                loop
                            />
                        </View>
                    )}
                    
                    <AppText style={[styles.message, subMessage ? { marginBottom: verticalScale(10) } : {}]}>{message}</AppText>
                    {subMessage && (
                        <AppText style={styles.subMessage}>{subMessage}</AppText>
                    )}
                    
                    <View style={styles.buttonRow}>
                        {!hideCancelButton && (
                            <TouchableOpacity 
                                style={styles.noBtn} 
                                onPress={onClose}
                                disabled={isLoading}
                            >
                                <AppText style={styles.noText}>{cancelText}</AppText>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[
                                styles.yesBtn, 
                                isDestructive && { },
                                isLoading && { opacity: 0.8 }
                            ]} 
                            onPress={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <AppText style={styles.yesText}>{confirmText}</AppText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        width: '90%',
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
        fontSize: fontSize(22),
        fontFamily: fonts.medium,
        color: colors.black,
        textAlign: 'center',
        marginBottom: verticalScale(32),
        paddingHorizontal: horizontalScale(10),
    },
    subMessage: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
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

export default ConfirmationPopup;
