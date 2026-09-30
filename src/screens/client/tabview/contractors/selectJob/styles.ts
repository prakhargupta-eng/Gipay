import { StyleSheet, Platform, StatusBar } from 'react-native';
import { horizontalScale, verticalScale, fontSize, SCREEN_WIDTH } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
  },
  backButton: {
    padding: horizontalScale(8),
    marginLeft: horizontalScale(-8),
    marginRight: horizontalScale(10),
  },
  backIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    tintColor: colors.black,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize(20),
    fontFamily: fonts.medium,
    color: colors.black,
    marginRight: horizontalScale(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  searchContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(15),
  },
  searchBarContainer: {
    height: horizontalScale(56),
    borderRadius: horizontalScale(28),
    borderColor: '#E0E0E0',
    backgroundColor: colors.white,
    paddingHorizontal: horizontalScale(16),
  },
  searchIconInside: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    marginRight: horizontalScale(10),
    tintColor: colors.gray,
  },
  filterIconInside: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    tintColor: colors.gray,
  },
  // ─── Contractor Card Styles ──────────────────────────────
  card: {
    backgroundColor: colors.white,
    borderRadius: verticalScale(20),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: colors.statBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
  },
  profileImg: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: horizontalScale(30),
    backgroundColor: colors.lightGray,
  },
  cardMainInfo: {
    flex: 1,
    marginLeft: horizontalScale(12),
    justifyContent: 'center',
  },
  contractorName: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  contractorRole: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  ratingText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.gray,
    marginLeft: horizontalScale(4),
  },
  starIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: '#FFC107',
  },
  cardDetails: {
    marginBottom: verticalScale(5),
    gap: verticalScale(6),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.gray,
    marginRight: horizontalScale(8),
  },
  detailText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  // ─── Filter Sheet ───────────────────────────────────────
  filterSheet: {
    padding: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    position: 'relative',
    width: '100%',
  },
  filterTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
    textAlign: 'center',
  },
  clearText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: '#2B34B9',
  },
  clearButtonContainer: {
    position: 'absolute',
    right: 0,
  },
  filterSectionLabel: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: verticalScale(8),
  },
  ratingFilterRow: {
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
    color: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  starsRow: {
    flexDirection: 'row',
    gap: horizontalScale(4),
  },
  filterActions: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  cancelButton: {
    flex: 1,
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    height: verticalScale(50),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: verticalScale(30),
    borderTopRightRadius: verticalScale(30),
    paddingTop: verticalScale(12),
  },
  handle: {
    width: horizontalScale(40),
    height: verticalScale(4),
    backgroundColor: colors.border,
    borderRadius: verticalScale(2),
    alignSelf: 'center',
    marginBottom: verticalScale(10),
  },
  // ─── Selection Styles ──────────────────────────────────────────
  selectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(70),
    marginBottom: verticalScale(16),
  },
  totalCountText: {
    fontSize: fontSize(18),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: horizontalScale(10),
  },
  checkboxImage: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    resizeMode: 'contain',
  },
  selectAllText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  // ─── Job Card Styles (for SelectJobScreen) ─────────────────────
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: verticalScale(20),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  jobCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobCardContent: {
    flex: 1,
  },
  checkboxContainer: {
    marginLeft: horizontalScale(10),
  },
  jobTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  jobPay: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  jobCompany: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: verticalScale(12),
  },
  jobDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  jobDateIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.gray,
  },
  jobDateText: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  jobFooter: {
    padding: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(50),
  },
  emptyText: {
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  listFooter: {
    paddingBottom: verticalScale(100),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
    marginTop: verticalScale(10),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: verticalScale(20),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.black,
    marginRight: horizontalScale(4),
  },
  removeIcon: {
    fontSize: fontSize(14),
    color: colors.gray,
    fontWeight: 'bold',
  },
});

export default styles;
