import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImg: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: horizontalScale(50),
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingBadge: {
    position: 'absolute',
    top: 0,
    right: -horizontalScale(40),
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  name: {
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(16),
  },
  role: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(4),
  },
  bio: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    textAlign: 'center',
    marginTop: verticalScale(16),
    lineHeight: verticalScale(20),
    paddingHorizontal: horizontalScale(10),
  },
  emptyText: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(24),
  },
  statBox: {
    width: '48%',
    height: verticalScale(85),
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  statValue: {
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  statLabel: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(4),
  },
  section: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(16),
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: verticalScale(8),
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  dayTag: {
    width: '13%',
    height: horizontalScale(34),
    borderRadius: horizontalScale(17),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  dayTagActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(67, 24, 255, 0.05)',
  },
  dayTagText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  dayTagTextActive: {
    color: colors.primary,
  },
  skillTag: {
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(20),
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  skillTagText: {
    fontSize: fontSize(13),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: horizontalScale(16),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoIconBox: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: horizontalScale(12),
  },
  infoIcon: {
    width: horizontalScale(40),
    height: horizontalScale(40),
  },
  infoLabel: {
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  infoValue: {
    fontSize: fontSize(15),
    fontFamily: fonts.medium,
    color: colors.black,
    marginTop: verticalScale(2),
  },
  certRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
    alignItems: 'center',
  },
  bullet: {
    fontSize: fontSize(14),
    marginRight: horizontalScale(8),
    color: colors.gray,
  },
  certText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  licenseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: horizontalScale(12),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  pdfIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    marginRight: horizontalScale(12),
  },
  licenseText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(90),
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),

    paddingBottom: verticalScale(10),
  },
  viewCvBtn: {

    height: verticalScale(50),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewCvText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  inviteBtn: {
    width: '49%',
    height: verticalScale(50),
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});

export default styles;
