import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import AppText from '@components/AppText';
import CustomToast from '@components/CustomToast';
import strings from '@constants/strings';
import { Toast } from '@utils/ToastManager';
import { getLocalDateTime } from '@utils/dateUtils';
import ContractorService from '@config/contractorService';
import { devDebugger } from '@utils/devDebugger';
import { verticalScale } from '@styles/mixins';
import styles from './styles';

interface ClockOutPopupProps {
    visible: boolean;
    job: any;
    onClose: () => void;
    onSubmitSuccess?: (data?: any) => void;
}

const ClockOutPopup: React.FC<ClockOutPopupProps> = ({
    visible,
    job,
    onClose,
    onSubmitSuccess,
}) => {
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Derive job end time as static text
    const jobEndTimeDisplay = useMemo(() => {
        if (!job) return 'N/A';
        const order = typeof job?.jobOrderId === 'object' && job?.jobOrderId !== null ? job.jobOrderId : {};
        const jobObj = job?.Job || (typeof job?.jobId === 'object' && job?.jobId !== null ? job.jobId : {});

        if (job?.endTime) return job.endTime;
        if (order?.endTime) return order.endTime;
        if (jobObj?.endTime) return jobObj.endTime;
        if (job?.timeDisplay && job.timeDisplay.includes('-')) {
            const parts = job.timeDisplay.split('-');
            const end = parts[1]?.trim();
            if (end) return end;
        }
        if (job?.scheduledEndTime) return getLocalDateTime(job.scheduledEndTime).time;
        if (order?.endDate) return getLocalDateTime(order.endDate).time;
        if (jobObj?.endDate) return getLocalDateTime(jobObj.endDate).time;
        if (job?.endDate) return getLocalDateTime(job.endDate).time;
        if (typeof job?.scheduledShift === 'string' && job.scheduledShift.includes('-')) {
            return job.scheduledShift.split('-')[1]?.trim() || job.scheduledShift;
        }
        return 'N/A';
    }, [job]);

    const handleClose = () => {
        setDescription('');
        setDescriptionError('');
        onClose();
    };

    // Use exact ISO timestamp from API data without creating dates on our end
    const getClockOutIsoString = (): string => {
        if (job?.scheduledEndTime) {
            return job.scheduledEndTime;
        }
        if (job?.requestedClockOutTime) {
            return job.requestedClockOutTime;
        }

        const order = typeof job?.jobOrderId === 'object' && job?.jobOrderId !== null ? job.jobOrderId : {};
        const jobObj = job?.Job || (typeof job?.jobId === 'object' && job?.jobId !== null ? job.jobId : {});
        const endDateSource = order?.endDate || jobObj?.endDate || job?.endDate;
        if (endDateSource && typeof endDateSource === 'string' && !endDateSource.includes('/')) {
            return endDateSource;
        }

        return new Date().toISOString();
    };

    const handleSubmit = async () => {
        const order = typeof job?.jobOrderId === 'object' && job?.jobOrderId !== null ? job.jobOrderId : {};
        const jobObj = job?.Job || (typeof job?.jobId === 'object' && job?.jobId !== null ? job.jobId : {});

        const jobId =
            jobObj?._id ||
            jobObj?.id ||
            (typeof job?.jobId === 'string' ? job.jobId : null) ||
            (typeof job?.Job === 'string' ? job.Job : null) ||
            (typeof order?.jobId === 'object' ? (order?.jobId?._id || order?.jobId?.id) : order?.jobId) ||
            job?._id ||
            '';

        const attendanceId =
            (typeof job?.attendanceId === 'object' && job?.attendanceId !== null ? job.attendanceId._id : null) ||
            (typeof job?.attendanceId === 'string' ? job.attendanceId : null) ||
            job?._id ||
            '';

        if (!jobId) {
            toastRef.current?.show({
                type: 'error',
                text1: strings.clockOutRequest.jobNotFound,
            });
            return;
        }

        if (!attendanceId) {
            toastRef.current?.show({
                type: 'error',
                text1: strings.clockOutRequest.attendanceNotFound,
            });
            return;
        }

        const trimmedDescription = description.trim();
        if (!trimmedDescription) {
            setDescriptionError(strings.clockOutRequest.pleaseEnterDescription);
            return;
        }

        if (trimmedDescription.length < 5) {
            setDescriptionError(strings.clockOutRequest.descriptionMinLength);
            return;
        }

        if (trimmedDescription.length > 250) {
            setDescriptionError(strings.clockOutRequest.descriptionMaxLength);
            return;
        }

        setDescriptionError('');
        setIsSubmitting(true);
        try {
            const clockOutTime = getClockOutIsoString();
            const response = await ContractorService.manualClockOut(jobId, {
                attendanceId,
                requestedClockOutTime: clockOutTime,
                reason: trimmedDescription,
            });

            if (response.success) {
                const msg = response.message || strings.clockOutRequest.requestSubmittedSuccess;
                onSubmitSuccess?.(response.data);
                handleClose();
                setTimeout(() => {
                    Toast.showSuccess(msg);
                }, 300);
            } else {
                toastRef.current?.show({
                    type: 'error',
                    text1: response.message || 'Failed to submit manual clock out',
                });
            }
        } catch (error: any) {
            devDebugger.error('Manual clock out error:', error);
            toastRef.current?.show({
                type: 'error',
                text1: error?.response?.data?.message || error?.message || 'Failed to submit manual clock out',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    const order = typeof job?.jobOrderId === 'object' && job?.jobOrderId !== null ? job.jobOrderId : {};
    const jobObj = job?.Job || (typeof job?.jobId === 'object' && job?.jobId !== null ? job.jobId : {});

    const startDate = order?.startDate || jobObj?.startDate || job?.startDate;
    const endDate = order?.endDate || jobObj?.endDate || job?.endDate;

    let jobDuration = 'N/A';
    if (job?.dateDisplay) {
        jobDuration = job.dateDisplay;
    } else if (startDate && endDate) {
        const startStr = getLocalDateTime(startDate).date;
        const endStr = getLocalDateTime(endDate).date;
        if (startStr !== 'N/A' && endStr !== 'N/A') {
            jobDuration = startStr === endStr ? startStr : `${startStr} - ${endStr}`;
        } else if (startStr !== 'N/A') {
            jobDuration = startStr;
        } else if (endStr !== 'N/A') {
            jobDuration = endStr;
        }
    } else if (startDate) {
        const startStr = getLocalDateTime(startDate).date;
        if (startStr !== 'N/A') {
            jobDuration = startStr;
        }
    } else if (job?.scheduledShift) {
        jobDuration = job.scheduledShift;
    }

    let missedDate = 'N/A';
    const dateSource = job?.date || job?.attendanceId?.date || job?.clockInTime || startDate;
    if (dateSource) {
        const formatted = getLocalDateTime(dateSource).date;
        if (formatted !== 'N/A') {
            missedDate = formatted;
        } else if (typeof dateSource === 'string' && !dateSource.includes('T')) {
            missedDate = dateSource;
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.modalCard}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>
                                {strings.clockOutRequest.screenTitle}
                            </AppText>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.modalCloseBtn}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={require('@assets/images/common/closeIcon.png')}
                                    style={styles.modalCloseIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable Form Content */}
                        <ScrollView
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.modalScrollContent}
                            bounces={false}
                        >
                            {/* Info Row: Job Duration & Missed Clock Out */}
                            <View style={styles.modalInfoRow}>
                                <View style={styles.modalInfoColJob}>
                                    <AppText style={styles.modalInfoLabel}>
                                        {strings.clockOutRequest.jobDurationLabel}
                                    </AppText>
                                    <View style={styles.modalInfoValueRow}>
                                        <Image
                                            source={require('@assets/images/common/calanderGray.png')}
                                            style={styles.modalInfoIcon}
                                            resizeMode="contain"
                                        />
                                        <AppText
                                            style={styles.modalInfoText}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {jobDuration}
                                        </AppText>
                                    </View>
                                </View>

                                <View style={styles.modalInfoColMissed}>
                                    <AppText style={styles.modalInfoLabel}>
                                        {strings.clockOutRequest.missedClockOutLabel}
                                    </AppText>
                                    <View style={styles.modalInfoValueRow}>
                                        <Image
                                            source={require('@assets/images/common/calander.png')}
                                            style={styles.modalMissedIcon}
                                            resizeMode="contain"
                                        />
                                        <AppText
                                            style={styles.modalMissedText}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {missedDate}
                                        </AppText>
                                    </View>
                                </View>
                            </View>

                            {/* Calendar Field - Static display showing Missed Clock Out Date */}
                            <AppText style={styles.fieldLabel}>
                                {strings.clockOutRequest.calendarLabel}
                            </AppText>
                            <View style={styles.staticFieldBox}>
                                <AppText style={styles.staticFieldValue}>
                                    {missedDate}
                                </AppText>
                                <Image
                                    source={require('@assets/images/common/calanderGray.png')}
                                    style={styles.staticFieldIcon}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Clock Out (Time) Field - Static display showing Job End Time */}
                            <AppText style={styles.fieldLabel}>
                                {strings.clockOutRequest.clockOutTimeLabel}
                            </AppText>
                            <View style={styles.staticFieldBox}>
                                <AppText style={styles.staticFieldValue}>
                                    {jobEndTimeDisplay}
                                </AppText>
                                <Image
                                    source={require('@assets/images/common/clockGray.png')}
                                    style={styles.staticFieldIcon}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Description / Reason Field */}
                            <AppText style={styles.fieldLabel}>
                                {strings.clockOutRequest.descriptionLabel}
                            </AppText>
                            <TextInput
                                style={[
                                    styles.descriptionInput,
                                    !!descriptionError && styles.descriptionInputError,
                                ]}
                                placeholder={strings.clockOutRequest.descriptionPlaceholder}
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                                maxLength={250}
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    if (descriptionError) {
                                        setDescriptionError('');
                                    }
                                }}
                                editable={!isSubmitting}
                            />
                            {!!descriptionError && (
                                <AppText style={styles.errorText}>{descriptionError}</AppText>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                activeOpacity={0.85}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <AppText style={styles.submitBtnText}>
                                        {strings.clockOutRequest.submit}
                                    </AppText>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            <CustomToast ref={setModalToast} />
        </Modal>
    );
};

export default ClockOutPopup;
