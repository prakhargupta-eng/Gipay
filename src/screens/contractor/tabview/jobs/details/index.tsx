import { formatCurrency } from '@utils/currencyUtils';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, StatusBar, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import TopHeader from '@components/TopHeader';
import styles from './styles';
import AppText from '@components/AppText';
import ContractorService from '@config/contractorService';
import strings from '@constants/strings';
import colors from '@styles/colors';
import SkeletonFrame from '@components/SkeletonFrame';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';
import { Toast } from '@utils/ToastManager';

import { horizontalScale, verticalScale } from '@styles/mixins';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'MyJobDetails'>;
type RouteProps = RouteProp<ContractorAppStackParamList, 'MyJobDetails'>;

const JobDetailTag = ({
  icon,
  text,
  negotiationRate,
  isPoposedRate,
  rateLabel,
  jobRate,
  shouldShowJobText,
}: {
  icon: any;
  text?: string;
  negotiationRate?: string;
  isPoposedRate?:boolean;
  rateLabel?: string;
  jobRate?: string;
  shouldShowJobText:boolean;
}) => (
    <View style={styles.infoItem}>
        <Image source={icon} style={styles.infoIcon} />

    {isPoposedRate && shouldShowJobText ? (
      <>
        <AppText
          style={[
            styles.infoText,
            styles.strikethroughText,
          ]}
        >
          {strings.auth.contractor.home.jobRateLabel} {formatCurrency(jobRate)}/h
        </AppText>

        <AppText
          style={[
            styles.infoText,
            styles.marginLeft8,
          ]}
        >
          {rateLabel || strings.auth.contractor.home.nagotiontedRate} {formatCurrency(negotiationRate)}/h
        </AppText>
      </>
    ) : (
      <AppText style={styles.infoText}>
        {shouldShowJobText ? `${strings.auth.contractor.home.jobRateLabel} ${formatCurrency(jobRate)}/h` : (text || 'N/A')}
      </AppText>
    )}
  </View>
);

const MyJobDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { job, jobId: paramJobId, tab } = route.params || {};
    const jobId = paramJobId || job?._id || job?.id;

    const [jobDetails, setJobDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const s = strings.auth.contractor.myJobDetails;
    const isUpcoming = tab?.toLowerCase() === 'upcoming';

    useEffect(() => {
        const fetchDetails = async () => {
            if (!jobId) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                setHasError(false);
                const response = await ContractorService.getJobDetails(jobId);
                if (response.success && response.data) {
                    setJobDetails(response.data);
                } else {
                    setHasError(true);
                }
            } catch (error) {
                devDebugger.error("Failed to fetch job details", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [jobId]);

    if (isLoading) {
        return (
            <View style={styles.root}>
                <TopHeader title={s.screenTitle} onBack={() => navigation.goBack()} />
                <ScrollView 
                    style={styles.flex1}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Job Title & Badge */}
                    <View style={styles.detailsHeader}>
                        <View style={styles.detailsTitleRow}>
                            <SkeletonFrame width="55%" height={verticalScale(24)} borderRadius={6} />
                            <SkeletonFrame width={horizontalScale(84)} height={verticalScale(24)} borderRadius={horizontalScale(8)} />
                        </View>
                        <View style={[styles.detailsCompanyRow, { marginTop: verticalScale(6) }]}>
                            <SkeletonFrame width="35%" height={verticalScale(16)} borderRadius={4} />
                        </View>
                    </View>

                    {/* Job Tags & Info */}
                    <View style={styles.detailsTagsContainer}>
                        <SkeletonFrame width="35%" height={verticalScale(18)} borderRadius={4} />
                        <SkeletonFrame width="90%" height={verticalScale(34)} borderRadius={4} />
                        <View style={styles.infoRowSplit}>
                            <SkeletonFrame width="45%" height={verticalScale(18)} borderRadius={4} style={{ marginRight: horizontalScale(16) }} />
                            <SkeletonFrame width="40%" height={verticalScale(18)} borderRadius={4} />
                        </View>
                    </View>

                    {/* Description */}
                    <SkeletonFrame width="35%" height={verticalScale(20)} borderRadius={4} style={styles.marginBottom10} />
                    <SkeletonFrame width="100%" height={verticalScale(75)} borderRadius={horizontalScale(12)} style={{ marginBottom: verticalScale(28) }} />

                    {/* Required Certification */}
                    <SkeletonFrame width="50%" height={verticalScale(20)} borderRadius={4} style={styles.marginBottom10} />
                    <SkeletonFrame width="100%" height={verticalScale(130)} borderRadius={horizontalScale(12)} style={{ marginBottom: verticalScale(28) }} />

                    {/* Required Contractor */}
                    <View style={styles.requiredContractorRow}>
                        <SkeletonFrame width="45%" height={verticalScale(20)} borderRadius={4} />
                        <SkeletonFrame width={horizontalScale(50)} height={horizontalScale(44)} borderRadius={horizontalScale(10)} />
                    </View>
                </ScrollView>

                {!isUpcoming && (
                    <View style={styles.footer}>
                        <View style={styles.buttonsRow}>
                            <SkeletonFrame width="48%" height={verticalScale(54)} borderRadius={horizontalScale(12)} />
                            <SkeletonFrame width="48%" height={verticalScale(54)} borderRadius={horizontalScale(12)} />
                        </View>
                    </View>
                )}
            </View>
        );
    }

    if (hasError || !jobDetails) {
        return (
            <View style={styles.root}>
                <TopHeader title={s.screenTitle} onBack={() => navigation.goBack()} />
                <View style={[styles.flex1]}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title="No Details Found" description="Related data not found at the moment." />
                </View>
            </View>
        );
    }

    const dateRange = jobDetails.startDate && jobDetails.endDate 
        ? `${getLocalDateTime(jobDetails.startDate).date} - ${getLocalDateTime(jobDetails.endDate).date}`
        : 'N/A';

    const timeRange = jobDetails.startDate && jobDetails.endDate
        ? `${getLocalDateTime(jobDetails.startDate).time} - ${getLocalDateTime(jobDetails.endDate).time}`
        : 'N/A';

    const badgeStyle = getStatusStyles(jobDetails?.status);

    const clientPhoneNumber =
        jobDetails?.clientCountryCode && jobDetails?.clientMobile
            ? `+${jobDetails.clientCountryCode}${jobDetails.clientMobile}`
            : jobDetails?.clientMobile;

    const handleVoiceCall = () => {
        if (!clientPhoneNumber) {
            Toast.showInfo(strings.chat.callNotAvailable);
            return;
        }
        const sanitizedPhone = String(clientPhoneNumber).replace(/[^0-9+]/g, '');
        Linking.openURL(`tel:${sanitizedPhone || clientPhoneNumber}`).catch(() => {
            Toast.showInfo(strings.chat.callNotAvailable);
        });
    };

    const handleOpenChat = () => {
        const isCompleted =
            tab?.toLowerCase() === 'completed' ||
            jobDetails?.status?.toLowerCase() === 'completed' ||
            jobDetails?.assignmentStatus?.toLowerCase() === 'completed' ||
            job?.status?.toLowerCase() === 'completed';

        const isActive = tab?.toLowerCase() === 'active' && !isCompleted;
        const isChatDisabled = !isActive || isCompleted;

        const resolvedJobOrderId =
            (jobDetails as any)?.jobOrderId ||
            (jobDetails as any)?.myAttendance?.jobOrderId;

        if (!resolvedJobOrderId) {
            devDebugger.warn('⚠️ No jobOrderId found for job. Cannot navigate to ChatScreen.');
            Toast.showInfo(strings.chat.chatNotAvailable);
            return;
        }

        devDebugger.log('💬 Contractor opening ChatScreen with jobOrderId:', resolvedJobOrderId, 'isChatDisabled:', isChatDisabled);

        navigation.navigate('ChatScreen', {
            recipientName: jobDetails?.clientName || jobDetails?.organizationName || 'Client',
            recipientAvatar: jobDetails?.organizationLogo || jobDetails?.organizationImage,
            jobOrderId: resolvedJobOrderId,
            jobTitle: jobDetails?.title,
            isChatDisabled: isChatDisabled,
            disabled: isChatDisabled,
        });
    };

    const isCancelled =
        Boolean(jobDetails?.isCancelledJob) ||
        Boolean(job?.isCancelledJob) ||
        jobDetails?.status?.toLowerCase() === 'cancelled' ||
        jobDetails?.assignmentStatus?.toLowerCase() === 'cancelled' ||
        job?.status?.toLowerCase() === 'cancelled';

    const isActiveTab = tab?.toLowerCase() === 'active';

    const headerRightActions = !isUpcoming && !isCancelled ? (
        <View style={styles.headerActionsRow}>
            {Boolean(clientPhoneNumber) && isActiveTab && (
                <TouchableOpacity 
                    onPress={handleVoiceCall}
                    style={styles.headerCircleBtn}
                    activeOpacity={0.7}
                >
                    <Image 
                        source={require('@assets/images/common/voice.png')}
                        style={styles.headerActionIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}
            <TouchableOpacity 
                onPress={handleOpenChat}
                style={styles.headerCircleBtn}
                activeOpacity={0.7}
            >
                <Image 
                    source={require('@assets/images/common/video.png')}
                    style={styles.headerActionIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    ) : null;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
            
            <TopHeader 
                title={s.screenTitle} 
                onBack={() => navigation.goBack()} 
                rightComponent={headerRightActions}
            />

            <ScrollView 
                style={styles.flex1}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.detailsHeader}>
                    <View style={styles.detailsTitleRow}>
                        <AppText style={styles.detailsTitle} numberOfLines={2} ellipsizeMode="tail">{jobDetails.title}</AppText>
                        <View style={[styles.badge, badgeStyle.badge]}>
                            <AppText style={[styles.badgeText, badgeStyle.text]}>
                                {badgeStyle.label}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.detailsCompanyRow}>
                        <AppText style={styles.detailsCompany}>{jobDetails.organizationName || 'N/A'}</AppText>
                        {Number(jobDetails.rating) > 0 && (
                            <View style={styles.detailsRatingRow}>
                                <Image 
                                    source={require('@assets/images/common/star.png')} 
                                    style={styles.starIcon} 
                                />
                                <AppText style={styles.ratingText}>
                                    {jobDetails.rating}
                                </AppText>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.detailsTagsContainer}>
                    <JobDetailTag 
                        icon={require('@assets/images/common/doller.png')} 
                        text={`${formatCurrency(jobDetails.hourlyRate || 0)}/h`} 
                        isPoposedRate={jobDetails.myInvitation?.isProposeRate}
                        rateLabel={jobDetails.myInvitation?.finalRate ? strings.auth.contractor.home.nagotiontedRate : strings.auth.contractor.home.proposedRateLabel}
                        negotiationRate={jobDetails.myInvitation?.finalRate ?? jobDetails.myInvitation?.workerHourlyRate}
                        jobRate={jobDetails.hourlyRate}
                        shouldShowJobText={true}
                    />
                    <JobDetailTag 
                        icon={require('@assets/images/common/locationPin.png')} 
                        text={jobDetails.location || s.locationUnknown} 
                        shouldShowJobText={false}
                    />
                    
                    <View style={styles.infoRowSplit}>
                        <Image source={require('@assets/images/common/calanderGray.png')} style={styles.infoIcon} />
                        <AppText style={styles.infoTextSplit}>{dateRange}</AppText>
                        <Image source={require('@assets/images/common/clockGray.png')} style={styles.infoIcon} />
                        <AppText style={styles.infoText}>{timeRange}</AppText>
                    </View>
                </View>

                <AppText style={styles.sectionTitle}>{s.description}</AppText>
                <View style={styles.descriptionBox}>
                    <AppText style={styles.descriptionText}>
                        {jobDetails.description || 'N/A'}
                    </AppText>
                </View>

                <AppText style={styles.sectionTitle}>{s.requiredCertification}</AppText>
                <View style={styles.certificationBox}>
                    {jobDetails.requiredCertifications && jobDetails.requiredCertifications.length > 0 ? (
                        jobDetails.requiredCertifications.map((cert: any, index: number) => (
                            <AppText key={index} style={styles.certificationItem}>
                                  {`\u2022 ${cert.name}`}
                            </AppText>
                        ))
                    ) : (
                        <AppText style={styles.certificationItem}>  {`\u2022 None`}</AppText>
                    )}
                </View>

                <View style={styles.requiredContractorRow}>
                    <AppText style={styles.sectionTitle}>{s.requiredContractor}</AppText>
                    <View style={styles.countBox}>
                        <AppText style={styles.countText}>{jobDetails.contractorsRequired || 1}</AppText>
                    </View>
                </View>
            </ScrollView>

            {tab !== 'Upcoming' && (
                <View style={styles.footer}>
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity 
                            style={[styles.paymentButton, jobDetails?.isCancelledJob && styles.disabledOpacity]} 
                            onPress={() => navigation.navigate('PaymentDetails', { job: jobDetails, jobId: jobDetails?._id, commingFromContractore: true })}
                            disabled={jobDetails?.isCancelledJob}
                        >
                            <AppText style={styles.paymentButtonText}>{s.payment}</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.attendanceButton, jobDetails?.isCancelledJob && styles.disabledOpacity]} 
                            onPress={() => navigation.navigate('AttendanceDetails', { job: jobDetails, jobId: jobDetails?._id, commingFromContractore: true })}
                            disabled={jobDetails?.isCancelledJob}
                        >
                            <AppText style={styles.attendanceButtonText}>{s.attendance}</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default MyJobDetailsScreen;
