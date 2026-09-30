import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import TopHeader from '@components/TopHeader';
import JobService from '@config/jobService';
import ContractorService from '@config/contractorService';
import SkeletonFrame from '@components/SkeletonFrame';
import colors from '@styles/colors';
import JobSummaryCard from '../components/JobSummaryCard';
import { getLocalDateTime } from '@utils/dateUtils';
import strings from '@constants/strings';
import styles from './styles';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

const AttendanceDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { job, jobId, contractorId, commingFromContractore } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [jobData, setJobData] = useState<any>(job || {});
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    late: 0,
    absent: 0
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      // If this screen is accessed from the contractor side, we bypass the client-side API call.
      // Contractor-specific API logic or data handling will go here (currently mocked).
      if (commingFromContractore) {
        devDebugger.log('Contractor side attendance API call');
        const response = await ContractorService.getAttendanceDetails(jobId);
        const payload = response.data;
        if (response.success && payload) {
          const records = payload.logs || [];
          setAttendanceData(records);

          setJobData((prev: any) => ({
            ...prev,
            title: payload.jobTitle || prev?.title,
            rate: payload.hourlyRate ? `${formatCurrency(payload.hourlyRate)}/h` : prev?.rate,
            startDate: payload.startDate || prev?.startDate,
            endDate: payload.endDate || prev?.endDate,
            startTime: payload.startTime || prev?.startTime,
            endTime: payload.endTime || prev?.endTime,
            totalHours: payload.totalHours || prev?.totalHours,
          }));

          // Calculate stats
          const summary = payload.summary || {};
          setStats({
            totalDays: summary.totalDays ?? records.length,
            present: summary.present ?? (records.filter((r: any) => r.attendance === 'onTime').length + records.filter((r: any) => r.attendance === 'late').length),
            late: summary.late ?? records.filter((r: any) => r.attendance === 'late').length,
            absent: summary.absent ?? records.filter((r: any) => r.attendance === 'noShow' || r.attendance === 'absent').length
          });
        }
        setIsLoading(false);
        return;
      }
      const response = await JobService.getAttendanceDetails(jobId, contractorId);
      const payload = response.data;
      if (response.success && payload) {
        const records = payload.logs || payload.records || [];
        setAttendanceData(records);

        setJobData((prev: any) => ({
          ...prev,
          title: payload.jobTitle || prev?.title,
          rate: payload.contractorHourlyRate ? `${formatCurrency(payload.contractorHourlyRate)}/h` : prev?.rate,
          startDate: payload.startDate || prev?.startDate,
          endDate: payload.endDate || prev?.endDate,
          startTime: payload.startTime || prev?.startTime,
          endTime: payload.endTime || prev?.endTime,
          totalHours: payload.totalHours || prev?.hours,
        }));

        const summary = payload.summary || {};
        setStats({
          totalDays: summary.totalDays ?? records.length,
          present: summary.present ?? records.filter((r: any) => r.attendance === 'onTime').length,
          late: summary.late ?? records.filter((r: any) => r.attendance === 'late').length,
          absent: summary.absent ?? records.filter((r: any) => r.attendance === 'noShow' || r.attendance === 'absent').length
        });
      }
    } catch (error) {
      devDebugger.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayAndMonth = (dateStr: string) => {
    if (!dateStr) return { day: '--', month: '--' };
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { day: '--', month: '--' };
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      return { day, month };
    } catch (e) {
      return { day: '--', month: '--' };
    }
  };



  const AttendanceSkeleton = () => (
    <View>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <View
          key={index}
          style={[
            styles.tableRow,
            index === 4 && { borderBottomWidth: 0 },
          ]}
        >
          {/* Date cell — flex 0.6 */}
          <View style={{ flex: 0.6, alignItems: 'center' }}>
            <SkeletonFrame width={45} height={52} borderRadius={10} />
          </View>

          {/* Status badge — flex 1.2 */}
          <View style={{ flex: 1.2, alignItems: 'center' }}>
            <SkeletonFrame width={75} height={28} borderRadius={8} />
          </View>

          {/* Clock In — flex 1 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <SkeletonFrame width="70%" height={14} borderRadius={4} />
          </View>

          {/* Clock Out — flex 1 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <SkeletonFrame width="70%" height={14} borderRadius={4} />
          </View>

          {/* Hours badge — flex 0.8 */}
          <View style={{ flex: 0.8, alignItems: 'center' }}>
            <SkeletonFrame width={50} height={28} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ontime':
      case 'on time':
        return { bg: colors.badgePurple, text: colors.badgePurpleText, label: strings.client.attendanceDetails.onTime };
      case 'noshow':
      case 'no show':
      case 'absent':
        return { bg: colors.badgeRed, text: colors.badgeRedText, label: strings.client.attendanceDetails.noShow };
      case 'late':
        return { bg: colors.badgeOrange, text: colors.badgeOrangeText, label: strings.client.attendanceDetails.late };
      default:
        return { bg: colors.lightGray, text: colors.gray, label: status };
    }
  };

  const renderAttendanceItem = ({ item, index }: { item: any; index: number }) => {
    const { day, month } = getDayAndMonth(item.date);
    const status = getStatusStyle(item.attendance || item.status);
    return (
      <View style={[styles.tableRow, index === attendanceData.length - 1 && { borderBottomWidth: 0 }]}>
        <View style={[styles.dateCell, { flex: 0.6 }]}>
          <AppText style={styles.dateDay}>{day}</AppText>
          <AppText style={styles.dateMonth}>{month}</AppText>
        </View>

        <View style={[styles.statItem, { flex: 1.2 }]}>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <AppText style={[styles.badgeText, { color: status.text }]}>{status.label}</AppText>
          </View>
        </View>

        <AppText style={[styles.rowCell, { flex: 1 }]}>
          {item.clockInTime ? getLocalDateTime(item.clockInTime).time : strings.common.na}
        </AppText>
        <AppText style={[styles.rowCell, { flex: 1 }]}>
          {item.clockOutTime ? getLocalDateTime(item.clockOutTime).time : strings.common.na}
        </AppText>

        <View style={[styles.statItem, { flex: 0.8 }]}>
          <View style={styles.hoursBadge}>
            <AppText style={styles.hoursText}>
              {item.totalHoursWorked !== undefined && item.totalHoursWorked !== null
                ? strings.client.attendanceDetails.hoursCount(
                  Math.floor(item.totalHoursWorked),
                  Math.round((item.totalHoursWorked - Math.floor(item.totalHoursWorked)) * 60),
                )
                : strings.client.attendanceDetails.hoursCount(0, 0)}
            </AppText>
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <TopHeader
        title={strings.client.attendanceDetails.viewAttendance}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Job Summary Card */}
        <JobSummaryCard
          title={jobData?.title}
          rate={jobData?.rate}
          dateText={
            jobData?.startDate
              ? `${getLocalDateTime(jobData.startDate).date} - ${getLocalDateTime(jobData.endDate).date}`
              : undefined
          }
          timeText={
            jobData?.startDate
              ? `${getLocalDateTime(jobData.startDate).time} - ${getLocalDateTime(jobData.endDate).time} (${jobData?.totalHours || 0} hrs)`
              : undefined
          }
        />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Image source={require('@assets/images/common/clanderBlue.png')} style={styles.statIcon} />
            </View>
            <AppText style={styles.statValue}>{stats.totalDays}</AppText>
            <AppText style={styles.statLabel}>{strings.client.attendanceDetails.totalDays}</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Image source={require('@assets/images/common/present.png')} style={styles.statIcon} />
            </View>
            <AppText style={styles.statValue}>{stats.present}</AppText>
            <AppText style={styles.statLabel}>{strings.client.attendanceDetails.present}</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Image source={require('@assets/images/common/hours.png')} style={styles.statIcon} />
            </View>
            <AppText style={styles.statValue}>{stats.late}</AppText>
            <AppText style={styles.statLabel}>{strings.client.attendanceDetails.late}</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Image source={require('@assets/images/common/absent.png')} style={styles.statIcon} />
            </View>
            <AppText style={styles.statValue}>{stats.absent}</AppText>
            <AppText style={styles.statLabel}>{strings.client.attendanceDetails.absent}</AppText>
          </View>
        </View>

        {/* Attendance Table — FlatList inside tableContainer preserves the border */}
        <View style={[styles.tableContainer, { flex: 1 }]}>
          <View style={styles.tableHeader}>
            <AppText style={[styles.headerCell, { flex: 0.6 }]}>{strings.client.attendanceDetails.date}</AppText>
            <AppText style={[styles.headerCell, { flex: 1.2 }]}>{strings.client.attendanceDetails.attendance}</AppText>
            <AppText style={[styles.headerCell, { flex: 1 }]}>{strings.client.attendanceDetails.clockIn}</AppText>
            <AppText style={[styles.headerCell, { flex: 1 }]}>{strings.client.attendanceDetails.clockOut}</AppText>
            <AppText style={[styles.headerCell, { flex: 0.8 }]}>{strings.client.attendanceDetails.hours}</AppText>
          </View>

          {isLoading ? (
            <AttendanceSkeleton />
          ) : attendanceData.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <AppText style={styles.emptyStateText}>{strings.client.attendanceDetails.noRecords}</AppText>
            </View>
          ) : (
            <FlatList
              data={attendanceData}
              keyExtractor={(item, index) => item._id?.toString() || item.id?.toString() || index.toString()}
              renderItem={renderAttendanceItem}
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

export default AttendanceDetailsScreen;
