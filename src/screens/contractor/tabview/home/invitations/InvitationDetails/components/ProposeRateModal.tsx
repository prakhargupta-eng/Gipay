import React, { useState } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import Fonts from '@assets/Fonts';
import strings, { CURRENCY } from '@constants/strings';
import CustomButton from '@components/CustomButton';
import AppText from '@components/AppText';
import { sanitizeDecimalInput } from '@utils/validation';

interface ProposeRateModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rate: string) => void;
    isLoading?: boolean;
}

const ProposeRateModal: React.FC<ProposeRateModalProps> = ({ visible, onClose, onSubmit, isLoading }) => {
    const [rate, setRate] = useState('');
    const [error, setError] = useState('');
    const s = strings.auth.contractor.jobDetails;

    const handleSubmit = () => {
        if (!rate.trim()) {
            return;
        }
        const numRate = Number(rate);
        if (isNaN(numRate) || numRate <= 0) {
            setError('Please enter a valid rate');
            return;
        }
        setError('');
        onSubmit(rate);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.modalContainer}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <AppText style={styles.modalTitle}>{s.proposeHigherRate}</AppText>
                                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                        <Image
                                            source={require('@assets/images/common/closeIcon.png')}
                                            style={styles.closeIcon}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputSection}>
                                    <AppText style={styles.inputLabel}>{s.proposalRateLabel}</AppText>
                                    <TextInput allowFontScaling={false} style={[styles.input, error ? styles.inputError : null]}
                                        returnKeyType="done"
                                        placeholder={s.proposalRatePlaceholder}
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="decimal-pad"
                                        value={rate ? `${formatCurrency(rate)}` : ''}
                                        maxLength={7}
                                        onChangeText={(text) => {
                                            const cleanText = sanitizeDecimalInput(text, CURRENCY);
                                            setRate(cleanText);
                                            if (error) setError('');
                                        }}
                                    />
                                    {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
                                </View>

                                <CustomButton
                                    title={s.submitProposal}
                                    onPress={handleSubmit}
                                    loading={isLoading}
                                    style={styles.submitBtn}
                                />
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
    },
    modalContainer: {
        width: '100%',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(24),
        width: '100%',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        // Elevation for Android
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    modalTitle: {
        fontSize: fontSize(20),
        fontFamily: Fonts.bold,
        color: colors.textDark,
    },
    closeBtn: {
        padding: horizontalScale(4),
    },
    closeIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        resizeMode: 'contain',
        tintColor: colors.textDark,
    },
    inputSection: {
        marginBottom: verticalScale(24),
    },
    inputLabel: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.textSecondary,
        marginBottom: verticalScale(8),
    },
    input: {
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(12),
        height: verticalScale(56),
        paddingHorizontal: horizontalScale(16),
        fontSize: fontSize(16),
        fontFamily: Fonts.regular,
        color: colors.textDark,
    },
    inputError: {
        borderColor: colors.red,
    },
    errorText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.regular,
        color: colors.red,
        marginTop: verticalScale(4),
        marginLeft: horizontalScale(4),
    },
    submitBtn: {
        backgroundColor: colors.primary,
        borderRadius: horizontalScale(12),
        height: verticalScale(56),
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        fontSize: fontSize(16),
        fontFamily: Fonts.bold,
        color: colors.white,
    },
});

export default ProposeRateModal;
