import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(30)
  },
  toggleWrapper: {
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  toggleSlider: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.primary,
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
  },
  toggleActiveText: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
  },
  listContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(100),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: horizontalScale(5),
    flex: 1,
  },
  avatar: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: horizontalScale(22),
    marginRight: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  headerTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  nameText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
  },
  hourlyRateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(13),
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  statusBadge: {
    backgroundColor: colors.pendingBg,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(6),
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(12),
    color: colors.pending,
  },
  jobTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
  },
  jobRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: verticalScale(10),
    rowGap: verticalScale(4),
  },
  iconSmall: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.gray,
    resizeMode: 'contain',
    marginRight: horizontalScale(6),
  },
  jobRateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(13),
    color: colors.gray,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(10),
    gap: horizontalScale(12),
    flexWrap: 'wrap',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    color: colors.gray,
  },
  dashedDivider: {
    borderStyle: 'dashed',
    borderTopWidth: 1,
    borderColor: colors.border,
    marginVertical: verticalScale(16),
    marginHorizontal: -10
  },
  Divider: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderColor: colors.border,
    marginVertical: verticalScale(16),
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: verticalScale(8),
  },
  actionIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    resizeMode: 'contain',
    marginRight: horizontalScale(8),
  },
  actionIconRight: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    resizeMode: 'contain',
    marginLeft: horizontalScale(8),
    marginRight: horizontalScale(8)
  },
  actionText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(15),
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    borderStyle: 'dashed',
    borderLeftWidth: 1,
    borderColor: colors.border,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(80),
  },
  emptyImage: {
    width: horizontalScale(150),
    height: horizontalScale(150),
    marginBottom: verticalScale(24),
    opacity: 0.8,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(20),
    color: colors.textDark,
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(15),
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: horizontalScale(40),
    lineHeight: verticalScale(22),
  }
});

export default styles;
