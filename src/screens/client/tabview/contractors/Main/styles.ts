import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  searchContainer: {
    marginBottom: verticalScale(60),
  },
  searchInput: {
    height: verticalScale(48),
    borderRadius: verticalScale(24), // Very rounded search bar
  },
  searchIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    marginRight: horizontalScale(10),
    tintColor: colors.gray,
  },
  filterButton: {
    padding: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    tintColor: colors.gray,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    marginTop: verticalScale(4),
  },
  countText: {
    fontSize: fontSize(18),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  checkboxIcon: {
    width: horizontalScale(22),
    height: horizontalScale(22),
    resizeMode: 'contain',
  },
  selectAllText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  listContent: {
    paddingBottom: verticalScale(200),
  },
  footer: {
    position: 'absolute',
    bottom: verticalScale(150),
    left: horizontalScale(60),
    right: horizontalScale(60),
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  invitationButton: {
    height: verticalScale(54),
    backgroundColor: colors.primary,
    borderRadius: verticalScale(27),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  invitationButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  disabledButtonText: {
    color: '#8E8E93', // Darker gray for disabled text to match the image
    fontFamily: fonts.medium,
  },
  filterSheet: {
    padding: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  filterTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.black,
    textAlign: 'center',
  },
  clearText: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  filterSectionLabel: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: verticalScale(8),
  },
  ratingFilterRow: {
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
  starIcon: {
    width: horizontalScale(28),
    height: horizontalScale(28),
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
});

export default styles;
