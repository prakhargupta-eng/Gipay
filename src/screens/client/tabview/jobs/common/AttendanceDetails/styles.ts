import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(20)

  },
  jobSummaryCard: {
    borderRadius: horizontalScale(24),
    backgroundColor: '#1A0B8F', // Dark blue background
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
     marginTop: verticalScale(20),
    padding: horizontalScale(20),
    marginBottom: verticalScale(12),
  },
  jobTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  jobRate: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.white,
  },
  jobDetailsRow: {
    gap: verticalScale(8),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
     paddingHorizontal: horizontalScale(20),
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
  detailItemBottom:{
     flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
     paddingHorizontal: horizontalScale(20),
     paddingBottom: verticalScale(20),
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
    padding: horizontalScale(16),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(24),
    borderWidth: 1,
    borderColor: colors.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.lightBorder,
    alignSelf: 'center',
  },
  statIconContainer: {
    width: horizontalScale(32),
    height: horizontalScale(32),
    borderRadius: horizontalScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  statIcon: {
    width: horizontalScale(40),
    height: horizontalScale(40),
  },
  statValue: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  statLabel: {
    fontSize: fontSize(11),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(2),
  },

  // Table Styles
  tableContainer: {
    marginTop: verticalScale(24),
    borderRadius: horizontalScale(24),
    borderWidth: 1,
    borderColor: colors.lightBorder,
    backgroundColor: colors.white,
    overflow: 'hidden',
    marginBottom: verticalScale(30),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F5FF', // Very light purple
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
  },
  headerCell: {
    flex: 1,
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: '#6353D3',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
  },
  dateCell: {
    width: horizontalScale(45),
    height: horizontalScale(52),
    backgroundColor: '#F0EDFF', // Light lavender
    borderRadius: horizontalScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: fontSize(15),
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  dateMonth: {
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  rowCell: {
    flex: 1,
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(8),
    minWidth: horizontalScale(75),
    alignItems: 'center',
  },
  badgeText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
  },
  hoursBadge: {
    backgroundColor: '#F0EDFF',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(8),
    minWidth: horizontalScale(50),
    alignItems: 'center',
  },
  hoursText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: '#4F46E5',
  },
  emptyStateContainer: {
    padding: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: colors.gray,
    fontFamily: fonts.medium,
    fontSize: fontSize(14),
  },
});

export default styles;

