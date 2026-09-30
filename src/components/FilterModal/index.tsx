import React, { useState, useEffect , useRef } from 'react';
import CustomToast from '@components/CustomToast';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (startDate: Date | null, endDate: Date | null) => void;
    onClear: () => void;
    initialStartDate: Date | null;
    initialEndDate: Date | null;
}

const FilterModal = ({
    visible,
    onClose,
    onApply,
    onClear,
    initialStartDate,
    initialEndDate
}: FilterModalProps) => {
    const [tempStartDate, setTempStartDate] = useState<Date | null>(initialStartDate);
  const toastRef = useRef<any>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(initialEndDate);
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    // Update temp state when initial values change (e.g. when opening modal)
    useEffect(() => {
        if (visible) {
            setTempStartDate(initialStartDate);
            setTempEndDate(initialEndDate);
        }
    }, [visible, initialStartDate, initialEndDate]);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select Date';
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleApply = () => {
        if (!tempStartDate || !tempEndDate) {
            Toast.showError('Both Start and End dates are mandatory');
            return;
        }
        
        // Remove time part for comparison
        const start = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate());
        const end = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), tempEndDate.getDate());

        if (start > end) {
            Toast.showError('End date cannot be before Start date');
            return;
        }

        onApply(tempStartDate, tempEndDate);
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.handle} />
                            
                            <View style={styles.header}>
                                <View style={{ width: 40 }} />
                                <AppText style={styles.title}>Filter By</AppText>
                                <TouchableOpacity onPress={() => {
                                    setTempStartDate(null);
                                    setTempEndDate(null);
                                    onClear();
                                }}>
                                    <AppText style={styles.clearText}>Clear</AppText>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateRow}>
                                <View style={styles.dateInputContainer}>
                                    <AppText style={styles.label}>Start Date</AppText>
                                    <TouchableOpacity 
                                        style={styles.dateInput}
                                        onPress={() => setOpenStart(true)}
                                    >
                                        <AppText style={[styles.dateText, !tempStartDate && styles.placeholderText]}>
                                            {formatDate(tempStartDate)}
                                        </AppText>
                                        <Image 
                                            source={require('@assets/images/common/calanderGray.png')} 
                                            style={styles.calendarIcon}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.dateInputContainer}>
                                    <AppText style={styles.label}>End Date</AppText>
                                    <TouchableOpacity 
                                        style={styles.dateInput}
                                        onPress={() => setOpenEnd(true)}
                                    >
                                        <AppText style={[styles.dateText, !tempEndDate && styles.placeholderText]}>
                                            {formatDate(tempEndDate)}
                                        </AppText>
                                        <Image 
                                            source={require('@assets/images/common/calanderGray.png')} 
                                            style={styles.calendarIcon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton]} 
                                    onPress={onClose}
                                >
                                    <AppText style={styles.cancelButtonText}>Cancel</AppText>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.button, 
                                        styles.applyButton,
                                        (!tempStartDate || !tempEndDate) && styles.disabledButton
                                    ]} 
                                    onPress={handleApply}
                                >
                                    <AppText style={styles.applyButtonText}>Apply</AppText>
                                </TouchableOpacity>
                            </View>

                            <DatePicker
                                modal
                                mode="date"
                                open={openStart}
                                date={tempStartDate || new Date()}
                                maximumDate={tempEndDate ? tempEndDate : undefined}
                                onConfirm={(date) => {
                                    setOpenStart(false);
                                    setTempStartDate(date);
                                }}
                                onCancel={() => setOpenStart(false)}
                            />

                            <DatePicker
                                modal
                                mode="date"
                                open={openEnd}
                                date={tempEndDate || tempStartDate || new Date()}
                                minimumDate={tempStartDate ? tempStartDate : undefined}
                                onConfirm={(date) => {
                                    setOpenEnd(false);
                                    setTempEndDate(date);
                                }}
                                onCancel={() => setOpenEnd(false)}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
          <CustomToast ref={toastRef} />
</Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.white,
        borderTopLeftRadius: horizontalScale(30),
        borderTopRightRadius: horizontalScale(30),
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(40),
        paddingTop: verticalScale(10),
    },
    handle: {
        width: horizontalScale(40),
        height: verticalScale(4),
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: verticalScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(25),
    },
    title: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    clearText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.primary,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: horizontalScale(15),
        marginBottom: verticalScale(30),
    },
    dateInputContainer: {
        flex: 1,
    },
    label: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.black,
        marginBottom: verticalScale(8),
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(12),
        height: verticalScale(48),
    },
    dateText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.black,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    calendarIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        resizeMode: 'contain',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: horizontalScale(15),
    },
    button: {
        flex: 1,
        height: verticalScale(52),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    applyButton: {
        backgroundColor: colors.primary,
    },
    disabledButton: {
        backgroundColor: '#ABB5C5',
    },
    cancelButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    applyButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.white,
    },
});

export default FilterModal;
