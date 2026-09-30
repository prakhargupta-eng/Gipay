import { formatCurrency } from '@utils/currencyUtils';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import StatusBarBlurView from '@components/StatusBarBlurView';
import LinearGradient from '@components/LinearGradient';
import StatCard from './components/StatCard';
import ClientBalanceDashboard from './components/ClientBalanceDashboard';
import QuickActionButton from '@components/QuickActionButton';
import PaymentItem from './components/PaymentItem';
import SectionHeader from '@components/SectionHeader';
import EmptyState from '@components/EmptyState';
import styles from './styles';
import Colors from '@styles/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import strings from '@constants/strings';
import { useUserStore, checkIsPinSet } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import AuthService from '@config/authService';
import PinInput from '@components/PinInput';
import { encryptPin } from '@utils/cryptoUtils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import { requestNotificationPermission } from '@utils/notificationUtils';
import { getTimeAgo } from '@utils/dateUtils';
import HomeSkeleton from './components/HomeSkeleton';
import { Toast } from '@utils/ToastManager';
import { verticalScale } from '@styles/mixins';
import { devDebugger } from '@utils/devDebugger';


// ─── Component ────────────────────────────────────────────────────────
const getDynamicStats = (data: any) => {
  const stats = data?.jobStats || {};
  return [
    { count: stats.jobsInProgress || 0, label: strings.client.home.progress, labelColor: Colors.purple, icon: require('@assets/images/client/progress.png') },
    { count: stats.scheduledJobs || 0, label: strings.client.home.scheduled, labelColor: Colors.blue, icon: require('@assets/images/client/scheduled.png') },
    { count: stats.jobInvites || 0, label: strings.client.home.jobInvites, labelColor: Colors.orange, icon: require('@assets/images/client/jobInvites.png') },
    { count: stats.jobsAwaitingApproval || 0, label: strings.client.home.pending, labelColor: Colors.pending, icon: require('@assets/images/client/pending.png') },
  ];
};

const QUICK_ACTIONS = [
  { label: strings.client.home.createJob, icon: require('@assets/images/client/createJob.png') },
  { label: strings.client.home.jobMatches, icon: require('@assets/images/client/jobMatch.png') },
  { label: strings.client.home.paymentInvoices, icon: require('@assets/images/client/payment.png') },
  { label: strings.client.home.disputesHistory, icon: require('@assets/images/client/disputedHistory.png') },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientAppStackParamList>>();
  const { clientProfile, setClientProfile, setClientTabIndex, setJobsActiveSegment } = useUserStore();
  const { unreadCount, fetchUnreadCount } = useSystemStore();
  const [isLoading, setIsLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [setPinError, setSetPinError] = useState<string | undefined>(undefined);

  // Scroll state for StatusBar blur view
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY >= 40);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const checkAndPromptPin = (profileData: any) => {
    if (!profileData) return;
    if (useUserStore.getState().hasDismissedPinPrompt) return;
    const isPinSetFully = checkIsPinSet(profileData);
    devDebugger.log('🔐 [Client Home] Checking transaction PIN status:', { isPinSetFully });

    if (!isPinSetFully) {
      setShowSetPinModal(true);
    }
  };

  const handleSetPinComplete = async (pin: string, encryptedPin?: string) => {
    setIsSettingPin(true);
    setSetPinError(undefined);
    try {
      const encPin = encryptedPin || encryptPin(pin).encryptedPin;
      devDebugger.log('🔐 [Client Home] Setting transaction PIN:', { pin, encryptedPin: encPin });
      const response = await AuthService.setTransactionPin({
        transactionPin: encPin,
      });

      if (response.success) {
        setShowSetPinModal(false);
        Toast.show({
          type: 'success',
          text2: response.message || strings.client.home.setPinSuccess,
        });
        const current = useUserStore.getState().clientProfile;
        if (current) {
          setClientProfile({
            ...current,
            isPIN: true,
            isPINSet: true,
            keyset: true,
            user: { ...current.user, isPIN: true, isPINSet: true, keyset: true },
            profile: { ...current.profile, isPIN: true, isPINSet: true, keyset: true },
          } as any);
        }
      } else {
        const errorMsg = response.message || strings.client.home.setPinFailed;
        setSetPinError(errorMsg);
        Toast.show({
          type: 'error',
          text2: errorMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [Client Home] Error setting PIN:', error);
      const errorMsg = error?.message || strings.client.home.setPinFailed;
      setSetPinError(errorMsg);
      Toast.show({
        type: 'error',
        text2: errorMsg,
      });
    } finally {
      setIsSettingPin(false);
    }
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      fetchUnreadCount(); // Refresh unread count
      const userState = useUserStore.getState();
      const currentProfile = userState.clientProfile;
      
      const isProfileVerified = 
        currentProfile?.profile?.businessRegistrationDocument?.verificationStatus?.toLowerCase() === 'approved' ||
        currentProfile?.profile?.verificationStatus?.toLowerCase() === 'approved';

      const isPinSet = checkIsPinSet(currentProfile);

      // Both done: profile is verified AND PIN is set -> Do NOT run profile API, only fetch home API
      if (currentProfile && isProfileVerified && isPinSet) {
        const homeRes = await AuthService.getClientHome();
        if (homeRes.success && homeRes.data) {
          setHomeData(homeRes.data);
        }
      } else {
        // If any one key is false (profile not verified OR PIN not set, or initial load)
        // Run both APIs every time app is opened and present the set PIN screen
        const [profileRes, homeRes] = await Promise.all([
          AuthService.getClientProfile(),
          AuthService.getClientHome()
        ]);

        if (profileRes.success && profileRes.data) {
          setClientProfile(profileRes.data);
          checkAndPromptPin(profileRes.data);
        } else if (currentProfile) {
          checkAndPromptPin(currentProfile);
        }

        if (homeRes.success && homeRes.data) {
          setHomeData(homeRes.data);
        }
      }
    } catch (error) {
      devDebugger.log('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRefresh = () => {
    fetchDashboardData(true);
  };


  const handleQuickAction = (label: string) => {
    switch (label) {
      case strings.client.home.createJob:
        if (useUserStore.getState().isClientRestricted()) {
          Toast.show({
            type: 'info',
            text2: strings.client.home.accountVerificationInProgress,
            duration: 4500
          });
          return;
        }
        navigation.navigate('CreateJob', {});
        break;
      case strings.client.home.jobMatches:
        navigation.navigate('JobMatches');
        break;
      case strings.client.home.paymentInvoices:
        navigation.navigate('PaymentsAndInvoices');
        break;
      case strings.client.home.disputesHistory:
        navigation.navigate('DisputeHistory');
        break;
      default:
        devDebugger.log('Quick action:', label);
    }
  };

  const handleSeeAllPayments = () => {
    navigation.navigate('PaymentsAndInvoices');
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <View style={styles.container}>
      <StatusBarBlurView
        showBlur={isScrolled}
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressViewOffset={verticalScale(40)}
          />
        }
      >
        <ClientBalanceDashboard
          name={clientProfile?.user?.fullname || clientProfile?.profile?.contactPersonName || 'User'}
          escrowAmount={homeData?.escrowSummary?.totalEscrowAmount != null ? Number.parseFloat(Number(homeData.escrowSummary.totalEscrowAmount).toFixed(2)).toString() : '0'}
          onNotification={() => navigation.navigate('Notifications')}
          unreadCount={unreadCount}
        />

        <View style={styles.whiteBackground}>
          {/* ─── Stats Grid ──────────────────────────────────── */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              {getDynamicStats(homeData).slice(0, 2).map((stat, index) => (
                <StatCard
                  key={index}
                  count={stat.count}
                  label={stat.label}
                  labelColor={stat.labelColor}
                  icon={stat.icon}
                  onPress={() => {
                    if (stat.label === strings.client.home.progress) {
                      setJobsActiveSegment('Active');
                      setClientTabIndex(2);
                    } else if (stat.label === strings.client.home.scheduled) {
                      setJobsActiveSegment('Upcoming');
                      setClientTabIndex(2);
                    }
                  }}
                />
              ))}
            </View>
            <View style={styles.statsRow}>
              {getDynamicStats(homeData).slice(2, 4).map((stat, index) => (
                <StatCard
                  key={index}
                  count={stat.count}
                  label={stat.label}
                  labelColor={stat.labelColor}
                  icon={stat.icon}
                  onPress={() => {
                    if (stat.label === strings.client.home.jobInvites) {
                      navigation.navigate('JobInvites');
                    } else if (stat.label === strings.client.home.pending) {
                      navigation.navigate('JobAwaitingApproval');
                    }
                  }}
                />
              ))}
            </View>
          </View>

          {/* ─── Quick Actions ──────────────────────────────── */}
          <View style={styles.quickActionsSection}>
            <LinearGradient
              colors={Colors.quickActionGradient}
              locations={[0.2, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.quickActionsSectionGradient}
            >
              <View style={[styles.quickaction]}>
                <View style={styles.quickActionText}>
                  <SectionHeader title={strings.client.home.quickActions} />
                </View>
                <View style={styles.quickActionsRow}>
                  {QUICK_ACTIONS.map((action, index) => (
                    <QuickActionButton
                      key={index}
                      label={action.label}
                      icon={action.icon}
                      onPress={() => handleQuickAction(action.label)}
                    />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ─── Recent Job Payments ────────────────────────── */}
          <View style={styles.recentPaymentsSection}>
            <SectionHeader
              title={strings.client.home.recentPayments}
              actionText={homeData?.recentPayments?.length > 0 ? strings.client.home.seeAll : undefined}
              onActionPress={handleSeeAllPayments}
              containerStyle={styles.recentPaymentsHeader}
            />
            {homeData?.recentPayments?.length > 0 ? (
              <FlatList
                data={homeData.recentPayments}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => {


                  const initials = item.contractorName
                    ? item.contractorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : item.personName?.[0] || 'NA';

                  const paymentAmount = Number(item.netAmount || item.amount || 0);

                  return (
                    <View style={styles.paymentItemWrapper}>
                      <PaymentItem
                        jobTitle={item.jobTitle}
                        personName={item.contractorName || item.personName}
                        timeAgo={getTimeAgo(item.processedAt)}
                        amount={`${formatCurrency(paymentAmount)}`}
                        status={item.status}
                        avatarInitials={initials}
                        avatarColor={Colors.lightPurple}
                        profileImage={item.contractorProfileImage}
                        onPress={() => navigation.navigate('PaymentInvoiceDetails', { transactionId: item.transactionId })}
                        transactionType={item.transactionType}
                        type={item.type}
                      />
                    </View>
                  );
                }}
              />
            ) : (
              <EmptyState
                imageSource={require('@assets/images/common/noData.png')}
                title={strings.client.home.noRecentPaymentsTitle}
                description={strings.client.home.noRecentPaymentsDesc}
              />
            )}
          </View>
          {/* Bottom spacing for tab bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

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
