import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: verticalScale(20),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: colors.statBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
    alignItems: 'center',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  checkboxImage: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    resizeMode: 'contain',
  },
  roleRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  ratingDivider: {
    width: 1,
    height: verticalScale(12),
    backgroundColor: colors.textSecondary,
    marginHorizontal: horizontalScale(8),
  },
  profileImg: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: horizontalScale(30),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardMainInfo: {
    flex: 1,
    marginLeft: horizontalScale(15),
    justifyContent: 'center',
  },
  contractorName: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.black,
    lineHeight: verticalScale(24),
  },
  contractorRole: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: verticalScale(20),
  },
  ratingText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginLeft: horizontalScale(4),
  },
  starIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.starYellow,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(16),
    paddingLeft: horizontalScale(4), // Subtle indent to match design
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  verticalDivider: {
    width: 1,
    height: verticalScale(14),
    backgroundColor: colors.textSecondary,
    marginHorizontal: horizontalScale(10),
  },
  detailIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    tintColor: colors.textSecondary,
    marginRight: horizontalScale(6),
  },
  detailText: {
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    flexShrink: 1,
  },
});

export default styles;
