import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(120),
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  nameText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
  },
  hourlyRateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
    marginTop: verticalScale(4),
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
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: verticalScale(16),
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  jobTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
    marginRight: horizontalScale(16),
    flex: 1,
    
  },
  viewNegotiateText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(14),
    color: colors.primary,
  },
  chevronIcon: {
    width: horizontalScale(15),
    height: horizontalScale(15),
    resizeMode: 'contain',
    tintColor: colors.primary,
    marginLeft: horizontalScale(4),
    transform: [{ rotate: '-90deg' }],
  },
  companyText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
    marginBottom: verticalScale(16),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  iconSmall: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    tintColor: colors.gray,
    resizeMode: 'contain',
    marginRight: horizontalScale(6),
  },
  iconText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(13),
    color: colors.gray,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(8),
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
    marginTop: verticalScale(24),
    marginBottom: verticalScale(12),
  },
  boxContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: horizontalScale(12),
    padding: horizontalScale(16),
  },
  boxText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
    lineHeight: verticalScale(22),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  bulletPoint: {
    fontSize: fontSize(14),
    color: colors.gray,
    marginRight: horizontalScale(8),
  },
  bulletText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
  },
  contractorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  contractorBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: horizontalScale(8),
    width: horizontalScale(44),
    height: horizontalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractorCount: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(14),
    color: colors.gray,
  },
  bottomActionWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingBottom: verticalScale(40),
  },
  counterOfferTextContainer: {
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    backgroundColor: colors.pendingBg,
    borderRadius: horizontalScale(8),
    borderWidth: 1,
    borderColor: colors.pending,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterOfferText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(13),
    color: colors.successGreen,
    textAlign: 'center',
  },
  bottomActionContainer: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(0), // Wrapper handles bottom padding
  },
  btnDecline: {
    flex: 1,
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(8),
  },
  btnDeclineText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(16),
    color: colors.red,
  },
  btnAccept: {
    flex: 1,
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: colors.successGreen,
    borderRadius: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(8),
  },
  btnAcceptText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(16),
    color: colors.successGreen,
  },
});

export default styles;
