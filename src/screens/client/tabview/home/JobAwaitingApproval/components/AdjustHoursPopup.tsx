import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import Colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';
import CustomButton from '@components/CustomButton';
import strings from '@constants/strings';
import CustomToast from '@components/CustomToast';
import { Toast } from '@utils/ToastManager';

const closeIcon = require('@assets/images/common/closeIcon.png');

interface AdjustHoursPopupProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (clientHours: string) => void;
    contractorHours?: string;
    isLoading?: boolean;
}

const AdjustHoursPopup: React.FC<AdjustHoursPopupProps> = ({
    visible,
    onClose,
    onSubmit,
    contractorHours = strings.client.jobAwaitingApproval.defaultContractorHours,
    isLoading = false,
}) => {
    const [clientHours, setClientHours] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const t = strings.client.jobAwaitingApproval;

    const toastRef = useRef<any>(null);

    const setModalToast = useCallback((node: any) => {
        if (toastRef.current && !node) {
            Toast.popInstance(toastRef.current);
        }
        toastRef.current = node;
        if (node) {
            Toast.pushInstance(node);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (toastRef.current) {
                Toast.popInstance(toastRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (visible) {
            setClientHours('');
            setErrorMsg('');
        }
    }, [visible]);

   const handleTextChange = (text: string) => {
    // Allow only digits and one decimal point
    let sanitized = text.replace(/[^0-9.]/g, '');

    const parts = sanitized.split('.');

    // Keep only first decimal point and max 2 digits after it
    sanitized =
        parts[0] +
        (parts.length > 1 ? '.' + parts[1].substring(0, 2) : '');

    // Remove leading zeros
    if (sanitized.startsWith('0') && !sanitized.startsWith('0.')) {
        sanitized = sanitized.replace(/^0+/, '');
    }

    setClientHours(sanitized);

    if (!sanitized) {
        setErrorMsg('');
        return;
    }

    const [hoursStr, minutesStr] = sanitized.split('.');

    const hours = Number(hoursStr);
    const minutes = minutesStr ? Number(minutesStr) : 0;

    if (hours > 24) {
        setErrorMsg(t.hoursExceedError);
    } else if (minutes > 59) {
        setErrorMsg('Minutes cannot be greater than 59');
    } else {
        setErrorMsg('');
    }
};

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.overlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <AppText style={styles.title}>{t.adjustHours}</AppText>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Image source={closeIcon} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        <AppText style={styles.label}>{t.contractorWorkerHours}</AppText>
                        <TextInput allowFontScaling={false} style={[styles.input, styles.disabledInput]}
                            value={contractorHours}
                            editable={false}
                            maxLength={10}
                            returnKeyType="done"
                        />

                        <AppText style={styles.label}>{t.clientApprovedHours}</AppText>
                        <TextInput allowFontScaling={false} style={[styles.input, errorMsg ? { borderColor: 'red' } : {}]}
                            value={clientHours}
                            onChangeText={handleTextChange}
                            keyboardType="numeric"
                            placeholder={t.enterApprovedHours}
                            maxLength={5}
                            returnKeyType="done"
                        />
                        {!!errorMsg && (
                            <AppText style={{ color: 'red', fontSize: 12, marginTop: -10, marginBottom: 15, alignSelf: 'flex-start' }}>
                                {errorMsg}
                            </AppText>
                        )}

                        <CustomButton
                            title={t.submit}
                            onPress={() => {
                                if (clientHours && clientHours !== '0' && !errorMsg) {
                                    onSubmit(clientHours);
                                }
                            }}
                            loading={isLoading}
                            disabled={!clientHours || clientHours === '0' || !!errorMsg}
                        />
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
            <CustomToast ref={setModalToast} />

        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: Colors.white,
        width: '90%',
        borderRadius: horizontalScale(16),
        padding: horizontalScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    title: {
        fontFamily: fonts.regular,
        fontSize: fontSize(22),
        color: Colors.black,
    },
    closeBtn: {
        padding: horizontalScale(5),
    },
    closeIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        resizeMode: 'contain',
    },
    label: {
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: '#64748B',
        marginBottom: verticalScale(8),
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: horizontalScale(8),
        paddingHorizontal: horizontalScale(15),
        height: verticalScale(45),
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        color: Colors.black,
        marginBottom: verticalScale(20),
    },
    disabledInput: {
        backgroundColor: '#F8FAFC',
        color: '#64748B',
    },
});

export default AdjustHoursPopup;
