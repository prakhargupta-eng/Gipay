import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import LottieView from 'lottie-react-native';
import AppText from '@components/AppText';

interface KycRejectedPopupProps {
    visible: boolean;
    onClose: () => void;
    onReKyc: () => void;
}

const KycRejectedPopup: React.FC<KycRejectedPopupProps> = ({
    visible,
    onClose,
    onReKyc,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Image 
                            source={require('@assets/images/common/closeIcon.png')} 
                            style={styles.closeIcon} 
                        />
                    </TouchableOpacity>

                    <View style={styles.errorIconContainer}>
                        <LottieView
                            source={require('@assets/animation/cross.json')}
                            style={styles.errorIcon}
                            autoPlay
                            loop={false}
                        />
                    </View>

                    <AppText style={styles.popupTitle}>KYC Verification Failed</AppText>
                    <AppText style={styles.popupDescription}>
                        Your identity verification has failed. Please submit your documents again to unlock access to jobs.
                    </AppText>

                    <View style={styles.modalButtonRow}>
                        <TouchableOpacity 
                            style={styles.cancelBtn} 
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <AppText style={styles.cancelBtnText}>Cancel</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.reKycBtn} 
                            onPress={onReKyc}
                            activeOpacity={0.7}
                        >
                            <AppText style={styles.reKycBtnText}>Re-KYC</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(30),
        padding: horizontalScale(24),
        alignItems: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: verticalScale(16),
        right: horizontalScale(16),
        zIndex: 10,
    },
    closeIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        tintColor: '#9CA3AF',
    },
    errorIconContainer: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        marginBottom: verticalScale(16),
    },
    errorIcon: {
        width: '100%',
        height: '100%',
    },
    popupTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: '#1E1B4B',
        marginBottom: verticalScale(10),
        textAlign: 'center',
    },
    popupDescription: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: fontSize(20),
        marginBottom: verticalScale(24),
        paddingHorizontal: horizontalScale(10),
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: horizontalScale(15),
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: verticalScale(52),
        borderRadius: horizontalScale(16),
        borderWidth: 1.5,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    reKycBtn: {
        flex: 1,
        height: verticalScale(52),
        backgroundColor: colors.primary,
        borderRadius: horizontalScale(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    reKycBtnText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.white,
    },
});

export default KycRejectedPopup;
