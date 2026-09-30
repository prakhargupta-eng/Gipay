import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
  appliedContractorCard: {
    borderWidth: 1,
    borderColor: colors.lightBorder,
    borderRadius: horizontalScale(20),
    padding: horizontalScale(16),
    backgroundColor: colors.white,
    marginTop: verticalScale(8),
    // Shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  contractorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contractorImg: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: horizontalScale(30),
    marginRight: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contractorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contractorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contractorName: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
    flex: 1,
    marginRight: horizontalScale(8),
  },
  contractorRate: {
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  contractorStatusBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: horizontalScale(6),
    backgroundColor: '#E6F7ED', // Default green (Open/Completed)
    flexShrink: 0,
  },
  statusCompleted: {
    backgroundColor: '#E6F7ED',
  },
  statusNotStarted: {
    backgroundColor: '#F3F4F6',
  },
  statusActive: {
    backgroundColor: '#E6F7ED',
  },
  contractorStatusText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: '#00C254',
  },
  textNotStarted: {
    color: '#9CA3AF',
  },
  textCompleted: {
    color: '#00C254',
  },
  textActive: {
    color: '#00C254',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: horizontalScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(12),
    marginTop: verticalScale(16),
  },
  hourItem: {
    flex: 1,
    alignItems: 'center',
  },
  hourLabel: {
    fontSize: fontSize(11),
    fontFamily: fonts.medium,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  hourValue: {
    fontSize: fontSize(15),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(2),
  },
  hourSeparator: {
    width: 1,
    height: verticalScale(24),
    backgroundColor: '#E5E7EB',
    marginHorizontal: horizontalScale(12),
  },
  contractorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(16),
    gap: horizontalScale(10),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(36),
    borderRadius: horizontalScale(8),
    backgroundColor: colors.lightWhite,
    borderColor: colors.lightGray,
    borderWidth: 1,
    gap: horizontalScale(6),
  },
  actionIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.primary,
  },
  actionBtnText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: verticalScale(16),
    marginHorizontal: -horizontalScale(16),
    marginBottom: -horizontalScale(16),
    height: verticalScale(48),
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: horizontalScale(8),
  },
  contactDivider: {
    width: 1,
    height: '100%',
    borderLeftWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  contactIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
  },
  contactText: {
    fontSize: fontSize(15),
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});

export default styles;
