import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React, { useState ,useRef } from 'react';
import CustomToast from '@components/CustomToast';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import strings from '@constants/strings';
import CustomButton from '@components/CustomButton';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import { sanitizeDecimalInput } from '@utils/validation';

interface NegotiatePopupProps {
    visible: boolean;
    onClose: () => void;
    applicationId: string;
    candidateName: string;
    originalOffer: string;
    proposedOffer: string;
    initialCounterOffer?: string;
    isNegotiate?: boolean;
    isHide?: boolean;
    onSuccess?: () => void;
}

const NegotiatePopup: React.FC<NegotiatePopupProps> = ({
    visible,
    onClose,
    candidateName,
    originalOffer,
    proposedOffer,
    initialCounterOffer,
    isNegotiate,
    isHide,
    applicationId,
    onSuccess
}) => {
    const t = strings.client.jobMatches;
    const [counterOffer, setCounterOffer] = useState('');
  const toastRef = useRef<any>(null);
    const [actionLoading, setActionLoading] = useState<'counter' | 'accept' | null>(null);

    React.useEffect(() => {
        if (visible) {
            const initialVal = initialCounterOffer || '';
            const cleanText = sanitizeDecimalInput(initialVal, CURRENCY);
            setCounterOffer(cleanText ? `${formatCurrency(cleanText)}` : '');
        }
    }, [visible, initialCounterOffer]);

    const handleTextChange = (text: string) => {
        const cleanText = sanitizeDecimalInput(text, CURRENCY);
        if (cleanText === '') {
            setCounterOffer('');
        } else {
            setCounterOffer(`${formatCurrency(cleanText)}`);
        }
    };

    const handleAction = async (action: 'counter' | 'accept') => {
        if (!applicationId) return;
        setActionLoading(action);
        try {
            let res;
            if (action === 'accept') {
                res = await JobService.acceptMatch(applicationId);
            } else {
                const numericRate = Number(String(counterOffer).replace(/[^0-9.]/g, ''));
                res = await JobService.sendMatchCounterOffer(applicationId, { counterOfferRate: numericRate });
            }

            if (res.success) {
                Toast.show({ type: 'success', text2: res.message || `Match ${action === 'accept' ? 'accepted' : 'counter offered'} successfully!` });
                onSuccess?.();
            } else {
                toastRef.current?.show({ type: 'error', text2: res.message || `Failed to process request` });
            }
        } catch (error: any) {
            toastRef.current?.show({ type: 'error', text2: error.message || `An error occurred` });
        } finally {
            setActionLoading(null);
        }
    };
    
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText style={styles.title}>{t.negotiateRate}</AppText>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Image source={require('@assets/images/common/closeIcon.png')} style={styles.closeIcon} />
                        </TouchableOpacity>
                    </View>
                    
                    <AppText style={styles.subtitle}>
                        {t.enterCounterOfferFor} <AppText style={{ fontFamily: fonts.bold }}>{candidateName}</AppText>
                    </AppText>

                    {/* Original Offer */}
                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>{t.originalOffer}</AppText>
                        <View style={[styles.inputBox, styles.disabledInput]}>
                            <AppText style={styles.inputText}>{originalOffer}</AppText>
                        </View>
                    </View>

                    {/* Proposed Offer */}
                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>{t.proposedOfferRate}</AppText>
                        <View style={[styles.inputBox, styles.disabledInput]}>
                            <AppText style={styles.inputText}>{proposedOffer}</AppText>
                        </View>
                    </View>

                    {/* Counter Offer */}
                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>{t.counterOfferRate}</AppText>
                        <TextInput allowFontScaling={false} style={[styles.inputBox, (isNegotiate || isHide) && styles.disabledInput]}
                            returnKeyType="done"
                            placeholder={t.enterCounterOfferRate}
                            placeholderTextColor={colors.gray}
                            keyboardType="decimal-pad"
                            maxLength={7}
                            value={counterOffer}
                            onChangeText={handleTextChange}
                            editable={!isNegotiate && !isHide}
                        />
                    </View>

                    {/* Actions */}
                    {!isNegotiate && !isHide && (
                        <View style={styles.buttonRow}>
                        <CustomButton 
                            title={t.counterOfferBtn}
                            loading={actionLoading === 'counter'}
                            onPress={() => handleAction('counter')}
                            disabled={!!actionLoading || !counterOffer || counterOffer.trim() === ''}
                            style={{ 
                                flex: 1, 
                                borderWidth: 1, 
                                borderColor: (!counterOffer || counterOffer.trim() === '') ? colors.gray : colors.primary 
                            }}
                            textStyle={{
                                ...styles.counterText, 
                                color: (!counterOffer || counterOffer.trim() === '') ? colors.gray : colors.primary 
                            }}
                            gradientColors={[colors.white, colors.white]}
                        />
                                <CustomButton
                                    title={t.accept}
                                    loading={actionLoading === 'accept'}
                                    onPress={() => handleAction('accept')}
                                    disabled={!!actionLoading || counterOffer.trim() !== ''}
                                    style={{ flex: 1 }}
                                    textStyle={styles.acceptText}
                                    gradientColors={counterOffer.trim() !== '' ? [colors.gray, colors.gray] : [colors.primary, colors.primary]}
                                />
                            </View>
                    )}
                </View>
            </View>
            </TouchableWithoutFeedback>
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
        width: '90%',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(24),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    title: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    closeBtn: {
        padding: horizontalScale(4),
    },
    closeIcon: {
        width: horizontalScale(25),
        height: horizontalScale(25),
        resizeMode: 'contain',
    },
    subtitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        marginBottom: verticalScale(24),
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: colors.gray,
        marginBottom: verticalScale(8),
    },
    inputBox: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(10),
        height: verticalScale(48),
        paddingHorizontal: horizontalScale(16),
        justifyContent: 'center',
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    disabledInput: {
        backgroundColor: colors.bgLight,
    },
    inputText: {
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: verticalScale(16),
        gap: horizontalScale(12),
    },
    counterText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.primary,
    },
    acceptText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.white,
    },
});

export default NegotiatePopup;
