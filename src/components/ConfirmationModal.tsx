import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    cancelText?: string;
    confirmText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmationModal = ({
    visible,
    title,
    message,
    cancelText = 'Cancel',
    confirmText = 'Delete',
    onCancel,
    onConfirm
}: ConfirmationModalProps) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <AppText style={styles.title}>{title}</AppText>
                    <AppText style={styles.message}>{message}</AppText>
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <AppText style={styles.cancelButtonText}>{cancelText}</AppText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.confirmButton]} 
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <AppText style={styles.confirmButtonText}>{confirmText}</AppText>
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
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(30),
    },
    container: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(24),
        alignItems: 'center',
    },
    title: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(12),
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: verticalScale(24),
        lineHeight: verticalScale(20),
    },
    buttonRow: {
        flexDirection: 'row',
        gap: horizontalScale(12),
        width: '100%',
    },
    button: {
        flex: 1,
        height: verticalScale(48),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    confirmButton: {
        backgroundColor: colors.red,
    },
    cancelButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: '#6B7280',
    },
    confirmButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.white,
    },
});

export default ConfirmationModal;
