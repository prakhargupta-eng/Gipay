import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useLocation } from '@hooks/useLocation';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import styles from './styles';
import TopHeader from '@components/TopHeader';
import MatchesDetailsSkeleton from './components/MatchesDetailsSkeleton';
import strings from '@constants/strings';
import colors from '@styles/colors';
import { useSystemStore } from '@store/useSystemStore';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import { checkClockInEligibility, getLocalDateTime, isSameDay } from '@utils/dateUtils';
import AppText from '@components/AppText';
import { getStatusStyles } from '@utils/statusUtils';
import RaiseDisputeModal from '@screens/client/tabview/jobs/common/RaiseDispute/RaiseDisputeModal';
import ClockInOutPopup from '@screens/contractor/tabview/jobs/components/ClockInOutPopup';
import JobLocationMap from '@components/JobLocationMap';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';


const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};



const MatchesDetailsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ContractorAppStackParamList>>();
    const route = useRoute<RouteProp<ContractorAppStackParamList, 'MatchesDetails'>>();
    const s = strings.auth.contractor.matches;
    const { jobData }: any = route.params || {};

    const [detailData, setDetailData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [clockedInJobIds, setClockedInJobIds] = useState<string[]>([]);
    const [clockedInJobsTimeMap, setClockedInJobsTimeMap] = useState<Record<string, string>>({});
    const [clockedOutJobIds, setClockedOutJobIds] = useState<string[]>([]);

    // Live location tracking
    const { verifyJobGeofence } = useLocation();

    const [isDisputeVisible, setIsDisputeVisible] = useState(false);
    const [isClockInVisible, setIsClockInVisible] = useState(false);

    const assets = {
        star: require('@assets/images/common/star.png'),
        dollar: require('@assets/images/common/doller.png'),
        location: require('@assets/images/common/locationPin.png'),
        calendar: require('@assets/images/common/calanderGray.png'),
        clock: require('@assets/images/common/clockGray.png'),
        dummyUser: require('@assets/images/common/dummyUser.png'),
    };

    const fetchDetails = async (showSkeleton = true) => {
        if (showSkeleton) setIsLoading(true);
        setHasError(false);
        try {
            const appId = jobData?.applicationId || jobData?.matchId || jobData?.id || jobData?._id;
            if (!appId) {
                if (showSkeleton) setIsLoading(false);
                return;
            }
            const res = await ContractorService.getMatchJobDetail(appId);
            if (res.success && res.data) {
                setDetailData(res.data?.data || res.data?.results || res.data);
            } else if (!jobData?.title && !jobData?.organizationName) {
                setDetailData(null);
                setHasError(true);
            }
        } catch (error: any) {
            devDebugger.error('Error fetching match job details:', error);
            setHasError(true);
            Toast.show({
                type: 'error',
                text2: error.message || 'Failed to load details'
            });
            if (!jobData?.title && !jobData?.organizationName) {
                setDetailData(null);
            }
        } finally {
            if (showSkeleton) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [jobData]);

    const displayData = detailData || {};
    const disputeWindowHours = useSystemStore(state => state.settings?.disputeWindowHours) ?? 24;

    const currentJobId = displayData.jobId;
    // Status can be from route params or from api. Format it nicely.
    const rawStatus = displayData.matchStatus || displayData.status || (jobData?.matchStatus) || 'Pending';
    const statusText = capitalize(rawStatus);
    const isConfirmed = statusText === 'Confirmed';

    const requiredCerts = displayData.requiredCertifications || displayData.requiredCertification || displayData.certifications || [];
    const certArray = Array.isArray(requiredCerts) ? requiredCerts : typeof requiredCerts === 'string' ? [requiredCerts] : [];

    // Check if contractor has left the job (from API response or status)
    const isLeftJob = displayData?.isLeftJob === true || displayData?.isLeftJob === 'true' || statusText.toLowerCase() === 'left';
    // Disable clock action if already clocked out or if contractor has left the job
    const isClockDisabled = Boolean(displayData?.clockedOut || displayData?.clockOutTime || isLeftJob);
    // Keep bottom bar visible for confirmed jobs or if contractor has left the job
    const showFooter = isConfirmed || isLeftJob;

    // Check if job is completed or end date/time has passed (hide Leave Job / Continue Job options in dispute modal)
    const isJobCompleted = displayData?.jobStatus?.toLowerCase() === 'completed';

    const isJobTimePassed = React.useMemo(() => {
        if (displayData?.endDate) {
            const endDateTime = new Date(displayData.endDate);
            if (!isNaN(endDateTime.getTime())) {
                if (displayData?.endTime) {
                    const timeParts = displayData.endTime.match(/(\d+):(\d+) (AM|PM)/i);
                    if (timeParts) {
                        let hours = Number.parseInt(timeParts[1], 10);
                        const minutes = Number.parseInt(timeParts[2], 10);
                        const ampm = timeParts[3]?.toUpperCase();
                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;
                        endDateTime.setHours(hours, minutes, 0, 0);
                    }
                }
                if (Date.now() > endDateTime.getTime()) {
                    return true;
                }
            }
        }
        return false;
    }, [displayData?.endDate, displayData?.endTime]);

    const isSingleDay = isSameDay(displayData?.startDate, displayData?.endDate);
    const hideDisputeOption = isJobCompleted || isJobTimePassed || isSingleDay;

    const canRaiseDispute = React.useMemo(() => {
        // 1. Disable if loading or if displayData is not fully loaded yet
        if (isLoading || !detailData) {
            return false;
        }

        // 2. Disable if contractor left the job or API response says they cannot raise dispute
        if (isLeftJob || !displayData.isAbleToRaiseDispute) {
            return false;
        }


        // // MOCKED: Simulated current time for testing (5 minutes after start time to bypass 'not started' and 'expired' checks)
        // // For production, replace this with: const nowTime = Date.now();
        // const nowTime = displayData.startDate
        //     ? new Date(displayData.startDate).getTime() + (5 * 60 * 1000)
        //     : Date.now();

        // // 3. Disable if the job is not started
        // if (displayData.startDate) {
        //     const startDateTime = new Date(displayData.startDate);
        //     if (!isNaN(startDateTime.getTime()) && Date.now() < startDateTime.getTime()) {
        //         return false;
        //     }
        // }

        // 4. Disable if the job has ended and passed the dispute window
        if (displayData.endDate) {
            const endDateTime = new Date(displayData.endDate);
            if (!isNaN(endDateTime.getTime())) {
                const windowClosedTime = endDateTime.getTime() + (disputeWindowHours * 60 * 60 * 1000);
                if (Date.now() > windowClosedTime) {
                    return false;
                }
            }
        }

        if (displayData.isClockedIn) {
            return true;
        }
        return true;
    }, [isLoading, detailData, displayData, disputeWindowHours, isLeftJob]);

    const handleAction = async (action: string) => {
        if (action === 'Raise Dispute') {
            if (isLeftJob) return;
            setIsDisputeVisible(true);
        } else if (action === 'Clock In') {
            // Silently block clock-in if contractor already left the job (no toast)
            if (isLeftJob) {
                return;
            }
            if (displayData.isClockedOut) {
                Toast.show({ type: 'info', text2: strings.auth.contractor.home.clockInOutPopup.jobCompleted });
                return;
            }
            try {
                const homeRes = await ContractorService.getHomeData();
                const todayJobs = homeRes.success ? (homeRes.data?.todaysJobs || homeRes.data?.todayJobs || []) : [];
                const hasActiveClockIn = todayJobs.some((j: any) => j.isClockedIn);

                if (hasActiveClockIn) {
                    Toast.show({ type: 'error', text2: strings.auth.contractor.home.clockInOutPopup.activeJobRunning });
                    return;
                }
            } catch (error) {
                devDebugger.error('Error checking active clock in:', error);
            }

            const errorMsg = checkClockInEligibility(displayData?.startDate, displayData?.endDate, action);
            if (errorMsg) {
                Toast.show({ type: 'info', text2: errorMsg });
                return;
            }
            verifyJobGeofence(displayData, 'clockIn', () => {
                setIsClockInVisible(true);
            });
        } else if (action === 'Clock Out') {
            verifyJobGeofence(displayData, 'clockOut', () => {
                setIsClockInVisible(true);
            });
        } else {
            Toast.show({
                type: 'success',
                text2: `${action} triggered!`
            });
        }
    };

    const getClockInButtonText = () => {
        if (displayData?.clockedOut || !!displayData?.clockOutTime) {
            return 'Clocked Out';
        }
        if (displayData?.isClockedIn) {
            return 'Clock Out';
        }
        return s.clockIn;
    };

    const mapDestination = {
        latitude: Number(displayData.latitude) || 37.7849,
        longitude: Number(displayData.longitude) || -122.4094,
        address: displayData.location,
    };

    if (isLoading) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader
                    title={strings.auth.contractor.jobDetails.screenTitle}
                    onBack={() => navigation.goBack()}
                />
                <MatchesDetailsSkeleton />
            </View>
        );
    }

    if (hasError || !detailData || (!detailData.title && !detailData.jobTitle && !detailData.organizationName)) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader
                    title={strings.auth.contractor.jobDetails.screenTitle}
                    onBack={() => navigation.goBack()}
                />
                <View style={{ flex: 1 }}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title="No Details Found" description="Related data not found at the moment." />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={strings.auth.contractor.jobDetails.screenTitle}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Section */}
                <View style={styles.headerInfo}>

                    <View style={styles.headerTextContent}>
                        <AppText style={styles.jobTitle} numberOfLines={1}>
                            {displayData.title || displayData.jobTitle}
                        </AppText>
                        <AppText style={styles.companyName}>{displayData.organizationName || displayData.company}</AppText>
                    </View>
                    <View style={styles.headerRightContent}>
                        <View style={[
                            styles.statusBadge,
                            getStatusStyles(displayData.matchStatus || statusText).badge
                        ]}>
                            <AppText style={[
                                styles.statusText,
                                getStatusStyles(displayData.matchStatus || statusText).text
                            ]}>
                                {getStatusStyles(displayData.matchStatus || statusText).label}
                            </AppText>
                        </View>
                        {(() => {
                            const ratingVal = displayData.organizationRating || displayData.rating;
                            return (ratingVal && parseFloat(ratingVal) > 0) ? (
                                <View style={styles.ratingRow}>
                                    <Image source={assets.star} style={styles.starIcon} />
                                    <AppText style={styles.ratingText}>{ratingVal}</AppText>
                                </View>
                            ) : null;
                        })()}
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Image source={assets.dollar} style={styles.detailIcon} />
                        {displayData.isProposeRate || displayData.isNegotiated || displayData.isNegotiate ? (
                            <View style={styles.negotiationRatesContainer}>
                                <AppText style={styles.originalRateText}>
                                    {s.jobRate(displayData.originalOfferRate || displayData.originalHourlyRate || displayData.hourlyRate || displayData.rate)}
                                </AppText>
                                {displayData?.finalRate ? (
                                    <AppText style={styles.negotiatedRateText}>
                                        {s.negotiatedRate(displayData.finalRate)}
                                    </AppText>
                                ) : (
                                    <AppText style={styles.negotiatedRateText}>
                                        {s.proposedRate(displayData.proposedRate)}
                                    </AppText>
                                )}
                            </View>
                        ) : (
                            <AppText style={styles.detailText}>{s.jobRate(displayData.hourlyRate || displayData.rate || 0)}</AppText>
                        )}
                    </View>

                    <View style={[styles.detailItem, styles.locationDetailItem]}>
                        <Image source={assets.location} style={[styles.detailIcon, styles.locationIcon]} />
                        <AppText style={styles.detailText}>
                            {displayData.location || 'Unknown Location'}
                        </AppText>
                    </View>

                    <View style={styles.dateTimeRow}>
                        <View style={[styles.detailItem, styles.dateTimeItemLeft]}>
                            <Image source={assets.calendar} style={styles.detailIcon} />
                            <AppText style={styles.detailText}>
                                {displayData.startDate && displayData.endDate
                                    ? `${getLocalDateTime(displayData.startDate).date} - ${getLocalDateTime(displayData.endDate).date}`
                                    : getLocalDateTime(displayData.startDate || displayData.dateRange).date}
                            </AppText>
                        </View>
                        <View style={[styles.detailItem, styles.dateTimeItemRight]}>
                            <Image source={assets.clock} style={styles.detailIcon} />
                            <AppText style={styles.detailText}>{getLocalDateTime(displayData.startDate || displayData.date).time} - {getLocalDateTime(displayData.endDate).time}</AppText>
                        </View>
                    </View>
                </View>

                {/* Map Section for Confirmed or Left Jobs */}
                {(isConfirmed || isLeftJob) && (
                    <JobLocationMap
                        destination={mapDestination}
                    />
                )}

                {/* About Section */}
                <AppText style={styles.sectionTitle}>{strings.auth.contractor.jobDetails.aboutThisJob}</AppText>
                <View style={styles.descriptionBox}>
                    <AppText style={styles.descriptionText}>
                        {displayData.description || displayData.aboutJob || strings.auth.contractor.jobDetails.description}
                    </AppText>
                </View>

                {/* Certification Section */}
                {(
                    <>
                        <AppText style={styles.sectionTitle}>{strings.auth.contractor.jobDetails.requiredCertification}</AppText>
                        <View style={styles.certificationBox}>
                            {certArray.map((cert: any, index: number) => {
                                const certName = typeof cert === 'string' ? cert : cert?.name;
                                if (!certName) return null;
                                return (
                                    <AppText key={index} style={styles.certText}>•  {certName}</AppText>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Contractors Required Section */}
                <View style={styles.contractorRow}>
                    <AppText style={styles.contractorLabel}>{strings.auth.contractor.jobDetails.requiredContractor}</AppText>
                    <View style={styles.countBox}>
                        <AppText style={styles.countText}>{displayData.contractorsRequired}</AppText>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons for Confirmed jobs or Left jobs */}
            {showFooter && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.footerButton, styles.disputeButton, !canRaiseDispute && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={() => handleAction('Raise Dispute')}
                        disabled={!canRaiseDispute}
                    >
                        <AppText style={styles.disputeBtnText}>{s.raiseDispute}</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            styles.clockInButton,
                            (displayData?.clockedOut || !!displayData?.clockOutTime) && { opacity: 0.5, backgroundColor: '#9CA3AF' },
                            // If contractor has left the job, show disabled styling (opacity 0.5 and gray background)
                            isLeftJob && { opacity: 0.5, backgroundColor: '#9CA3AF' }
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleAction(displayData?.isClockedIn && !displayData?.clockedOut ? 'Clock Out' : 'Clock In')}
                        disabled={isClockDisabled}
                    >
                        <AppText style={styles.clockInBtnText}>
                            {getClockInButtonText()}
                        </AppText>
                    </TouchableOpacity>
                </View>
            )}
            <RaiseDisputeModal
                visible={isDisputeVisible}
                onClose={() => setIsDisputeVisible(false)}
                jobId={currentJobId}
                attendanceId={displayData?.attendanceId}
                commingFromContractore={true}
                hideOption={hideDisputeOption}
                onSubmit={(data) => {
                    devDebugger.log('Dispute submitted', data);
                    setIsDisputeVisible(false);
                    fetchDetails();
                }}
            />

            {displayData && (
                <ClockInOutPopup
                    visible={isClockInVisible}
                    onClose={(type?: 'clockIn' | 'clockOut', clockInTime?: string) => {
                        setIsClockInVisible(false);
                        if (type === 'clockIn') {
                            setDetailData((prev: any) => prev ? { ...prev, isClockedIn: true, clockedOut: false, clockInTime } : prev);
                            fetchDetails(false);
                        } else if (type === 'clockOut') {
                            setDetailData((prev: any) => prev ? { ...prev, isClockedIn: true, clockedOut: true } : prev);
                            fetchDetails(false);
                        }
                    }}
                    job={displayData}
                />
            )}
        </View>
    );
};

export default MatchesDetailsScreen;
