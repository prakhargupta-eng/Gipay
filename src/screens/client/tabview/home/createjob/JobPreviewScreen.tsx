import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import CustomToast from '@components/CustomToast';
import LottieView from 'lottie-react-native';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  BackHandler
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import styles from './styles';
import colors from '@styles/colors';
import strings from '@constants/strings';
import JobService from '@config/jobService';
import TopHeader from '@components/TopHeader';
import CustomButton from '@components/CustomButton';
import { verticalScale, horizontalScale } from '@styles/mixins';
import AppText from '@components/AppText';
import { formatLocalDateString } from '@utils/dateUtils';
import ConfirmationPopup from '@components/ConfirmationPopup';
import { devDebugger } from '@utils/devDebugger';


type JobPreviewRouteProp = RouteProp<ClientAppStackParamList, 'JobPreview'>;

const JobPreviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<JobPreviewRouteProp>();
  const { jobData, isCommingfromDraft } = route.params;
  const [isPosting, setIsPosting] = useState(false);
  const toastRef = useRef<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [createdJobId, setCreatedJobId] = useState('');

  const handleBack = () => navigation.goBack();

  // Disable iOS swipe back gesture when success modal is open
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !showSuccessModal,
    });
  }, [navigation, showSuccessModal]);

  // Explicitly handle the Android Hardware Back Button (bottom back button)
  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = () => {
        if (showSuccessModal) {
          // Block the physical back button action when the success modal is open
          return true; // return true stops the default back action
        }

        // If modal is NOT open, allow the default back action (return false)
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onHardwareBackPress
      );

      return () => subscription.remove();
    }, [showSuccessModal])
  );

  const handleErrorResponse = (response: any, fallbackMessage: string = 'Something went wrong') => {
    const message = response?.message || fallbackMessage;
    const isInsufficientBalance = response?.error?.details?.isInsufficientBalance;

    if (isInsufficientBalance) {
      setShowInsufficientBalance(true);
    } else {
      toastRef.current?.show({
        type: 'error',
        text2: message,
      });
    }
  };

  const handlePostJob = async () => {
    try {
      setIsPosting(true);

      const postOrderDocuments = [...(jobData.postOrderDocuments || [])];

      const { selectedDocs, certificationNames, saveAsDraft, _id, ...restJobData } = jobData;

      if (isCommingfromDraft) {
        const payload = {
          ...restJobData,
          requiredCertifications: jobData.requiredCertifications,
          ...(postOrderDocuments.length > 0 ? { postOrderDocuments } : {}),
        };

        const response = await JobService.publishJob(jobData._id, payload);
        if (response.success) {
          setCreatedJobId(jobData._id);
          setShowSuccessModal(true);
        } else {
          handleErrorResponse(response, 'Failed to publish job');
        }
        return;
      }

      const payload = {
        ...restJobData,
        requiredCertifications: jobData.requiredCertifications,
        saveAsDraft: false,
        ...(postOrderDocuments.length > 0 ? { postOrderDocuments } : {}),
      };

      devDebugger.log("FINAL PAYLOAD:", payload);

      const response = await JobService.createJob(payload);

      if (response.success) {
        setCreatedJobId(response.data.id || response.data._id);
        setShowSuccessModal(true);
      } else {
        handleErrorResponse(response, 'Failed to post job');
      }
    } catch (error: any) {
      handleErrorResponse(error, 'Something went wrong');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigation.pop(2); // Go back to Home/Jobs
  };

  const handleInviteFromModal = () => {
    setShowSuccessModal(false);
    navigation.navigate('InviteContractors', { jobId: createdJobId });
  };


  const DetailItem = ({ icon, text, containerStyle }: { icon: any; text: string; containerStyle?: any }) => (
    <View style={[styles.detailRow, containerStyle]}>
      <Image source={icon} style={styles.detailIcon} />
      <AppText style={styles.detailText} ellipsizeMode="tail">{text}</AppText>
    </View>
  );

  const renderSuccessModal = () => (
    <Modal
      transparent
      visible={showSuccessModal}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
            <Image source={require('@assets/images/common/closeIcon.png')} style={styles.closeIcon} />
          </TouchableOpacity>

          <LottieView
            source={require('@assets/animation/Success Check.json')}
            autoPlay
            loop={false}
            style={styles.successImage}
          />

          <AppText style={[styles.modalTitle, { color: colors.successGreen }]}>
            {strings.client.createJob.successModal.title}
          </AppText>
          <AppText style={styles.modalDescription}>
            {strings.client.createJob.successModal.description}
          </AppText>

          <TouchableOpacity style={styles.modalButton} onPress={handleInviteFromModal}>
            <AppText style={styles.modalButtonText}>
              {strings.client.createJob.successModal.buttonText}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopHeader
        title="Preview Job"
        onBack={handleBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSheetRow}>
          <View style={styles.headerSheet}>
            <AppText style={styles.jobTitleSheet} numberOfLines={2} ellipsizeMode="tail">{jobData.title}</AppText>
            <AppText style={styles.companyNameSheet}>{strings.client.createJob.defaultCompanyName}</AppText>
          </View>
          <TouchableOpacity style={styles.editButtonSmall} onPress={handleBack}>
            <AppText style={styles.editButtonTextSmall}>Edit</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsGrid}>
          <DetailItem icon={require('@assets/images/common/doller.png')} text={`Job Rate: ${formatCurrency(jobData.hourlyRate)}/h`} />
          <DetailItem icon={require('@assets/images/common/pinLocation.png')} text={jobData.location} />
          <View style={[styles.rowItemContainer, { gap: 8 }]}>
            <Image source={require('@assets/images/common/calander.png')} style={[styles.detailIcon, { marginRight: 4 }]} />
            <AppText style={[styles.detailText, { flex: 0, marginRight: 8 }]} numberOfLines={1}>
              {`${formatLocalDateString(jobData.startDate)} - ${formatLocalDateString(jobData.endDate)}`}
            </AppText>
            
            <Image source={require('@assets/images/common/blackClock.png')} style={[styles.detailIcon, { marginRight: 4 }]} />
            <AppText style={[styles.detailText, { flex: 0 }]} numberOfLines={1}>
              {`${jobData.startTime} - ${jobData.endTime}`}
            </AppText>
          </View>
        </View>

        <AppText style={styles.sectionTitleSheet}>{strings.common.description}</AppText>
        <View style={styles.contentBoxSheet}>
          <AppText style={styles.descriptionTextSheet}>{jobData.description}</AppText>
        </View>

        <View style={styles.contractorRowSheet}>
          <AppText style={styles.sectionTitleSheet}>{strings.client.createJob.requiredContractorLabel}</AppText>
          <View style={styles.countBox}>
            <AppText style={styles.countText}>{jobData.contractorsRequired}</AppText>
          </View>
        </View>

        <AppText style={styles.sectionTitleSheet}>{strings.client.createJob.requiredCertification}</AppText>
        <View style={styles.contentBoxSheet}>
          {jobData.certificationNames && jobData.certificationNames.length > 0 ? (
            jobData.certificationNames.map((cert: string, idx: number) => (
              <View key={idx}>
                <AppText style={styles.bulletItem}>• {cert}</AppText>
              </View>
            ))
          ) : (
            <AppText style={styles.descriptionTextSheet}>{strings.client.createJob.noCertifications}</AppText>
          )}
        </View>
      </ScrollView>

      <View style={styles.footerSheet}>
        <CustomButton
          title={strings.client.createJob.jobPost}
          onPress={handlePostJob}
          loading={isPosting}
          style={{ flex: 1, marginBottom: verticalScale(30) }}
          disabled={isPosting}
        />
      </View>

      {renderSuccessModal()}
      <ConfirmationPopup
        visible={showInsufficientBalance}
        onClose={() => setShowInsufficientBalance(false)}
        onConfirm={() => {
          setShowInsufficientBalance(false);
          navigation.navigate('PaymentMethod');
        }}
        animationSource={require('@assets/animation/addMoney.json')}
        iconContainerStyle={{ width: horizontalScale(140), height: horizontalScale(140) }}
        message={strings.client.createJob.insufficientBalanceDesc}
        cancelText={strings.client.createJob.cancel}
        confirmText={strings.client.createJob.addMoney}
      />
      <CustomToast ref={toastRef} />
    </View>
  );
};

export default JobPreviewScreen;
