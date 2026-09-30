import { StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  container: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(24),
    padding: horizontalScale(20),
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: fontSize(20),
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  closeButton: {
    padding: horizontalScale(4),
  },
  closeIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    tintColor: colors.black,
  },
  scrollContent: {
    paddingBottom: verticalScale(10),
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(16),
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
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: horizontalScale(12),
    padding: horizontalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    backgroundColor: colors.white,
    marginTop: verticalScale(4),
    height: verticalScale(160),
  },
  uploadIconContainer: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: horizontalScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  uploadIcon: {
    width: horizontalScale(40),
    height: horizontalScale(40),
  },
  uploadMainText: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.black,
    marginBottom: verticalScale(4),
  },
  uploadSubText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: verticalScale(18),
  },
  textArea: {
    height: verticalScale(80),
    textAlignVertical: 'top',
    paddingTop: verticalScale(12),
  },
  contractorStyle :{
    marginBottom  :verticalScale(20)
  },
  textAreaContainer: {
    height: verticalScale(100),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: horizontalScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: colors.white,
  },
  innerTextArea: {
    padding: 0,
    paddingTop: Platform.OS === 'ios' ? verticalScale(2) : 0,
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.black,
    textAlignVertical: 'top',
    minHeight: verticalScale(64),
  },
  notesContainer: {
    marginTop: verticalScale(16),
    gap: verticalScale(4),
  },
  noteText: {
    fontSize: fontSize(9),
    fontFamily: fonts.regular,
    color: colors.black,
    lineHeight: verticalScale(14),
  },
  submitButton: {
    marginTop: verticalScale(24),
  },
  errorText: {
    color: colors.red,
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    marginTop: verticalScale(4),
  },
  previewWrapper: {
    marginTop: verticalScale(16),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(12),
  },
  previewContainer: {
    width: horizontalScale(80),
    alignItems: 'center',
  },
  documentThumbnail: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: horizontalScale(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: verticalScale(8),
  },
  documentIcon: {
    width: horizontalScale(32),
    height: horizontalScale(32),
    resizeMode: 'contain',
  },
  removeButton: {
    position: 'absolute',
    top: -horizontalScale(8),
    right: -horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconImg: {
    width: horizontalScale(24),
    height: horizontalScale(24),
  },
  fileName: {
    fontSize: fontSize(10),
    fontFamily: fonts.regular,
    color: colors.gray,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: verticalScale(4),
  },
  radioOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  radioBtn: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    borderRadius: horizontalScale(10),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(10),
    backgroundColor: colors.white,
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
    color: colors.black,
  },
  radioTextSelected: {
    fontFamily: fonts.medium,
    color: colors.black,
  },
});

export default styles;
