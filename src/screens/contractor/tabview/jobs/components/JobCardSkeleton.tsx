import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const JobCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <SkeletonFrame width={horizontalScale(200)} height={verticalScale(24)} borderRadius={4} />
        <SkeletonFrame width={horizontalScale(60)} height={verticalScale(24)} borderRadius={6} />
      </View>

      <SkeletonFrame width={horizontalScale(150)} height={verticalScale(18)} borderRadius={4} style={styles.companyText} />

      {/* Rating & Distance */}
      <View style={styles.ratingRow}>
        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} borderRadius={4} />
      </View>

      {/* Date & Time */}
      <View style={styles.infoRow}>
        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} borderRadius={4} style={{ marginRight: horizontalScale(10) }} />
        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} borderRadius={4} />
      </View>

      {/* Job Rates */}
      <View style={styles.infoRow}>
        <SkeletonFrame width={horizontalScale(180)} height={verticalScale(16)} borderRadius={4} />
      </View>

      {/* Location */}
      <View style={styles.infoRow}>
        <SkeletonFrame width={'100%'} height={verticalScale(16)} borderRadius={4} />
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <SkeletonFrame width={horizontalScale(90)} height={verticalScale(30)} borderRadius={6} style={{ marginRight: horizontalScale(10) }} />
        <SkeletonFrame width={horizontalScale(110)} height={verticalScale(30)} borderRadius={6} style={{ marginRight: horizontalScale(10) }} />
        <SkeletonFrame width={horizontalScale(90)} height={verticalScale(30)} borderRadius={6} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    marginHorizontal: horizontalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  companyText: {
    marginBottom: verticalScale(12),
  },
  ratingRow: {
    marginBottom: verticalScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
  },
});

export default JobCardSkeleton;
