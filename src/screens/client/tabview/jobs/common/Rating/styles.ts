import { StyleSheet, Dimensions } from 'react-native';
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
    fontFamily: fonts.bold,
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
  contractorCard: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    padding: horizontalScale(16),
    marginTop: verticalScale(16),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    // Shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  contractorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  contractorImg: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: horizontalScale(30),
    marginRight: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contractorName: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  contractorRole: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginTop: verticalScale(2),
  },
  contractorDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(12),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  detailIcon: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    tintColor: colors.gray,
  },
  detailText: {
    fontSize: fontSize(11),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  selectRatingsTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(20),
    marginBottom: verticalScale(12),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
  },
  starsContainer: {
    flexDirection: 'row',
    gap: horizontalScale(4),
  },
  starIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
  },
  ratingValueText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  ratingFilterRow: {
    marginTop: verticalScale(20),
  },
  filterTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(12),
  },
  starsRow: {
    flexDirection: 'row',
    gap: horizontalScale(4),
  },
  categoriesTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(20),
    marginBottom: verticalScale(12),
  },
  categorySection: {
    marginTop: verticalScale(12),
  },
  categoryLabel: {
    fontSize: fontSize(13),
    fontFamily: fonts.regular,
    color: colors.black,
    marginBottom: verticalScale(10),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
  },
  tag: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(10),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  activeTag: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: fontSize(12),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  activeTagText: {
    color: colors.primary,
  },
  submitButton: {
    height: verticalScale(52),
    backgroundColor: colors.primary,
    borderRadius: horizontalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(32),
  },
  submitButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});

export default styles;
