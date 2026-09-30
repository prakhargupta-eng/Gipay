import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale } from '@styles/mixins';
import fonts from '@assets/Fonts';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(12),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(18),
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logo: {
    width: verticalScale(196),
    height: horizontalScale(40),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    marginTop: verticalScale(20),
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#9CA3AF',
    marginTop: verticalScale(6),
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  formFields: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: verticalScale(5),
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11,
    marginBottom: verticalScale(10),
    marginLeft: horizontalScale(10),
    fontFamily: fonts.regular,
  },
  errorTextNoMarginLeft: {
    marginLeft: 0,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(18),
    marginBottom: verticalScale(10),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#5A3FFF',
    borderColor: '#5A3FFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  termsText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#9CA3AF',
    flex: 1,
  },
  termsLink: {
    color: '#5A3FFF',
    fontFamily: fonts.semiBold,
  },
  bottomContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(12),
    paddingTop: verticalScale(10),
  },
  buttonWrapper: {
    marginTop: verticalScale(5),
  },
  loginOption: {
    textAlign: 'center',
    marginTop: verticalScale(16),
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  loginLink: {
    color: '#5A3FFF',
    fontFamily: fonts.semiBold,
  },
  
});
