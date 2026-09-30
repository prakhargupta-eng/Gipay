import { StyleSheet, Dimensions } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipContainer: {
    position: 'absolute',
    top: verticalScale(50),
    right: horizontalScale(20),
    zIndex: 10,
  },
  skipButton: {
    backgroundColor: '#F3F2FF',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(8),
  },
  skipText: {
    fontSize: fontSize(14),
    fontFamily: Fonts.medium,
    color: '#4F46E5',
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: verticalScale(30),
  },
  imageContainer: {
    width: width * 0.9,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: horizontalScale(40),
    alignItems: 'center',
    width: '100%',
    marginTop: verticalScale(20),
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(30),
  },
  dot: {
    width: horizontalScale(8),
    height: horizontalScale(8),
    borderRadius: horizontalScale(4),
    marginHorizontal: horizontalScale(4),
  },
  title: {
    fontSize: fontSize(22),
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: verticalScale(12),
    lineHeight: verticalScale(30),
  },
  description: {
    fontSize: fontSize(14),
    fontFamily: Fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
  footer: {
    paddingHorizontal: horizontalScale(20),
  },
  button: {
    height: verticalScale(56),
    backgroundColor: '#1A0B8F',
    borderRadius: horizontalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: fontSize(16),
    fontFamily: Fonts.bold,
    color: colors.white,
  },
});

export default styles;
