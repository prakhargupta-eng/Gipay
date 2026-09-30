import { formatCurrency } from '@utils/currencyUtils';
import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';
import CustomButton from './CustomButton';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import Fonts from '@assets/Fonts';
import strings from '@constants/strings';
import AppText from '@components/AppText';

interface NegotiateRateModalProps {
    visible: boolean;
    onClose: () => void;
    jobTitle: string;
    originalOffer: string;
    proposedRate: string;
    clientRate: string;
    onReject: () => void;
    onAccept: () => void;
    isRejecting?: boolean;
    isAccepting?: boolean;
}

const NegotiateRateModal: React.FC<NegotiateRateModalProps> = ({
    visible,
    onClose,
    jobTitle,
    originalOffer,
    proposedRate,
    clientRate,
    onReject,
    onAccept,
    isRejecting = false,
    isAccepting = false,
}) => {
    const s = strings.auth.contractor.jobDetails;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <AppText style={styles.modalTitle}>{s.negotiateRate}</AppText>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Image
                                        source={require('@assets/images/common/closeIcon.png')}
                                        style={styles.closeIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            <AppText style={styles.subtitle}>{s.negotiateSubtitle(jobTitle)}</AppText>

                            <View style={styles.inputGroup}>
                                <AppText style={styles.label}>{s.originalOffer}</AppText>
                                <TextInput allowFontScaling={false} style={styles.input}
                                    value={`${formatCurrency(originalOffer)}/h`}
                                    editable={false}
                                    returnKeyType="done"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <AppText style={styles.label}>{s.yourProposedRate}</AppText>
                                <TextInput allowFontScaling={false} style={styles.input}
                                    value={`${formatCurrency(proposedRate)}/h`}
                                    editable={false}
                                    returnKeyType="done"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <AppText style={styles.label}>{s.clientProposedRate}</AppText>
                                <TextInput allowFontScaling={false} style={styles.input}
                                    value={`${formatCurrency(clientRate)}/h`}
                                    editable={false}
                                    returnKeyType="done"
                                />
                            </View>

                            <View style={styles.footerRow}>
                                <CustomButton
                                    title={s.rejectJob}
                                    onPress={onReject}
                                    style={[styles.footerBtn, styles.rejectBtn]}
                                    textStyle={styles.rejectBtnText}
                                    gradientColors={['white', 'white']}
                                    loading={isRejecting}
                                    disabled={isRejecting || isAccepting}
                                />
                                <CustomButton
                                    title={s.acceptJob}
                                    onPress={onAccept}
                                    style={[styles.footerBtn, styles.acceptBtn]}
                                    textStyle={styles.acceptBtnText}
                                    loading={isAccepting}
                                    disabled={isRejecting || isAccepting}
                                />
                            </View>
                        </View>
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
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(24),
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
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
    subtitle: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.textSecondary,
        marginBottom: verticalScale(20),
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: fontSize(13),
        fontFamily: Fonts.medium,
        color: colors.textSecondary,
        marginBottom: verticalScale(6),
    },
    input: {
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(12),
        height: verticalScale(52),
        paddingHorizontal: horizontalScale(16),
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.black,
        backgroundColor: colors.bgLight,
    },
    footerRow: {
        flexDirection: 'row',
        marginTop: verticalScale(10),
    },
    footerBtn: {
        flex: 1,
        height: verticalScale(52),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectBtn: {
        borderWidth: 1,
        borderColor: colors.primary,
        marginRight: horizontalScale(12),
    },
    rejectBtnText: {
        fontSize: fontSize(18),
        fontFamily: Fonts.medium,
        color: colors.primary,
    },
    acceptBtn: {
        backgroundColor: colors.primary,
    },
    acceptBtnText: {
        fontSize: fontSize(18),
        fontFamily: Fonts.medium,
        color: colors.white,
    },
});

export default NegotiateRateModal;
