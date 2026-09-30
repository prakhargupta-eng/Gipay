import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from '@components/LinearGradient';

import TopHeader from '@components/TopHeader';
import JobService from '@config/jobService';
import ContractorService from '@config/contractorService';
import SkeletonFrame from '@components/SkeletonFrame';
import JobSummaryCard from '../components/JobSummaryCard';
import { getLocalDateTime } from '@utils/dateUtils';
import colors from '@styles/colors';
import strings from '@constants/strings';
import styles from './styles';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

const formatHoursAndMinutes = (decimalHours: number | string) => {
  const dec = Number(decimalHours);
  if (isNaN(dec) || dec <= 0) return '0h';
  const totalMinutes = Math.round(dec * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};

const PaymentDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { job, jobId, contractorId, commingFromContractore } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      // If this screen is accessed from the contractor side, we bypass the client-side API call.
      // Contractor-specific API logic or data handling will go here (currently mocked).
      if (commingFromContractore) {
        devDebugger.log('Contractor side payment API call');
        const response: any = await ContractorService.getPaymentDetails(jobId);
        const payload = response.data || response.results;
        if (response.success && payload) {
          const mappedRecords = (payload.attendanceLogs || []).map((log: any) => ({
            ...log,
            totalHours: log.hours || log.totalHours || 0
          }));
          setPaymentData({
            ...payload,
            records: mappedRecords,
            contractorHourlyRate: payload.hourlyRate,
            totalWorkHours: payload.totalHoursWorked || 0,
            totalAmount: payload.totalAmount || 0,
            jobTitle: payload.jobTitle,
            startDate: payload.startDate,
            endDate: payload.endDate,
            startTime: payload.startTime,
            endTime: payload.endTime,
          });
        }
        setIsLoading(false);
        return;
      }
      const response: any = await JobService.getPaymentDetails(jobId, contractorId);
      const payload = response.data || response.results;
      if (response.success && payload) {
        setPaymentData({
          ...payload,
          records: payload.attendanceLogs || payload.records || [],
          totalWorkHours: payload.totalHoursWorked || payload.totalWorkHours || 0,
          totalAmount: payload.totalAmount || 0,
          contractorHourlyRate: payload.hourlyRate || payload.contractorHourlyRate,
        });
      }
    } catch (error) {
      devDebugger.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!paymentData) return { totalDays: 0, totalWorkHours: 0, totalEarned: 0 };
    const records = paymentData.records || [];
    const totalDays = records.length;
    const totalWorkHours = paymentData.totalWorkHours || records.reduce((acc: any, curr: any) => acc + (Number(curr.hours || curr.totalWorkHours || curr.totalHours) || 0), 0);
    const totalEarned = paymentData.totalAmount !== undefined ? paymentData.totalAmount : records.reduce((acc: any, curr: any) => acc + (Number(curr.amount) || 0), 0);
    return { totalDays, totalWorkHours, totalEarned };
  }, [paymentData]);

  const getDayAndMonth = (dateString: string) => {
    if (!dateString) return { day: '--', month: '---' };
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return { day, month };
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { bg: colors.badgeGreen, text: colors.badgeGreenText, label: strings.client.paymentDetails.paid };
      case 'pending':
        return { bg: colors.badgeAmber, text: colors.badgeAmberText, label: strings.client.paymentDetails.pending };
      case 'unpaid':
        return { bg: colors.badgeRed, text: colors.badgeRedText, label: strings.client.paymentDetails.unpaid };
      default:
        return { bg: colors.lightGray, text: colors.gray, label: status || strings.client.paymentDetails.pending };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const PaymentSkeleton = () => (
    <View>
      {[1, 2, 3, 4, 5].map((item) => (
        <View
          key={`skeleton-${item}`}
          style={[
            styles.tableRow,
            item === 5 && { borderBottomWidth: 0 },
          ]}
        >
          {/* Date cell — flex 0.6 */}
          <View style={{ flex: 0.6, alignItems: 'center' }}>
            <SkeletonFrame width={45} height={52} borderRadius={10} />
          </View>

          {/* Hours — flex 1 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <SkeletonFrame width="65%" height={14} borderRadius={4} />
          </View>

          {/* Amount — flex 1 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <SkeletonFrame width="65%" height={14} borderRadius={4} />
          </View>

          {/* Status badge — flex 1.2 */}
          <View style={{ flex: 1.2, alignItems: 'center' }}>
            <SkeletonFrame width={75} height={28} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderPaymentItem = ({ item: row, index }: { item: any; index: number }) => {
    const records = paymentData?.records || [];
    const { day, month } = getDayAndMonth(row.date);
    const status = getStatusStyle(row.status);
    return (
      <View style={[styles.tableRow, index === records.length - 1 && { borderBottomWidth: 0 }]}>
        <View style={[styles.dateCell, { flex: 0.6 }]}>
          <AppText style={styles.dateDay}>{day}</AppText>
          <AppText style={styles.dateMonth}>{month}</AppText>
        </View>

        <AppText style={[styles.rowCell, { flex: 1 }]}>{formatHoursAndMinutes(row.totalHours || row.hours || row.totalWorkHours)}</AppText>
        <AppText style={[styles.rowCell, { flex: 1 }]}>{formatCurrency(row.amount || 0)}</AppText>

        <View style={[styles.statItem, { flex: 1.2 }]}>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <AppText style={[styles.badgeText, { color: status.text }]}>{status.label}</AppText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <TopHeader
        title={strings.client.paymentDetails.screenTitle}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Job Summary Card (Gradient) */}
        <JobSummaryCard
          title={paymentData?.jobTitle || job?.title || strings.mock.securityGuard}
          rate={strings.mock.jobRate(paymentData?.contractorHourlyRate || job?.hourlyRate || job?.rate || '40')}
          dateText={(paymentData?.startDate || job?.startDate) ? `${getLocalDateTime(paymentData?.startDate || job?.startDate).date} - ${getLocalDateTime(paymentData?.endDate || job?.endDate).date}` : undefined}
          timeText={(paymentData?.startDate || job?.startDate) ? `${getLocalDateTime(paymentData?.startDate || job?.startDate).time} - ${getLocalDateTime(paymentData?.endDate || job?.endDate).time} (${paymentData?.totalHours || job?.totalHours || 0} hrs)` : `${paymentData?.totalHours} hrs`}
        />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F0EDFF' }]}>
              <Image source={require('@assets/images/common/clanderBlue.png')} style={styles.statIcon} resizeMode="contain" />
            </View>
            <AppText style={styles.statValue}>{stats.totalDays}</AppText>
            <AppText style={styles.statLabel}>{strings.client.attendanceDetails.totalDays}</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Image source={require('@assets/images/common/hours.png')} style={styles.statIcon} resizeMode="contain" />
            </View>
            <AppText style={styles.statValue}>{formatHoursAndMinutes(stats.totalWorkHours)}</AppText>
            <AppText style={styles.statLabel}>{strings.client.attendanceDetails.totalHours}</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E1F9E2' }]}>
              <Image source={require('@assets/images/common/earned.png')} style={styles.statIcon} resizeMode="contain" />
            </View>
            <AppText style={styles.statValue}>{formatCurrency(stats.totalEarned || 0)}</AppText>
            <AppText style={styles.statLabel}>{strings.client.jobs.totalEarned}</AppText>
          </View>
        </View>

        {/* Payment Table — FlatList inside tableContainer preserves the border */}
        <View style={[styles.tableContainer, { flex: 1 }]}>
          <View style={styles.tableHeader}>
            <AppText style={[styles.headerCell, { flex: 0.6 }]}>{strings.client.paymentDetails.date}</AppText>
            <AppText style={[styles.headerCell, { flex: 1 }]}>{strings.client.paymentDetails.hours}</AppText>
            <AppText style={[styles.headerCell, { flex: 1 }]}>{strings.client.paymentDetails.amount}</AppText>
            <AppText style={[styles.headerCell, { flex: 1.2 }]}>{strings.client.paymentDetails.status}</AppText>
          </View>

          {isLoading ? (
            <PaymentSkeleton />
          ) : (paymentData?.records || []).length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <AppText style={styles.emptyStateText}>{strings.client.paymentDetails.noRecords}</AppText>
            </View>
          ) : (
            <FlatList
              data={paymentData?.records || []}
              keyExtractor={(item, index) => item._id?.toString() || `${item.date}-${index}`}
              renderItem={renderPaymentItem}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default PaymentDetailsScreen;
