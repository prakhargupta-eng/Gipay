import { StyleSheet, Dimensions } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: horizontalScale(24),
    borderTopRightRadius: horizontalScale(24),
    maxHeight: height * 0.9,
    paddingBottom: verticalScale(32),
  },
  handleBar: {
    width: horizontalScale(40),
    height: verticalScale(4),
    backgroundColor: '#E5E7EB',
    borderRadius: horizontalScale(2),
    alignSelf: 'center',
    marginTop: verticalScale(12),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  closeBtn: {
    padding: horizontalScale(4),
  },
  closeIcon: {
    width: horizontalScale(30),
    height: horizontalScale(30),
  },
  section: {
    marginBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(20),
  },
  sectionTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginBottom: verticalScale(12),
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(12),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: horizontalScale(15),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
    marginBottom: verticalScale(12),
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F3FF',
  },
  pillText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  pillTextSelected: {
    color: colors.primary,
  },
  statusDot: {
    width: horizontalScale(8),
    height: horizontalScale(8),
    borderRadius: horizontalScale(4),
    marginRight: horizontalScale(8),
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  radioBtn: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    borderRadius: horizontalScale(10),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  radioBtnSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: horizontalScale(10),
    height: horizontalScale(10),
    borderRadius: horizontalScale(5),
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#374151',
    flex: 1,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(4),
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: horizontalScale(8),
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(44),
  },
  dateText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
  },
  calendarIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: '#6B7280',
  },
  dash: {
    marginHorizontal: horizontalScale(12),
    fontSize: fontSize(16),
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(16),
  },
  resetBtn: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  resetBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  applyBtn: {
    flex: 2,
    height: verticalScale(48),
    borderRadius: horizontalScale(12),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  horizontalRadioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: verticalScale(0),
  },
  customRangeContainer: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
  }
});
