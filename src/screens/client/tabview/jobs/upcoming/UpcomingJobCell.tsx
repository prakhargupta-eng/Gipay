import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import strings from '@constants/strings';
import colors from '@styles/colors';
import { formatDisplayDate } from '@utils/validation';
import { JobStatus } from '@constants/enums';
import styles from './styles';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';

interface JobItem {
  id?: string;
  _id?: string;
  title?: string;
  jobTitle?: string;
  startDate: string;
  endDate: string;
  hours?: number;
  totalJobHours?: number;
  filledPositions?: number;
  positionsFilled?: number;
  totalPositions?: number;
  contractorsRequired?: number;
  status: string;
}

interface UpcomingJobCellProps {
  item: JobItem;
  onDelete?: (id: string) => void;
  onEdit?: (item: JobItem) => void;
}

const UpcomingJobCell: React.FC<UpcomingJobCellProps> = ({ item, onDelete, onEdit }) => {
  const navigation = useNavigation<any>();

  const title = item.jobTitle || item.title || 'N/A';
  const hours = item.totalJobHours || item.hours || 0;
  const filled = item.positionsFilled !== undefined ? item.positionsFilled : (item.filledPositions || 0);
  const total = item.contractorsRequired !== undefined ? item.contractorsRequired : (item.totalPositions || 0);
  const id = item._id || item.id || '';

  const displayStartDate = getLocalDateTime(item.startDate).date;
  const displayEndDate = getLocalDateTime(item.endDate).date;

  const isCancellationDisabled = () => {
    try {
      if (!item.startDate || item.startDate === 'N/A') return false;

      const jobDate = new Date(item.startDate);

      const now = new Date();
      const diffMs = jobDate.getTime() - now.getTime();
      const diffMins = diffMs / (1000 * 60);

      // Disable if less than 30 minutes remaining to start time
      return diffMins < 30;
    } catch (e) {
      return false;
    }
  };

  const isDisabled = isCancellationDisabled();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardInner}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('JobDetails', { job: item, jobStatus: JobStatus.UPCOMING })}
      >
        <View style={styles.cardHeader}>
          <AppText style={styles.jobTitle} numberOfLines={1}>{title}</AppText>
          <View style={[styles.statusBadge, getStatusStyles(item.status).badge]}>
            <AppText style={[styles.statusText, getStatusStyles(item.status).text]}>
              {getStatusStyles(item.status).label}
            </AppText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Image source={require('@assets/images/common/calanderGray.png')} style={styles.detailIcon} />
          <AppText style={styles.detailText}>{`${displayStartDate} - ${displayEndDate}`}</AppText>
        </View>

        <View style={styles.detailRow}>
          <Image source={require('@assets/images/common/clockGray.png')} style={styles.detailIcon} />
          <AppText style={styles.detailText}>
            {`${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time} ${strings.client.jobs.durationHours(hours)}`}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Image source={require('@assets/images/common/userGray.png')} style={styles.detailIcon} />
          <AppText style={styles.detailText}>
            {strings.client.jobs.positionFilled(filled, total)}
          </AppText>
        </View>
      </TouchableOpacity>

      {!(item.status?.toLowerCase().includes('cancelled')) && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, isDisabled && { opacity: 0.5 }]} 
            activeOpacity={0.7}
            onPress={() => !isDisabled && onDelete?.(id)}
            disabled={isDisabled}
          >
            <AppText style={[styles.actionText, { color: colors.red }]}>{strings.common.cancel}</AppText>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={[styles.actionBtn, isDisabled && { opacity: 0.5 }]} 
            activeOpacity={0.7}
            onPress={() => !isDisabled && onEdit?.(item)}
            disabled={isDisabled}
          >
            <AppText style={[styles.actionText, { color: colors.primary }]}>{strings.common.edit}</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default UpcomingJobCell;
