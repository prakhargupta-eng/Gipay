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
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(20),
  },
  dropdown: {
    height: verticalScale(52),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: horizontalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
  },
  dropdownText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  chevron: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    tintColor: colors.gray,
  },
  input: {
    height: verticalScale(52),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: horizontalScale(12),
    paddingHorizontal: horizontalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  calendarIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.gray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(30),
    gap: horizontalScale(12),
  },
  cancelBtn: {
    flex: 1,
    height: verticalScale(52),
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  confirmBtn: {
    flex: 1,
    height: verticalScale(52),
    borderRadius: horizontalScale(12),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});

export default styles;
