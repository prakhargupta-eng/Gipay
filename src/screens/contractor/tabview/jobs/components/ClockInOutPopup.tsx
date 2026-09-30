import React, { useState, useRef } from 'react';
import CustomToast from '@components/CustomToast';
import { View, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';
import AppText from '@components/AppText';
import { getLocalDateTime, checkClockInEligibility } from '@utils/dateUtils';
import CustomButton from '@components/CustomButton';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import { useLocation } from '@hooks/useLocation';
import strings from '@constants/strings';

interface ClockInOutPopupProps {
  visible: boolean;
  onClose: (action?: 'clockIn' | 'clockOut', clockInTime?: string) => void;
  job: any;
}

const { width } = Dimensions.get('window');

const ClockInOutPopup: React.FC<ClockInOutPopupProps> = ({ visible, onClose, job }) => {
  const [step, setStep] = useState<'ready' | 'active' | 'completed'>('ready');
  const toastRef = useRef<any>(null);
  const isActionRunning = useRef(false);
  const [duration, setDuration] = useState('00:00:00');
  const [isLoading, setIsLoading] = useState(false);
  const [completedData, setCompletedData] = useState<any>(null);
  const { getLastKnownLocation } = useLocation();
  const popupStrings = strings.auth.contractor.home.clockInOutPopup;

  React.useEffect(() => {
    if (visible && job) {
      setStep(job.isClockedIn ? 'active' : 'ready');
    }
  }, [visible, job]);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'active' && job?.clockInTime) {
      // Calculate immediately
      const updateDuration = () => {
        const start = new Date(job.clockInTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, now - start);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };

      updateDuration();
      interval = setInterval(updateDuration, 1000);
    }
    return () => clearInterval(interval);
  }, [step, job]);

  /**
   * Formats a UTC date string into a local HH:MM AM/PM format
   * Ensures the time is properly displayed to the user in a 12-hour format
   */
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    // Format to match HH:MMAM/PM
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr}${ampm}`;
  };

  /**
   * Handles the primary button action for Clocking In or Clocking Out
   * Determines the current step and fires the appropriate API endpoints
   */
  const handleAction = async () => {
    if (isActionRunning.current) return;
    isActionRunning.current = true;
    setIsLoading(true);
    try {
      const jobId = job?.jobId || job?.id || job?._id;

      if (step === 'ready') {
        // --- CLOCK IN LOGIC ---
        const eligibilityMessage = checkClockInEligibility(job?.startDate || job?.date, job?.endDate, step === 'ready' ? 'clockIn' : 'clockOut');
        if (eligibilityMessage) {
          toastRef.current?.show({ type: 'info', text2: eligibilityMessage });
          setIsLoading(false);
          return;
        }

        // 1. Fetch current GPS coordinates required by the API
        const currentLocation = await getLastKnownLocation();
        const lat = currentLocation?.latitude;
        const lng = currentLocation?.longitude;

        // 2. Call backend clock-in endpoint
        const response = await ContractorService.clockIn(jobId, lat, lng);

        if (response.success) {
          Toast.show({ type: 'success', text2: response.message || popupStrings.clockInSuccess });
          // Inform parent component to refresh its state with the new clockInTime
          onClose('clockIn', response.data?.clockInTime || response.data?.clockInTime);
        } else {
          toastRef.current?.show({ type: 'error', text2: response.message || popupStrings.clockInFailed });
        }
      } else if (step === 'active') {
        // --- CLOCK OUT LOGIC ---
        // 1. Call backend clock-out endpoint (GPS location not required)
        const response = await ContractorService.clockOut(jobId);

        if (response.success) {
          // 2. Save the returned summary data (total hours, wages) to display in the completed step
          setCompletedData(response.data);
          // 3. Move UI to the completed state
          setStep('completed');
        } else {
          toastRef.current?.show({ type: 'error', text2: response.message || popupStrings.clockOutFailed });
        }
      }
    } catch (error: any) {
      // Handle network or unexpected API errors
      toastRef.current?.show({ type: 'error', text2: error?.response?.data?.message || error.message || popupStrings.somethingWentWrong });
    } finally {
      setIsLoading(false);
      isActionRunning.current = false;
    }
  };

  /**
   * Resets the popup state and notifies the parent to close the modal
   */
  const resetAndClose = () => {
    onClose(step === 'completed' ? 'clockOut' : undefined);
    // Reset step back to initial ready state after modal fade animation finishes
    setTimeout(() => setStep('ready'), 300);
  };

  if (!job) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={resetAndClose}>
            <Image source={require('@assets/images/common/closeIcon.png')} style={styles.closeIcon} />
          </TouchableOpacity>

          {step !== 'completed' && (
            <>
              {/* Header Info */}
              <AppText style={styles.jobTitle}>{job?.jobTitle || job.title}</AppText>

              <View style={[styles.addressRow, { alignItems: 'flex-start' }]}>
                <Image source={require('@assets/images/common/locationPin.png')} style={styles.addressIcon} />
                <AppText style={styles.addressText}>{job?.address || job.location}</AppText>
              </View>

              <View style={styles.gpsRow}>
                <View style={styles.greenDot} />
                <AppText style={styles.gpsText}>{popupStrings.gpsVerified}</AppText>
              </View>

              {/* Status Box */}
              <View style={styles.statusBox}>
                <Image source={require('@assets/images/common/clockGray.png')} style={styles.boxClockIcon} />
                
                {step === 'ready' && (
                  <>
                    <AppText style={styles.boxTitle}>{popupStrings.readyToStart}</AppText>
                    <AppText style={styles.boxSubtitle}>{job?.timeRange || `${getLocalDateTime(job?.startDate || job?.date).time} - ${getLocalDateTime(job?.endDate).time}`}</AppText>
                  </>
                )}

                {step === 'active' && (
                  <>
                    <AppText style={styles.boxTitle}>{popupStrings.shiftDuration}</AppText>
                    <AppText style={styles.boxDuration}>{duration}</AppText>
                    <AppText style={styles.boxSubtitle}>{popupStrings.startedAt(job?.clockInTime ? getLocalDateTime(job.clockInTime).time : getLocalDateTime(job?.startDate || job?.date).time)}</AppText>
                  </>
                )}
              </View>

              {/* Action Button */}
              <CustomButton
                title={step === 'ready' ? popupStrings.clockInBtn : popupStrings.clockOutBtn}
                onPress={handleAction}
                loading={isLoading}
                style={{ alignSelf: 'center', width: '80%' }}
              />
            </>
          )}

          {step === 'completed' && (
            <>
              {/* Completed Header */}
              <View style={styles.completedHeader}>
                <LottieView
                  source={require('@assets/animation/Success Check.json')}
                  autoPlay
                  loop={true}
                  style={styles.successIcon}
                />
                <AppText style={styles.completedTitle}>{popupStrings.shiftCompleted}</AppText>
                <AppText style={styles.completedSubtitle}>{job?.jobTitle}</AppText>
              </View>

              {/* Summary Box */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <AppText style={styles.summaryLabel}>{popupStrings.clockInLabel}</AppText>
                  <AppText style={styles.summaryValue}>{completedData?.clockInTime ? getLocalDateTime(completedData.clockInTime).time : popupStrings.na}</AppText>
                </View>
                <View style={styles.summaryRow}>
                  <AppText style={styles.summaryLabel}>{popupStrings.clockOutLabel}</AppText>
                  <AppText style={styles.summaryValue}>{completedData?.clockOutTime ? getLocalDateTime(completedData.clockOutTime).time : popupStrings.na}</AppText>
                </View>
                <View style={styles.summaryRow}>
                  <AppText style={styles.summaryLabel}>{popupStrings.totalHoursLabel}</AppText>
                  <AppText style={styles.summaryValue}>
                    {completedData?.totalHours !== undefined && completedData?.totalHours !== null
                      ? popupStrings.totalHoursValue(
                        Math.floor(completedData.totalHours),
                        Math.round((completedData.totalHours - Math.floor(completedData.totalHours)) * 60)
                      )
                      : popupStrings.na}
                  </AppText>
                </View>
                {/* <View style={styles.summaryRow}>
                  <AppText style={styles.summaryLabel}>{popupStrings.earningLabel}</AppText>
                  <AppText style={styles.summaryValue}>{job?.jobRate ? job.jobRate : popupStrings.na}</AppText>
                </View> */}
                <View style={[styles.summaryRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                  <AppText style={styles.summaryLabel}>{popupStrings.paymentStatusLabel}</AppText>
                  <AppText style={styles.summaryValueRed}>{popupStrings.pendingReview}</AppText>
                </View>
              </View>
            </>
          )}

        </View>
      </View>
      <CustomToast ref={toastRef} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    padding: horizontalScale(20),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(20),
  },
  closeBtn: {
    position: 'absolute',
    top: verticalScale(16),
    right: horizontalScale(16),
    zIndex: 10,
    padding: horizontalScale(4),
  },
  closeIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    resizeMode: 'contain',
  },
  jobTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: fontSize(20),
    color: colors.black,
    marginBottom: verticalScale(8),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  addressIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    resizeMode: 'contain',
    tintColor: '#C4C4C4',
    marginRight: horizontalScale(6),
  },
  addressText: {
    fontFamily: Fonts.light,
    fontSize: fontSize(14),
    color: colors.gray,
    flex: 1,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  greenDot: {
    width: horizontalScale(8),
    height: horizontalScale(8),
    borderRadius: horizontalScale(4),
    backgroundColor: '#10C71A',
    marginRight: horizontalScale(8),
    marginLeft: horizontalScale(4),
  },
  gpsText: {
    fontFamily: Fonts.light,
    fontSize: fontSize(14),
    color: '#10C71A',
  },
  statusBox: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: horizontalScale(12),
    paddingVertical: verticalScale(20),
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  boxClockIcon: {
    width: horizontalScale(28),
    height: horizontalScale(28),
    resizeMode: 'contain',
    tintColor: '#888',
    marginBottom: verticalScale(12),
  },
  boxTitle: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(16),
    color: colors.black,
    marginBottom: verticalScale(6),
  },
  boxDuration: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(16),
    color: '#888',
    marginBottom: verticalScale(6),
  },
  boxSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    color: colors.gray,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: horizontalScale(8),
    height: verticalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: horizontalScale(40),
  },
  primaryBtnText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(18),
    color: colors.white,
  },

  /* Completed Styles */
  completedHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  successIcon: {
    width: horizontalScale(64),
    height: horizontalScale(64),
    resizeMode: 'contain',
    marginBottom: verticalScale(16),
  },
  completedTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: fontSize(20),
    color: colors.black,
    marginBottom: verticalScale(4),
  },
  completedSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.black,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: horizontalScale(12),
    padding: horizontalScale(16),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  summaryLabel: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.black,
  },
  summaryValue: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
  },
  summaryValueRed: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: '#FF3B30',
  }
});

export default ClockInOutPopup;
