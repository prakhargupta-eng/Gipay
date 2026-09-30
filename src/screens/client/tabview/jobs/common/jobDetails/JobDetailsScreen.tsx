import { formatCurrency } from '@utils/currencyUtils';
import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import colors from '@styles/colors';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import TopHeader from '@components/TopHeader';
import AppliedContractorCard from '../AppliedContractorCard/AppliedContractorCard';
import RaiseDisputeModal from '../RaiseDispute/RaiseDisputeModal';
import EmptyState from '@components/EmptyState';
import RatingModal from '../Rating/RatingModal';
import JobService from '@config/jobService';
import { getLocalDateTime } from '@utils/dateUtils';
import SkeletonFrame from '@components/SkeletonFrame';
import strings from '@constants/strings';
import { JobStatus } from '@constants/enums';
import { useSystemStore } from '@store/useSystemStore';
import styles from './styles';
import AppText from '@components/AppText';
import { getStatusStyles } from '@utils/statusUtils';
import { devDebugger } from '@utils/devDebugger';

const JobDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { job, jobStatus: initialStatus } = route.params || {};
  const [isDisputeVisible, setIsDisputeVisible] = React.useState(false);
  const [isRatingVisible, setIsRatingVisible] = React.useState(false);
  const [jobDetails, setJobDetails] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const isFirstMount = React.useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchJobDetails(isFirstMount.current);
      isFirstMount.current = false;
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchJobDetails(false);
    setRefreshing(false);
  }, [job]);

  const fetchJobDetails = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setIsLoading(true);
      }
      setHasError(false);
      const jobId = job?._id || job?.id;
      if (!jobId) {
        setHasError(true);
        return;
      }
      const response = await JobService.getJobDetails(jobId);
      if (response.success && response.data) {
        setJobDetails(response.data);
      } else {
        setHasError(true);
      }
      devDebugger.log("jobDetails", response.data);
    } catch (error) {
      devDebugger.error('Error fetching job details:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRaiseDispute = (data: any) => {
    devDebugger.log('Dispute Submitted:', data);
  };

  const handleRatingSubmit = (data: any) => {
    devDebugger.log('Rating Submitted:', data);
  };

  const data = jobDetails;

  const displayData = data ? {
    id: data.id || data._id || '',
    jobId: data.jobId || '',
    title: data.title || strings.common.na,
    status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : initialStatus || JobStatus.UPCOMING,
    company: data.organizationName || strings.common.na,
    rating: data.rating || '0.0',
    rate: data.hourlyRate != null ? `${formatCurrency(data.hourlyRate)}/h` : strings.common.na,
    location: data.location || strings.common.na,
    startDate: data.startDate || strings.common.na,
    endDate: data.endDate || strings.common.na,
    endTime: data.endTime || strings.common.na,
    hours: data.totalJobHours || 0,
    description: data.description || strings.client.jobDetails.noDescriptionProvided,
    certifications: data.requiredCertifications?.map((c: any) => `• ${c.certificationName || c.name || strings.common.unknown}`) || [],
    requiredContractors: data.contractorsRequired || 0,
    appliedContractorsCount: data.appliedContractorsCount || 0,
    assignedContractorsCount: data.assignedContractorsCount || 0,
    contractorList: data.contractorList || [],
    postOrderDocuments: data.postOrderDocuments || [],
    isAbleToDispute: data.isAbleToDispute,
    isCancelledJob: data.isCancelledJob || false,
  } : null;

  const disputeWindowHours = useSystemStore(state => state.settings?.disputeWindowHours) ?? 24;

  const canRaiseDispute = React.useMemo(() => {
    if (data?.isAbleToDispute) return true;
    if (!data?.isAbleToDispute) return false;
    // if (!data?.contractorList || data.contractorList.length === 0) return false;
    // if (!data?.endDate) return true;
    // // Combine endDate and endTime
    // const endDateTime = new Date(data.endDate);
    // if (data.endTime) {
    //   const timeParts = data.endTime.match(/(\d+):(\d+) (AM|PM)/);
    //   if (timeParts) {
    //     let hours = Number.parseInt(timeParts[1], 10);
    //     const minutes = Number.parseInt(timeParts[2], 10);
    //     const ampm = timeParts[3];
    //     if (ampm === 'PM' && hours < 12) hours += 12;
    //     if (ampm === 'AM' && hours === 12) hours = 0;
    //     endDateTime.setHours(hours, minutes, 0, 0);
    //   }
    // }

    // const hoursAfter = endDateTime.getTime() + (disputeWindowHours * 60 * 60 * 1000);
    // return Date.now() <= hoursAfter;
  }, [data, disputeWindowHours]);

  const unratedContractors = React.useMemo(() => {
    const list = data?.contractorList || [];
    const ratings = data?.jobRatings || [];
    const clientId = data?.clientId;

    // Filter contractors who haven't been rated by this client yet
    return list.filter((contractor: any) => {
      const hasRating = ratings.find((r: any) =>
        r.ratedTo === contractor.contractorId &&
        r.ratedBy === clientId
      );
      return !hasRating;
    });
  }, [data]);

  const allContractorsRated = unratedContractors.length === 0 && (data?.contractorList?.length > 0);

  const canManualClockIn = React.useMemo(() => {
    if (!data || !data.contractorList || data.contractorList.length === 0) return false;

    if (data.isManualclockInAvailable) return true;

    // Check time window: Job Start Time - 2 hours TO Job End Time + 2 hours
    if (data.startDate && data.startTime && data.endDate && data.endTime) {
      const parseTime = (dateStr: string, timeStr: string) => {
        const dt = new Date(dateStr);
        const timeParts = timeStr.match(/(\d+):(\d+) (AM|PM)/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = parseInt(timeParts[2], 10);
          const ampm = timeParts[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          dt.setHours(hours, minutes, 0, 0);
        }
        return dt.getTime();
      };

      const startDateTimeMs = parseTime(data.startDate, data.startTime);
      const endDateTimeMs = parseTime(data.endDate, data.endTime);

      // Use current time (which parses using the local time matching Date)
      const nowMs = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;

      const windowStart = startDateTimeMs - twoHoursMs;
      const windowEnd = endDateTimeMs + twoHoursMs;

      if (nowMs < windowStart || nowMs > windowEnd) {
        return false;
      }
    }

    // Check if anyone is still pending to clock in
    const anyonePending = data.contractorList.some((c: any) => {
      const status = c.attendance?.latestStatus;
      // If status is empty, 'Not Started', or 'Absent', they are pending clock-in
      return !status || status === 'Not Started' || status === 'Absent';
    });

    if (!anyonePending) return false;

    return true;
  }, [data]);

  const JobDetailsSkeleton = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <SkeletonFrame width={200} height={28} />
          <SkeletonFrame width={80} height={24} borderRadius={12} />
        </View>
        <View style={[styles.companyRow, { marginTop: 10 }]}>
          <SkeletonFrame width={150} height={20} />
          <SkeletonFrame width={50} height={20} />
        </View>
        <View style={[styles.detailsGrid, { marginTop: 20 }]}>
          <SkeletonFrame width="100%" height={20} style={{ marginBottom: 10 }} />
          <SkeletonFrame width="100%" height={20} style={{ marginBottom: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SkeletonFrame width="45%" height={20} />
            <SkeletonFrame width="45%" height={20} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonFrame width={100} height={22} style={{ marginBottom: 10 }} />
        <SkeletonFrame width="100%" height={80} borderRadius={12} />
      </View>

      <View style={styles.section}>
        <SkeletonFrame width={150} height={22} style={{ marginBottom: 10 }} />
        <SkeletonFrame width="100%" height={100} borderRadius={12} />
      </View>

      <View style={[styles.requiredContractorRow, { marginTop: 20 }]}>
        <SkeletonFrame width={150} height={22} />
        <SkeletonFrame width={40} height={24} borderRadius={12} />
      </View>

      <View style={styles.section}>
        <SkeletonFrame width={150} height={22} style={{ marginBottom: 10 }} />
        <SkeletonFrame width="100%" height={100} borderRadius={12} style={{ marginBottom: 10 }} />
        <SkeletonFrame width="100%" height={100} borderRadius={12} />
      </View>
    </ScrollView>
  );

  const effectiveStatus = initialStatus || (displayData ? displayData.status : null);

  const renderFooterContent = () => {
    if (!displayData) return null;
    switch (effectiveStatus) {
      case JobStatus.COMPLETED: {
        const isExpired = effectiveStatus === JobStatus.EXPIRED || displayData?.status.toLowerCase() === 'expired';

        return (
          <>
            <TouchableOpacity
              style={[styles.disputeBtn, (!canRaiseDispute || displayData.isCancelledJob) && { opacity: 0.5 }]}
              onPress={() => canRaiseDispute && !displayData.isCancelledJob && setIsDisputeVisible(true)}
              disabled={!canRaiseDispute || displayData.isCancelledJob}
            >
              <AppText style={styles.disputeBtnText}>{strings.client.jobDetails.raiseDispute}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clockInBtn, (allContractorsRated || displayData.isCancelledJob || isExpired) && { opacity: 0.5 }]}
              onPress={() => !allContractorsRated && !displayData.isCancelledJob && setIsRatingVisible(true)}
              disabled={allContractorsRated || displayData.isCancelledJob || isExpired}
            >
              <AppText style={styles.clockInBtnText}>{strings.client.jobDetails.pendingRating}</AppText>
            </TouchableOpacity>
          </>
        );
      }
      case JobStatus.ACTIVE:
        return (
          <>
            <TouchableOpacity
              style={[styles.disputeBtn, !canRaiseDispute && { opacity: 0.5 }]}
              onPress={() => canRaiseDispute && setIsDisputeVisible(true)}
              disabled={!canRaiseDispute}
            >
              <AppText style={styles.disputeBtnText}>{strings.client.jobDetails.raiseDispute}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clockInBtn,
                !canManualClockIn && { opacity: 0.5 }
              ]}
              onPress={() => canManualClockIn && navigation.navigate('ManualClockIn', { job: displayData })}
              disabled={!canManualClockIn}
            >
              <AppText style={styles.clockInBtnText}>{strings.client.jobDetails.manualClockIn}</AppText>
            </TouchableOpacity>
          </>
        );
      case JobStatus.UPCOMING:
        return null
      default:
        return null;
    }
  };

  const getContractorStatus = (contractor: any) => {
    if (displayData?.status === JobStatus.CANCELLED) {
      return strings.client.jobDetails.cancelled;
    }
    if (displayData?.status === JobStatus.UPCOMING) {
      return strings.client.jobDetails.notStarted;
    }
    return contractor.contractorStatus || contractor.attendance?.latestStatus || contractor.assignmentStatus;
  };

  const renderMainContent = () => {
    if (isLoading) {
      return <JobDetailsSkeleton />;
    }

    if (hasError || !displayData) {
      return (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            imageSource={require('@assets/images/common/noData.png')}
            title={strings.client.jobDetails.noDetailsFoundTitle || "Not Found"}
            description={strings.client.jobDetails.noDetailsFoundDesc || "Details not found."}
          />
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Job Summary */}
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <AppText style={styles.jobTitle} numberOfLines={2}>{displayData.title}</AppText>
            <View style={[
              styles.statusBadge,
              getStatusStyles(displayData.status).badge
            ]}>
              <AppText style={[
                styles.statusText,
                getStatusStyles(displayData.status).text
              ]}>
                {getStatusStyles(displayData.status).label}
              </AppText>
            </View>
          </View>

          <View style={styles.companyRow}>
            <AppText numberOfLines={1} adjustsFontSizeToFit style={[styles.companyName, { flex: 1, paddingRight: 10 }]}>{displayData.company}</AppText>
            {Number(displayData.rating) > 0 && (
              <View style={styles.ratingContainer}>
                <Image source={require('@assets/images/common/star.png')} style={styles.starIcon} />
                <AppText style={styles.ratingText}>{displayData.rating}</AppText>
              </View>
            )}
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Image source={require('@assets/images/common/doller.png')} style={styles.detailIcon} />
              <AppText style={styles.detailText}>{`${strings.client.jobDetails.jobRate} ${displayData.rate}`}</AppText>
            </View>
            <View style={[styles.detailItem, { alignItems: 'flex-start' }]}>
              <Image source={require('@assets/images/common/locationPin.png')} style={styles.detailIcon} />
              <AppText style={styles.detailText}>{displayData.location}</AppText>
            </View>
            <View style={styles.dateTimeRow}>
              <View style={styles.detailItem}>
                <Image source={require('@assets/images/common/calanderGray.png')} style={styles.detailIcon} />
                <AppText style={styles.detailText}>{`${getLocalDateTime(displayData.startDate).date} - ${getLocalDateTime(displayData.endDate).date}`}</AppText>
              </View>
              <View style={styles.detailItem}>
                <Image source={require('@assets/images/common/clockGray.png')} style={styles.detailIcon} />
                <AppText style={styles.detailText}>
                  {`${getLocalDateTime(displayData.startDate).time} - ${getLocalDateTime(displayData.endDate).time}`}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.jobDetails.description}</AppText>
          <View style={styles.cardBox}>
            <AppText style={styles.descriptionText}>{displayData.description}</AppText>
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.jobDetails.requiredCertification}</AppText>
          <View style={styles.cardBox}>
            {displayData.certifications.length > 0 ? (
              displayData.certifications.map((cert: string) => (
                <AppText key={cert} style={styles.certificationText}>{cert.startsWith('•') ? cert : `• ${cert}`}</AppText>
              ))
            ) : (
              <AppText style={styles.certificationText}>{strings.client.createJob.noCertifications}</AppText>
            )}
          </View>
        </View>

        {/* Required Contractor Count */}
        <View style={styles.requiredContractorRow}>
          <AppText style={styles.sectionTitle}>{strings.client.jobDetails.requiredContractor}</AppText>
          <View style={styles.countBadge}>
            <AppText style={styles.countText}>{displayData.requiredContractors}</AppText>
          </View>
        </View>

        {/* Applied Contractors */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.jobDetails.appliedContractor}</AppText>
          {displayData.contractorList.length > 0 ? (
            displayData.contractorList.map((contractor: any, index: number) => {
              const isContractorCancelled =
                Boolean(displayData.isCancelledJob) ||
                displayData.status?.toLowerCase() === 'cancelled' ||
                displayData.status?.toLowerCase() === 'canceled' ||
                initialStatus?.toLowerCase() === 'cancelled' ||
                initialStatus?.toLowerCase() === 'canceled' ||
                contractor.contractorStatus?.toLowerCase() === 'cancelled' ||
                contractor.contractorStatus?.toLowerCase() === 'canceled';

              const isMovingFromUpcomming =
                initialStatus?.toLowerCase() !== 'upcoming' &&
                (initialStatus?.toLowerCase() === 'active' ||
                  initialStatus?.toLowerCase() === 'completed' ||
                  displayData.status?.toLowerCase() === 'active' ||
                  displayData.status?.toLowerCase() === 'completed');

              return (
                <AppliedContractorCard
                  key={contractor.contractorId || index}
                  contractorId={contractor.contractorId}
                  contractorName={contractor.contractorName}
                  contractorRate={`${formatCurrency(contractor.hourlyRate)}/h`}
                  status={getContractorStatus(contractor)}
                  jobStatus={displayData.status}
                  tabStaus={initialStatus}
                  jobData={displayData}
                  contractorImageUrl={contractor.profileImageUrl}
                  contractorPhone={contractor.phoneNumber || (contractor.countryCode && contractor.mobile ? `+${contractor.countryCode}${contractor.mobile}` : contractor.mobile)}
                  contractorData={contractor}
                  isCancelled={isContractorCancelled}
                  isMovingFromUpcomming={isMovingFromUpcomming}
                />
              );
            })
          ) : (
            <View style={styles.cardBox}>
              <AppText style={styles.descriptionText}>{strings.client.jobDetails.noContractors}</AppText>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <TopHeader
        title={strings.client.jobDetails.screenTitle}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {renderMainContent()}
      </View>

      {/* Sticky Footer */}
      {!hasError && displayData && (effectiveStatus === JobStatus.UPCOMING || effectiveStatus === JobStatus.COMPLETED || effectiveStatus === JobStatus.ACTIVE) && (
        <View style={styles.footer}>
          {renderFooterContent()}
        </View>
      )}

      <RaiseDisputeModal
        visible={isDisputeVisible}
        onClose={() => setIsDisputeVisible(false)}
        onSubmit={handleRaiseDispute}
        jobId={displayData?.id || ''}
      />

      <RatingModal
        visible={isRatingVisible}
        onClose={() => setIsRatingVisible(false)}
        onSubmit={(payload) => {
          handleRatingSubmit(payload);
          fetchJobDetails(); // Refresh to update rating buttons
        }}
        jobId={displayData?.id || ''}
        contractorList={unratedContractors}
      />
    </View>
  );
};

export default JobDetailsScreen;
