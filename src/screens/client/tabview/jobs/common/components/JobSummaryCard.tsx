import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import LinearGradient from '@components/LinearGradient';
import AppText from '@components/AppText';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

interface JobSummaryCardProps {
  title: string;
  rate?: string;
  dateText?: string;
  timeText?: string;
}

const JobSummaryCard: React.FC<JobSummaryCardProps> = ({
  title,
  rate,
  dateText,
  timeText,
}) => {
  return (
    <LinearGradient
      colors={colors.attendanceCardGradient || ['#1A0B8F', '#1A0B8F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.jobSummaryCard}
    >
      <View style={{padding: horizontalScale(16)}}>
      <View style={styles.jobTitleRow}>
        <AppText style={styles.jobTitle} numberOfLines={1}>{ title}</AppText>
        {rate ? (
          <View style={styles.detailItem}>
            <AppText style={styles.jobRate}>{rate}</AppText>
          </View>
        ) : null}
      </View>
      
      {(dateText || timeText) && (
        <View style={styles.jobDetailsRow}>
          {dateText ? (
            <View style={styles.detailItemRow}>
              <Image source={require('@assets/images/common/calanderGray.png')} style={styles.detailIcon} />
              <AppText style={styles.detailText}>{dateText}</AppText>
            </View>
          ) : null}
          {timeText ? (
            <View style={styles.detailItemRow}>
              <Image source={require('@assets/images/common/clockGray.png')} style={styles.detailIcon} />
              <AppText style={styles.detailText}>{timeText}</AppText>
            </View>
          ) : null}
        </View>
      )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  jobSummaryCard: {
    borderRadius: horizontalScale(24),
   
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  jobTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.white,
    flex: 1,
    marginRight:horizontalScale(16)
  },
  jobRate: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.white,
    opacity: 0.9,
  },
  jobDetailsRow: {
    gap: verticalScale(8),
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  detailItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.white,
    opacity: 0.8,
  },
  detailText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.8,
  },
});

export default JobSummaryCard;
