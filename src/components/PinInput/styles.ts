import { StyleSheet } from 'react-native';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';
import { fontSize, horizontalScale, verticalScale } from '@styles/mixins';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(40),
  },
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: verticalScale(16),
  },
  lockBadgeContainer: {
    width: horizontalScale(64),
    height: horizontalScale(64),
    borderRadius: horizontalScale(32),
    backgroundColor: colors.lockShieldBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    overflow: 'hidden',
  },
  lockBadge: {
    width: horizontalScale(36),
    height: horizontalScale(42),
  },
  title: {
    fontSize: fontSize(20),
    fontFamily: fonts.regular,
    color: colors.black,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  dotsWrapper: {
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    marginHorizontal: horizontalScale(8),
  },
  dotError: {
    tintColor: colors.red,
  },
  errorText: {
    fontSize: fontSize(13),
    fontFamily: fonts.medium,
    color: colors.red,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  keypadContainer: {
    width: '100%',
    maxWidth: horizontalScale(330),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(36),
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  keyButton: {
    width: horizontalScale(76),
    height: horizontalScale(76),
    borderRadius: horizontalScale(38),
    backgroundColor: colors.pinKeypadBg,
    borderWidth: 1,
    borderColor: colors.pinKeypadBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyKey: {
    width: horizontalScale(76),
    height: horizontalScale(76),
  },
  keyPressed: {
    backgroundColor: colors.pinKeyPressed,
    borderColor: colors.primary,
    transform: [{ scale: 0.95 }],
  },
  keyDisabled: {
    opacity: 0.35,
  },
  keyText: {
    fontSize: fontSize(24),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  footerText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default styles;
