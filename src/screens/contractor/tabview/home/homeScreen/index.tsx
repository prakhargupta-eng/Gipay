import React, { useState, useCallback } from 'react';
import {
    View,
    ScrollView,
    FlatList,
    RefreshControl,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import StatusBarBlurView from '@components/StatusBarBlurView';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import LinearGradient from '@components/LinearGradient';
import colors from '@styles/colors';
import BalanceDashboard from './components/BalanceDashboard';
import QuickActionButton from '@components/QuickActionButton';
import JobCard from './components/JobCard';
import SectionHeader from '@components/SectionHeader';
import ContractorService from '@config/contractorService';
import { useUserStore, checkIsPinSet } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import { requestNotificationPermission } from '@utils/notificationUtils';
import HomeSkeleton from './components/HomeSkeleton';
import EmptyState from '@components/EmptyState';
import styles from './styles';
import AppText from '@components/AppText';
import { Toast } from '@utils/ToastManager';
import { getLocalDateTime, checkClockInEligibility } from '@utils/dateUtils';
import { openExternalMap } from '@utils/mapUtils';
import { useLocation } from '@hooks/useLocation';
import ClockInOutPopup from '../../jobs/components/ClockInOutPopup';
import { devDebugger } from '@utils/devDebugger';
import PinInput from '@components/PinInput';
import { encryptPin } from '@utils/cryptoUtils';

const HomeScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ContractorAppStackParamList>>();
    const { userId } = useAuth();
    const { profile, setProfile, setContractorTabIndex, setJobsActiveSegment } = useUserStore();
    const { unreadCount, fetchUnreadCount } = useSystemStore();
    const isRestricted = useUserStore((state) => state.isRestricted());

    // State for Home Data and Loading
    const [homeData, setHomeData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [clockedInJobIds, setClockedInJobIds] = useState<string[]>([]);
    const [clockedInJobsTimeMap, setClockedInJobsTimeMap] = useState<Record<string, string>>({});
    const [clockedOutJobIds, setClockedOutJobIds] = useState<string[]>([]);

    // Transaction PIN Setup Modal State
    const [showSetPinModal, setShowSetPinModal] = useState(false);
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [setPinError, setSetPinError] = useState<string | undefined>(undefined);

    // Scroll state for StatusBar blur view
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY >= 40);
    }, []);

    const { verifyJobGeofence } = useLocation();

    const checkAndPromptPin = (profileData: any) => {
        if (!profileData) return;
        if (useUserStore.getState().hasDismissedPinPrompt) return;
        const isPinSetFully = checkIsPinSet(profileData);
        devDebugger.log('🔐 [Contractor Home] Checking transaction PIN status:', { isPinSetFully });

        if (!isPinSetFully) {
            setShowSetPinModal(true);
        }
    };

    const handleSetPinComplete = async (pin: string, encryptedPin?: string) => {
        setIsSettingPin(true);
        setSetPinError(undefined);
        try {
            const encPin = encryptedPin || encryptPin(pin).encryptedPin;
            devDebugger.log('🔐 [Contractor Home] Setting transaction PIN:', { pin, encryptedPin: encPin });
            const response = await ContractorService.setTransactionPin({
                transactionPin: encPin,
            });

            if (response.success) {
                setShowSetPinModal(false);
                Toast.show({
                    type: 'success',
                    text2: response.message || strings.transactionPin.setSuccess,
                });
                const current = useUserStore.getState().profile;
                if (current) {
                    setProfile({
                        ...current,
                        isPIN: true,
                        isPINSet: true,
                        keyset: true,
                        user: { ...current.user, isPIN: true, isPINSet: true },
                        profile: { ...current.profile, isPIN: true, isPINSet: true },
                    } as any);
                }
            } else {
                const errorMsg = response.message || strings.transactionPin.setFailed;
                setSetPinError(errorMsg);
                Toast.show({
                    type: 'error',
                    text2: errorMsg,
                });
            }
        } catch (error: any) {
            devDebugger.log('❌ [Contractor Home] Error setting PIN:', error);
            const errorMsg = error?.message || strings.transactionPin.setFailed;
            setSetPinError(errorMsg);
            Toast.show({
                type: 'error',
                text2: errorMsg,
            });
        } finally {
            setIsSettingPin(false);
        }
    };

    /**
     * Main Data Fetcher - Combines Profile and Home Data
     */
    const fetchData = useCallback(async (showSkeleton = true) => {
        if (!userId) return;

        try {
            if (showSkeleton) setIsLoading(true);
            fetchUnreadCount(); // Refresh unread count on fetch

            // Execute both API calls in parallel
            const [profileRes, homeRes] = await Promise.all([
                ContractorService.getProfileInfo(userId),
                ContractorService.getHomeData()
            ]);

            if (profileRes.success && profileRes.data) {
                setProfile(profileRes.data);
                checkAndPromptPin(profileRes.data);
            }

            if (homeRes.success && homeRes.data) {
                setHomeData(homeRes.data);
            }
        } catch (error) {
            devDebugger.error('Error fetching home data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [userId, setProfile, fetchUnreadCount]);

    const handleRefresh = useCallback(async () => {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            setRefreshing(false);
            return;
        }

        setRefreshing(true);
        await fetchData(false);
        setRefreshing(false);
    }, [fetchData]);

    /**
     * useFocusEffect ensures the API is called when the screen comes into focus.
     */
    useFocusEffect(
        useCallback(() => {
            requestNotificationPermission();

            // Only show skeleton if we don't have data yet
            fetchData(!homeData);

            return () => { };
        }, [fetchData])
    );


    if (isLoading && !homeData) {
        return <HomeSkeleton />;
    }

    // Map real data from Home API
    const todayJobs = homeData?.todaysJobs || homeData?.todayJobs || [];
    const upcomingJobs = homeData?.upcomingJobs || [];
    const earningOverview = homeData?.earningOverview || {};

    const formatAmount = (amt: any) => {
        const num = Number(amt || 0);
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const wallet = {
        totalBalance: formatAmount(earningOverview.walletBalance),
        pendingAmount: formatAmount(earningOverview.pendingAmount),
        completedAmount: formatAmount(earningOverview.completedAmountThisMonth)
    };

    const displayProfile = homeData?.profile || profile?.user || {};
    const displayName = displayProfile.name || displayProfile.fullname || displayProfile.fullName || "User";

    return (
        <View style={styles.root}>
            <StatusBarBlurView
                showBlur={isScrolled}
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            <ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.white}
                    />
                }
            >
                {/* ── Dashboard Header ── */}
                <BalanceDashboard
                    name={displayName}
                    totalBalance={wallet.totalBalance}
                    pendingAmount={wallet.pendingAmount}
                    completedAmount={wallet.completedAmount}
                    onWithdraw={() => navigation.navigate("WithdrawAmount", { availableBalance: Number(earningOverview.walletBalance || 0) })}
                    onNotification={() => navigation.navigate('Notifications')}
                    unreadCount={unreadCount}
                />

                <LinearGradient
                    colors={colors.quickActionGradient}
                    locations={[0.2, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.quickActionsContainer}
                >
                    <View style={styles.quickActionsCard}>
                        <AppText style={styles.quickActionsTitle}>{strings.client.home.quickActions}</AppText>
                        <View style={styles.quickActionsInner}>
                            <QuickActionButton
                                label={strings.auth.contractor.home.discoverJobs}
                                icon={require('@assets/images/contractor/quickActionContractor/discoverJob.png')}
                                onPress={() => navigation.navigate('DiscoverJobs')}
                            />
                            <QuickActionButton
                                label={strings.auth.contractor.home.jobInvitations}
                                icon={require('@assets/images/contractor/quickActionContractor/jobInvite.png')}
                                onPress={() => navigation.navigate('JobInvitations')}
                            />
                            <QuickActionButton
                                label={strings.auth.contractor.home.disputesHistory}
                                icon={require('@assets/images/contractor/quickActionContractor/disputes.png')}
                                onPress={() => navigation.navigate('DisputeHistory')}
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* ── Today's Jobs ── */}
                {todayJobs?.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader
                            title={strings.auth.contractor.home.todayJobs}
                            actionText={todayJobs.length >= 2 ? strings.client.home.seeAll : undefined}
                            onActionPress={() => {
                                setJobsActiveSegment('Active');
                                setContractorTabIndex(1);
                            }}
                            containerStyle={{ paddingHorizontal: 20 }}
                        />
                        <FlatList
                            data={todayJobs}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.horizontalList}
                            renderItem={({ item }) => (
                                <JobCard
                                    title={item.title || item.jobTitle}
                                    company={item.organizationName || item.companyName}
                                    date={item.startDate && item.endDate ? `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}` : item.startDate ? getLocalDateTime(item.startDate).date : item.date}
                                    time={`${getLocalDateTime(item.startDate || item.date).time} - ${getLocalDateTime(item.endDate || item.date).time}`}
                                    rate={String(item.hourlyRate || item.rate || 0)}
                                    finalRate={item.finalRate ? String(item.finalRate) : undefined}
                                    proposedRate={item.proposedRate ? String(item.proposedRate) : undefined}
                                    address={item.location || item.address}
                                    status={item.status}
                                    showActions={true}
                                    fullWidth={todayJobs.length === 1}
                                    isClockedIn={item.isClockedIn}
                                    clockOutTime={item.clockOutTime}
                                    isCancelledJob={item.isCancelledJob}
                                    onClockIn={() => {
                                        if (item.isClockedout) {
                                            Toast.show({ type: 'error', text2: strings.auth.contractor.home.clockInOutPopup.jobCompleted });
                                            return;
                                        }
                                        if (!item.isClockedIn) {
                                            const hasActiveClockIn = todayJobs.some((j: any) => j.isClockedIn);
                                            if (hasActiveClockIn) {
                                                Toast.show({ type: 'error', text2: strings.auth.contractor.home.clockInOutPopup.activeJobRunning });
                                                return;
                                            }

                                            const errorMsg = checkClockInEligibility(item.startDate, item.endDate, 'clockIn');
                                            devDebugger.log(errorMsg, 'errorMsg');
                                            if (errorMsg) {
                                                Toast.show({ type: 'info', text2: errorMsg });
                                                return;
                                            }
                                        }
                                        devDebugger.log(item.isClockedIn, 'isClockedIn', item, 'item');
                                        verifyJobGeofence(item, item.isClockedIn ? 'clockOut' : 'clockIn', (jobWithLoc) => {
                                            setSelectedJob(jobWithLoc);
                                        });
                                    }}
                                    onNavigation={() => openExternalMap(
                                        Number(item.latitude),
                                        Number(item.longitude),
                                        item.location || item.address
                                    )}
                                    onPress={() => navigation.navigate('MyJobDetails', { jobId: item.id || item._id, tab: 'Active' })}
                                />
                            )}
                        />
                    </View>
                )}

                {/* ── Upcoming Jobs ── */}
                {(upcomingJobs?.length > 0 || todayJobs?.length === 0) && (
                    <View style={styles.section}>
                        <SectionHeader
                            title={strings.auth.contractor.home.upcomingJobs}
                            actionText={upcomingJobs.length >= 2 ? strings.client.home.seeAll : undefined}
                            onActionPress={() => {
                                setJobsActiveSegment('Upcoming');
                                setContractorTabIndex(1);
                            }}
                            containerStyle={{ paddingHorizontal: 20 }}
                        />
                        {upcomingJobs.length > 0 ? (
                            <FlatList
                                data={upcomingJobs}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.horizontalList}
                                renderItem={({ item }) => (
                                    <JobCard
                                        title={item.title || item.jobTitle}
                                        company={item.organizationName || item.companyName}
                                        date={item.startDate && item.endDate ? `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}` : item.startDate ? getLocalDateTime(item.startDate).date : item.date}
                                        time={`${getLocalDateTime(item.startDate || item.date).time} - ${getLocalDateTime(item.endDate || item.date).time}`}
                                        rate={String(item.hourlyRate || item.rate || 0)}
                                        finalRate={item.finalRate ? String(item.finalRate) : undefined}
                                        proposedRate={item.proposedRate ? String(item.proposedRate) : undefined}
                                        address={item.location || item.address}
                                        status={item.status}
                                        showActions={false}
                                        clockOutTime={item.clockOutTime}
                                        fullWidth={upcomingJobs.length === 1}
                                        onPress={() => navigation.navigate('MyJobDetails', { jobId: item.id || item._id, tab: 'Upcoming' })}
                                    />
                                )}
                            />
                        ) : (
                            <EmptyState
                                imageSource={require('@assets/images/common/noData.png')}
                                title={strings.auth.contractor.home.noUpcomingJobs}
                                description={strings.auth.contractor.home.noUpcomingJobsDesc}
                            />
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ── Verification Banner (Bottom Fixed) ── */}
            {isRestricted && (
                <View style={styles.bannerContainer}>
                    <View style={styles.bannerContent}>
                        <AppText style={styles.bannerText}>
                            {strings.auth.contractor.jobDetails.kycPendingMessage}
                        </AppText>
                    </View>
                </View>
            )}

            <ClockInOutPopup
                visible={!!selectedJob}
                job={selectedJob}
                onClose={(action, clockInTime) => {
                    // Preserve job info before clearing
                    const job = selectedJob;
                    setSelectedJob(null);
                    if (action === 'clockIn' && job) {
                        const jobId = job.id || job._id;
                        setClockedInJobIds(prev => [...prev, jobId]);
                        if (clockInTime) {
                            setClockedInJobsTimeMap(prev => ({ ...prev, [jobId]: clockInTime }));
                        }
                    } else if (action === 'clockOut' && job) {
                        const jobId = job.id || job._id;
                        setClockedOutJobIds(prev => [...prev, jobId]);

                        // Optimistically update homeData to instantly disable the JobCard
                        setHomeData((prevData: any) => {
                            if (!prevData) return prevData;
                            const updateJobs = (jobsArray: any[]) => jobsArray?.map(j => {
                                if ((j.id || j._id) === jobId) {
                                    return { ...j, clockOutTime: clockInTime || new Date().toISOString(), isClockedIn: false, isClockedout: true };
                                }
                                return j;
                            });
                            return {
                                ...prevData,
                                todaysJobs: updateJobs(prevData.todaysJobs),
                                todayJobs: updateJobs(prevData.todayJobs),
                                upcomingJobs: updateJobs(prevData.upcomingJobs)
                            };
                        });
                    }
                    if (action) fetchData(false);
                }}
            />

            {/* Transaction PIN Setup Modal */}
            <PinInput
                visible={showSetPinModal}
                mode="setup"
                onClose={() => {
                    setShowSetPinModal(false);
                    setSetPinError(undefined);
                    useUserStore.getState().setHasDismissedPinPrompt(true);
                }}
                loading={isSettingPin}
                error={setPinError}
                onComplete={(pin, encryptedPin) => handleSetPinComplete(pin, encryptedPin)}
            />
        </View>
    );
};

export default HomeScreen;
