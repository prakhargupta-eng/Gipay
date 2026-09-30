import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(100),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  invoiceLabel: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(18),
    color: colors.textDark,
  },
  invoiceValue: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
    marginTop: verticalScale(4),
  },
  jobRefLabel: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(6),
    marginTop: verticalScale(8),
    alignSelf: 'flex-end',
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(12),
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(18),
    color: colors.textDark,
    marginBottom: verticalScale(12),
  },
  paidToCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  avatar: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: horizontalScale(22),
    marginRight: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  paidToName: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
  },
  paidToRate: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: verticalScale(20),
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(24),
  },
  jobDetailsCard: {
    marginBottom: verticalScale(24),
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  jobTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
  },
  jobRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  iconSmall: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    tintColor: colors.textSecondary,
    marginRight: horizontalScale(6),
    resizeMode: 'contain',
  },
  jobRateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(13),
    color: colors.gray,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    color: colors.gray,
  },
  costBreakdownCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: horizontalScale(16),
    padding: horizontalScale(16),
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  costLabel: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(14),
    color: colors.gray,
    flex: 1,
    marginRight: horizontalScale(10),
  },
  costValue: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(16),
    color: colors.textDark,
    flexShrink: 0,
  },
  dashedDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: verticalScale(16),
  },
  netPayableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netPayableLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: fontSize(16),
    color: colors.textDark,
    flex: 1,
    marginRight: horizontalScale(10),
  },
  netPayableValue: {
    fontFamily: Fonts.semiBold,
    fontSize: fontSize(16),
    color: colors.primary,
    flexShrink: 0,
  },
  transactionTypeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
  },
  transactionTypeLabel: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(13),
    color: colors.gray,
  },
  transactionTypeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTypeValue: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(13),
    color: colors.primary,
  },
  arrowIcon: {
    marginRight: horizontalScale(4),
  },
  skeletonRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  skeletonMarginLeft: {
    marginLeft: horizontalScale(12),
  },
  invoiceHeaderLeft: {
    flex: 1,
    paddingRight: horizontalScale(10),
    alignItems: 'flex-start' as const,
  },
  invoiceHeaderRight: {
    flex: 1,
    paddingLeft: horizontalScale(10),
    alignItems: 'flex-end' as const,
  },
  paidToNameWidth: {
    width: '85%' as any,
  },
  netPayableValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
