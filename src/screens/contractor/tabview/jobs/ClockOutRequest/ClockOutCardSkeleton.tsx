import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

interface ClockOutCardSkeletonProps {
  showButton?: boolean;
}

export const ClockOutCardSkeletonItem: React.FC<ClockOutCardSkeletonProps> = ({ showButton = true }) => {
  return (
    <View style={styles.card}>
      {/* Header: Title and Status Badge */}
      <View style={styles.headerRow}>
        <SkeletonFrame width={horizontalScale(180)} height={verticalScale(20)} borderRadius={4} />
        <SkeletonFrame width={horizontalScale(64)} height={verticalScale(22)} borderRadius={8} />
      </View>

      {/* Company Name */}
      <SkeletonFrame width={horizontalScale(130)} height={verticalScale(14)} borderRadius={4} style={styles.spacingSmall} />

      {/* Rating & Distance */}
      <View style={styles.row}>
        <SkeletonFrame width={horizontalScale(90)} height={verticalScale(14)} borderRadius={4} />
      </View>

      {/* Date & Time */}
      <View style={styles.row}>
        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} borderRadius={4} style={{ marginRight: horizontalScale(12) }} />
        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} borderRadius={4} />
      </View>

      {/* Rate */}
      <View style={styles.row}>
        <SkeletonFrame width={horizontalScale(140)} height={verticalScale(14)} borderRadius={4} />
      </View>

      {/* Location */}
      <View style={styles.row}>
        <SkeletonFrame width={'90%'} height={verticalScale(14)} borderRadius={4} />
      </View>

      {/* Action Button */}
      {showButton && (
        <SkeletonFrame
          width={'100%'}
          height={verticalScale(44)}
          borderRadius={horizontalScale(12)}
          style={styles.buttonSpacing}
        />
      )}
    </View>
  );
};

const ClockOutCardSkeleton: React.FC<{ count?: number; showButton?: boolean }> = ({ count = 3, showButton = true }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <ClockOutCardSkeletonItem key={index} showButton={showButton} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(4),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  spacingSmall: {
    marginBottom: verticalScale(10),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  buttonSpacing: {
    marginTop: verticalScale(4),
  },
});

export default ClockOutCardSkeleton;
