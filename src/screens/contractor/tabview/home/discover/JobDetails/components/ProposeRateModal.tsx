import React from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, Modal, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import strings, { CURRENCY } from '@constants/strings';
import styles from '../styles';
import CustomButton from '@components/CustomButton';
import AppText from '@components/AppText';
import { sanitizeDecimalInput } from '@utils/validation';

interface ProposeRateModalProps {
    visible: boolean;
    onClose: () => void;
    value: string;
    onChange: (text: string) => void;
    onSubmit: () => void;
    loading?: boolean;
}

const ProposeRateModal: React.FC<ProposeRateModalProps> = ({
    visible,
    onClose,
    value,
    onChange,
    onSubmit,
    loading = false,
}) => {
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
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <AppText style={styles.modalTitle}>{strings.auth.contractor.jobDetails.proposeHigherRate}</AppText>
                                <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
                                    <Image 
                                        source={require('@assets/images/common/closeIcon.png')} 
                                        style={styles.modalCloseIcon} 
                                    />
                                </TouchableOpacity>
                            </View>

                            <AppText style={styles.inputLabel}>{strings.auth.contractor.jobDetails.proposalRateLabel}</AppText>
                            <TextInput allowFontScaling={false} style={styles.modalInput}
                                returnKeyType="done"
                                placeholder={strings.auth.contractor.jobDetails.proposalRatePlaceholder}
                                placeholderTextColor="#9CA3AF"
                                value={value ? `${formatCurrency(value)}` : ''}
                                onChangeText={(text) => {
                                    const cleanText = sanitizeDecimalInput(text, CURRENCY);
                                    onChange(cleanText);
                                }}
                                keyboardType="decimal-pad"
                                autoFocus={true}
                                maxLength={7}
                            />

                            <CustomButton 
                                title={strings.auth.contractor.jobDetails.submitProposal}
                                onPress={onSubmit}
                                loading={loading}
                                disabled={!value || value.trim() === ''}
                                style={{ marginTop: 10 }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ProposeRateModal;
