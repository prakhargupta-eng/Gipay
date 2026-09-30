import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStatusStyles } from '@utils/statusUtils';

import { getLocalDateTime } from '@utils/dateUtils';
import strings from '@constants/strings';
import styles from './styles';
import AppText from '@components/AppText';

interface JobItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  hours: number;
  filledPositions: number;
  totalPositions: number;
  status: string;
}

interface JobCardProps {
  item: JobItem;
  jobStatus?: string;
}

const JobCard: React.FC<JobCardProps> = ({ item, jobStatus }) => {
  const navigation = useNavigation<any>();

  const displayStartDate = getLocalDateTime(item.startDate).date;
  const displayEndDate = getLocalDateTime(item.endDate).date;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('JobDetails', { job: item, jobStatus })}
    >
      <View style={styles.cardHeader}>
        <AppText style={styles.jobTitle} numberOfLines={2}>{item.title}</AppText>
        <View style={[
          styles.statusBadge,
          getStatusStyles(item.status).badge
        ]}>
          <AppText style={[
            styles.statusText,
            getStatusStyles(item.status).text
          ]}>
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
          {`${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time} ${strings.client.jobs.durationHours(item.hours)}`}
        </AppText>
      </View>

      <View style={styles.detailRow}>
        <Image source={require('@assets/images/common/userGray.png')} style={styles.detailIcon} />
        <AppText style={styles.detailText}>
          {strings.client.jobs.positionFilled(item.filledPositions, item.totalPositions)}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

export default JobCard;
