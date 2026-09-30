import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(40),
  },
  // ─── Header ─────────────────────────────────────────────
  header: {
    paddingTop: STATUSBAR_HEIGHT + verticalScale(10),

  },
  backButton: {
    padding: horizontalScale(8),
    marginLeft: horizontalScale(-8),
  },
  backIcon: {
    width: horizontalScale(30),
    height: horizontalScale(30),
    tintColor: colors.black,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize(20),
    fontFamily: fonts.medium,
    color: colors.black,
    marginRight: horizontalScale(28),
  },
  editButtonSmall: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: verticalScale(8),
    marginRight: horizontalScale(0),
  },
  editButtonTextSmall: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  bioContainer: {
    height: verticalScale(120),
    alignItems: 'flex-start',
    paddingTop: verticalScale(10),
  },
  bioInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  locationContainer: {
    minHeight: verticalScale(52),
    height: 'auto',
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  locationInput: {
    paddingRight: horizontalScale(8),
  },
  // ─── Section ────────────────────────────────────────────
  sectionTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  fieldWrapper: {
    marginBottom: verticalScale(18),
  },
  fieldLabel: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: verticalScale(8),
  },
  // ─── Date/Time Row ──────────────────────────────────────
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(18),
  },
  halfField: {
    width: '48%',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(52),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    backgroundColor: colors.white,
  },
  pickerText: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  pickerIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.gray,
  },
  dollarSign: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  // ─── Action Buttons ─────────────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: verticalScale(25),
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
  },
  draftButton: {
    width: '48%',
    height: verticalScale(52),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: fontSize(18),
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  previewButton: {
    width: '48%',
    height: verticalScale(52),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: fontSize(18),
    fontFamily: fonts.medium,
    color: colors.white,
  },
  // ─── Upload Section ─────────────────────────────────────
  uploadSectionHeader: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: verticalScale(12),
  },
  uploadContainer: {
    height: verticalScale(160),
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  uploadContainerError: {
    borderColor: colors.red,
  },
  uploadIconContainer: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  uploadIcon: {
    width: horizontalScale(44),
    height: horizontalScale(44),
  },
  uploadTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.black,
    marginBottom: verticalScale(4),
  },
  uploadSubtitle: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  upload: {
    width: horizontalScale(44),
    height: horizontalScale(44),
  },
  uploadText: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: '#1F2937',
    textAlign: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  uploadSubText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
    marginTop: verticalScale(4),
    textAlign: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  uploadedState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  fileCountBadge: {
    marginTop: verticalScale(12),
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: verticalScale(20),
  },
  fileCountText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: '#34C759',
  },
  uploadedDocsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(20),
    gap: horizontalScale(15),
  },
  docItemRow: {
    width: horizontalScale(80),
    alignItems: 'center',
  },
  docPreviewBox: {
    width: horizontalScale(70),
    height: horizontalScale(70),
    backgroundColor: '#F9FAFB',
    borderRadius: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  docIconLarge: {
    width: horizontalScale(35),
    height: horizontalScale(35),
  },
  removeIconContainer: {
    position: 'absolute',
    top: -horizontalScale(8),
    right: -horizontalScale(8),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 2,
  },
  removeIconSmall: {
    width: horizontalScale(18),
    height: horizontalScale(18),
  },
  removeDocBadge: {
    position: 'absolute',
    top: -horizontalScale(8),
    right: -horizontalScale(8),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: horizontalScale(24),
    height: horizontalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  removeIconImg: {
    width: horizontalScale(30),
    height: horizontalScale(30),
  },
  docNameText: {
    fontSize: fontSize(11),
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: verticalScale(6),
    textAlign: 'center',
    width: '100%',
  },
  docNameUnder: {
    fontSize: fontSize(11),
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: verticalScale(6),
    textAlign: 'center',
    width: '100%',
  },
  documentSection: {
    marginBottom: verticalScale(20),
  },
  // ─── Preview Sheet Styles ───────────────────────────────
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: verticalScale(32),
    borderTopRightRadius: verticalScale(32),
    height: SCREEN_HEIGHT * 0.80,
    paddingTop: verticalScale(12),
  },
  handle: {
    width: horizontalScale(60),
    height: verticalScale(5),
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: verticalScale(20),
  },
  headerSheet: {
    flex: 1,
    marginRight: horizontalScale(10),
    marginBottom: verticalScale(24),
  },
  headerSheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  jobTitleSheet: {
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  companyNameSheet: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(4),
  },
  detailsGrid: {
    borderRadius: verticalScale(16),
    // padding: horizontalScale(16),
    marginBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  rowItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    tintColor: colors.gray,
    marginRight: horizontalScale(12),
  },
  detailText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.gray,
    flex: 1,
  },
  sectionTitleSheet: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginBottom: verticalScale(12),

  },
  contentBoxSheet: {
    borderWidth: 1,
    borderRadius: verticalScale(12),
    padding: horizontalScale(16),
    marginBottom: verticalScale(24),
    borderColor: colors.border,
  },
  descriptionTextSheet: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    lineHeight: fontSize(20),
  },
  bulletItem: {
    fontSize: fontSize(14),
    fontFamily: fonts.light,
    color: colors.gray,
    marginBottom: verticalScale(4),
  },
  contractorRowSheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  countBox: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: verticalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  footerSheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),

  },
  outlineButtonSheet: {
    flex: 1,
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonTextSheet: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  filledButtonSheet: {
    flex: 1,
    height: verticalScale(54),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(30)
  },
  filledButtonTextSheet: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // ─── Success Modal ──────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: verticalScale(24),
    padding: horizontalScale(24),
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: verticalScale(16),
    right: horizontalScale(16),
    padding: 8,
    zIndex: 10,
  },
  closeIcon: {
    width: horizontalScale(30),
    height: horizontalScale(30),
  },
  successImage: {
    width: horizontalScale(120),
    height: horizontalScale(120),
    marginBottom: verticalScale(20),
    marginTop: verticalScale(10),
  },
  modalTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  modalDescription: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: '#888888',
    textAlign: 'center',
    lineHeight: fontSize(24),
    marginBottom: verticalScale(35),
    paddingHorizontal: horizontalScale(10),
  },
  modalButton: {
    width: '100%',
    height: verticalScale(56),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  errorText: {
    color: colors.red,
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
    marginTop: verticalScale(6),
    marginLeft: horizontalScale(4),
  },
  editNoticeContainer: {
    backgroundColor: '#EEF2FF', // light blue from screenshot
    padding: horizontalScale(12),
    borderRadius: verticalScale(10),
    marginBottom: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  editNoticeIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    marginRight: horizontalScale(12),
    tintColor: '#4338CA', // darker blue for the icon if it's tintable, or we can just use the image directly
  },
  editNoticeText: {
    flex: 1,
    fontSize: fontSize(13),
    fontFamily: fonts.medium,
    color: '#4B5563',
    lineHeight: fontSize(18),
  },
  noteBold: {
    fontFamily: fonts.bold,
    color: '#4338CA',
  },
});

export default styles;
