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
  fieldWrapper: {
    marginBottom: verticalScale(20),
  },
  footer: {
    padding: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  submitButton: {
    height: verticalScale(56),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
});

export default styles;
