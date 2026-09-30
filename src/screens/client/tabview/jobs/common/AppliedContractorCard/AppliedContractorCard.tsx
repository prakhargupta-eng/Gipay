import React from 'react';
import { View, Image, TouchableOpacity, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import strings from '@constants/strings';
import styles from './styles';
import AppText from '@components/AppText';
import { getStatusStyles } from '@utils/statusUtils';
import { Toast } from '@utils/ToastManager';

interface AppliedContractorCardProps {
  contractorId: string;
  contractorName: string;
  contractorRate: string;
  status: string;
  jobStatus: string;
  jobData: any;
  contractorImageUrl?: string | null;
  tabStaus: string;
  contractorPhone?: string;
  contractorData?: any;
  isCancelled?: boolean;
  isMovingFromUpcomming?: boolean;
}

const AppliedContractorCard: React.FC<AppliedContractorCardProps> = ({
  contractorId,
  contractorName,
  contractorRate,
  status,
  jobStatus,
  jobData,
  contractorImageUrl,
  tabStaus,
  contractorPhone,
  contractorData,
  isCancelled = false,
  isMovingFromUpcomming = false
}) => {
  const navigation = useNavigation<any>();

  const contractorPhoneNumber =
    contractorPhone ||
    contractorData?.phoneNumber ||
    (contractorData?.countryCode && contractorData?.mobile
      ? `+${contractorData.countryCode}${contractorData.mobile}`
      : contractorData?.mobile);

  const isCallDisabled =
    !contractorPhoneNumber ||
    tabStaus?.toLowerCase() !== 'active' ||
    Boolean(isCancelled) ||
    Boolean(jobData?.isCancelledJob)

  const handleCall = () => {
    if (isCallDisabled) {
      return;
    }
    if (!contractorPhoneNumber) {
      Toast.showInfo(strings.chat.callNotAvailable);
      return;
    }
    const sanitizedPhone = String(contractorPhoneNumber).replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${sanitizedPhone || contractorPhoneNumber}`).catch(() => {
      Toast.showInfo(strings.chat.callNotAvailable);
    });
  };

  const handleChat = () => {
    const isCompletedSection =
      tabStaus?.toLowerCase() === 'completed' ||
      jobStatus?.toLowerCase() === 'completed' ||
      jobData?.status?.toLowerCase() === 'completed' ||
      jobData?.isCancelledJob;

    const isActive =
      (tabStaus?.toLowerCase() === 'active') &&
      !isCompletedSection;

    const resolvedJobOrderId =
      contractorData?.jobOrderId;

    if (!resolvedJobOrderId) {
      Toast.showInfo(strings.chat.chatNotAvailable);
      return;
    }

    navigation.navigate('ChatScreen', {
      recipientName: contractorName || 'Contractor',
      recipientAvatar: contractorImageUrl,
      jobOrderId: resolvedJobOrderId,
      jobTitle: jobData?.title,
      isChatDisabled: !isActive,
      disabled: !isActive,
    });
  };

  return (
    <View style={styles.appliedContractorCard}>
      <View style={styles.contractorHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (contractorId) {
              navigation.navigate('ContractorProfileDetail', {
                contractor: { contractorId },
                shouldShowButton: false
              });
            }
          }}
          style={styles.contractorHeader}
        >
          <FastImage
            source={contractorImageUrl ? { uri: contractorImageUrl } : require('@assets/images/common/dummyUser.png')}
            style={styles.contractorImg}
          />
          <View style={styles.contractorInfo}>
            <View style={styles.contractorTopRow}>
              <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.contractorName}>{contractorName}</AppText>
              <View style={[
                styles.contractorStatusBadge,
                getStatusStyles(status).badge
              ]}>
                <AppText style={[
                  styles.contractorStatusText,
                  getStatusStyles(status).text
                ]}>{getStatusStyles(status).label}</AppText>
              </View>
            </View>
            <AppText style={styles.contractorRate}>{`Hourly Rate: ${contractorRate}`}</AppText>
          </View>
        </TouchableOpacity>

      </View>

      {tabStaus !== 'Upcoming' && (
        <View style={styles.contractorActions}>
          <TouchableOpacity
            style={[styles.actionBtn, jobData?.isCancelledJob && { opacity: 0.5 }]}
            onPress={() => navigation.navigate('AttendanceDetails', {
              jobId: jobData.id,
              contractorId: contractorId,
              jobStatus: jobStatus,
              job: jobData
            })}
            disabled={jobData?.isCancelledJob}
          >
            <Image source={require('@assets/images/common/attendance.png')} style={styles.actionIcon} />
            <AppText style={styles.actionBtnText}>{strings.client.jobDetails.viewAttendance}</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, jobData?.isCancelledJob && { opacity: 0.5 }]}
            onPress={() => navigation.navigate('PaymentDetails', {
              jobId: jobData.id,
              contractorId: contractorId,
              jobStatus: jobStatus,
              job: jobData
            })}
            disabled={jobData?.isCancelledJob}
          >
            <Image source={require('@assets/images/common/payment.png')} style={styles.actionIcon} />
            <AppText style={styles.actionBtnText}>{strings.client.jobDetails.paymentHistory}</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Call & Chat options */}
      {tabStaus !== "Upcoming" && (
      <View style={styles.contactContainer}>
        <TouchableOpacity
          style={[styles.contactBtn, isCallDisabled && { opacity: 0.5 }]}
          onPress={handleCall}
          activeOpacity={0.7}
          disabled={isCallDisabled}
        >
          <Image
            source={require('@assets/images/common/callIcon.png')}
            style={styles.contactIcon}
            resizeMode="contain"
          />
          <AppText style={styles.contactText}>{strings.client.jobDetails.call || 'Call'}</AppText>
        </TouchableOpacity>

        <View style={styles.contactDivider} />

        <TouchableOpacity
            style={styles.contactBtn}
          onPress={handleChat}
          activeOpacity={0.7}
        >
          <Image
            source={require('@assets/images/common/chatIcon.png')}
            style={styles.contactIcon}
            resizeMode="contain"
          />
          <AppText style={styles.contactText}>{strings.client.jobDetails.chat || 'Chat'}</AppText>
        </TouchableOpacity>
      </View>
      )}
    </View>
  );
};

export default AppliedContractorCard;
