import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(30)
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  toggleWrapper: {
    width: '100%',
    height: verticalScale(48),
    backgroundColor: '#F3F3F3',
    borderRadius: verticalScale(24),
    flexDirection: 'row',
    padding: verticalScale(4),
  },
  toggleSlider: {
    backgroundColor: colors.primary,
    borderRadius: verticalScale(20),
    height: verticalScale(48),
  },
  toggleText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  toggleActiveText: {
    color: colors.white,
  },
  addMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: verticalScale(12),
    marginBottom: verticalScale(24),
  },
  addMethodText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  plusIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.gray,
  },
  sectionLabel: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(16),
  },
  savedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: verticalScale(16),
    backgroundColor: colors.white,
    marginBottom: verticalScale(12),
  },
  itemMainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  itemSub: {
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  moreIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    tintColor: colors.gray,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: verticalScale(100),
  },
  illustration: {
    width: horizontalScale(200),
    height: horizontalScale(160),
    resizeMode: 'contain',
    marginBottom: verticalScale(30),
    right: horizontalScale(20),
  },
  emptyTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(12),
  },
  emptyDescription: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  iconContainer: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: verticalScale(8),
    backgroundColor: colors.bcaBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemIcon: {
    width: horizontalScale(40),
    height: horizontalScale(30),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
});

export default styles;
