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
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(120),
  },
  headerSection: {
    marginTop: verticalScale(20),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.black,
    flex: 1,
    marginRight:horizontalScale(10)
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: horizontalScale(6),
    backgroundColor: '#E6F7ED', // Light green for Open
    flexShrink: 0,
  },
  statusBadgeUpcoming: {
    backgroundColor: '#EAE5FF', // Light purple for Upcoming
  },
  statusText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: '#00C254', // Dark green text
  },
  statusTextUpcoming: {
    color: colors.primary,
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: verticalScale(4),
  },
  companyName: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  starIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    marginRight: horizontalScale(4),
  },
  ratingText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: '#9CA3AF',
  },
  detailsGrid: {
    marginTop: verticalScale(20),
    gap: verticalScale(12),
    marginRight: horizontalScale(20),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  detailIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    marginRight: horizontalScale(10),
    tintColor: '#9CA3AF',
  },
  detailText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(20),
  },
  section: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(12),
  },
  cardBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: horizontalScale(12),
    padding: horizontalScale(16),
    backgroundColor: colors.white,
  },
  descriptionText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
    lineHeight: verticalScale(22),
  },
  certificationText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
    marginBottom: verticalScale(8),
  },
  requiredContractorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  countBadge: {
    width: horizontalScale(48),
    height: verticalScale(40),
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(30),
    paddingTop: verticalScale(15),

  },
  disputeBtn: {
    width: '48%',
    height: verticalScale(54),
    borderRadius: horizontalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disputeBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  clockInBtn: {
    width: '48%',
    height: verticalScale(54),
    borderRadius: horizontalScale(12),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockInBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});

export default styles;
