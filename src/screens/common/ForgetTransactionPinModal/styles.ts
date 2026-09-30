import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(32),
  },

  // Stepper Styles
  stepperContainer: {
    paddingHorizontal: horizontalScale(10),
    marginTop: verticalScale(14),
    marginBottom: verticalScale(25),
  },
  stepperCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCircle: {
    width: horizontalScale(28),
    height: horizontalScale(28),
    borderRadius: horizontalScale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  stepCircleInactive: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stepNumber: {
    fontSize: fontSize(13),
    fontFamily: fonts.bold,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepNumberInactive: {
    color: colors.textSecondary,
  },
  stepLineContainer: {
    flex: 1,
    height: 2,
    marginHorizontal: horizontalScale(6),
    justifyContent: 'center',
  },
  stepLineFullActive: {
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  stepLineHalfContainer: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
  },
  stepLineHalfActive: {
    flex: 1,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  stepLineHalfInactive: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  stepLineInactive: {
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(8),
  },
  stepLabelItemLeft: {
    alignItems: 'flex-start',
    width: horizontalScale(80),
  },
  stepLabelItemCenter: {
    alignItems: 'center',
    width: horizontalScale(80),
  },
  stepLabelItemRight: {
    alignItems: 'flex-end',
    width: horizontalScale(80),
  },
  stepLabelText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
  },
  stepLabelTextActive: {
    color: colors.primary,
  },
  stepLabelTextInactive: {
    color: colors.textSecondary,
  },

  // Step Badge
  badgeContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  stepBadge: {
    backgroundColor: colors.badgePurple,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: fontSize(13),
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  // Titles & Headings
  title: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(8),
    textAlign: 'left',
  },
  subtitle: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: verticalScale(24),
    textAlign: 'left',
  },
  emailHighlightText: {
    color: colors.black,
    fontFamily: fonts.semiBold,
  },

  // Email Box Field (Step 1)
  fieldLabel: {
    fontSize: fontSize(13),
    fontFamily: fonts.medium,
    color: colors.gray,
    marginBottom: verticalScale(8),
  },
  emailBox: {
    height: verticalScale(54),
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(32),
  },
  emailIcon: {
    width: horizontalScale(30),
    height: horizontalScale(30),
    marginRight: horizontalScale(12),
    resizeMode: 'contain',
  },
  emailValueText: {
    fontSize: fontSize(15),
    fontFamily: fonts.medium,
    color: colors.black,
    flex: 1,
  },

  // Step 2 OTP Styles
  otpContainer: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    alignItems: 'center',
  },
  otpInputContainer: {
    width: horizontalScale(50 * 6 + 10 * 5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  otpPinCodeContainer: {
    width: horizontalScale(50),
    height: horizontalScale(58),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: horizontalScale(5),
  },
  otpPinCodeFocused: {
    width: horizontalScale(50),
    height: horizontalScale(58),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: horizontalScale(5),
  },
  otpPinCodeText: {
    fontSize: fontSize(20),
    fontFamily: fonts.semiBold,
    color: colors.black,
    textAlign: 'center',
  },
  timerText: {
    marginTop: verticalScale(24),
    alignSelf: 'center',
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  timerCount: {
    color: colors.red,
    fontFamily: fonts.semiBold,
    fontSize: fontSize(14),
  },

  // Bottom Actions
  bottomContainer: {
    marginTop: verticalScale(32),
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(20),
  },
  resendText: {
    fontSize: fontSize(13),
    color: colors.gray,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  resendLink: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: fontSize(13),
  },
  resendLinkDisabled: {
    color: colors.textSecondary,
    opacity: 0.6,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: fontSize(15),
    fontFamily: fonts.medium,
    color: colors.gray,
    marginTop: verticalScale(12),
  },
});

export default styles;
