import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts/index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
  },
  selectedMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(16),
    backgroundColor: '#F9FAFB',
    borderRadius: verticalScale(12),
    marginBottom: verticalScale(30),
  },
  methodIcon: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: verticalScale(8),
    marginRight: horizontalScale(12),
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  methodDetails: {
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  amountContainer: {
    padding: horizontalScale(20),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: verticalScale(16),
  },
  amountContainerError: {
    borderColor: colors.red,
  },
  amountLabel: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(16),
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInputRowError: {
    borderColor: colors.red,
  },
  amountInput: {
    fontSize: fontSize(40),
    fontFamily: fonts.medium,
    color: '#E5E7EB', // Placeholder color logic
    flex: 1,
  },
  activeAmountInput: {
    color: colors.black,
  },
  errorText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.red,
    marginTop: verticalScale(12),
    textAlign: 'right',
  },
  limitText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.gray,
    marginTop: verticalScale(12),
    textAlign: 'right',
  },
  footer: {
    padding: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  addButton: {
    height: verticalScale(56),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(30),
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: verticalScale(24),
    padding: horizontalScale(24),
    alignItems: 'center',
  },
  successAmount: {
    fontSize: fontSize(36),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(20),
  },
  successTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(12),
  },
  successSubtitle: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    textAlign: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
  },
  doneButton: {
    width: '100%',
    height: verticalScale(48),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
});

export default styles;
