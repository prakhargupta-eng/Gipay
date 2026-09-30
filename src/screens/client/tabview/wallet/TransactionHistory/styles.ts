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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(12),
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(48),
    marginTop: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: '#9CA3AF',
    marginRight: horizontalScale(12),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  filterIconContainer: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: horizontalScale(12),
    backgroundColor: '#F9FAFB',
  },
  filterIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
    paddingHorizontal:horizontalScale(10)
  },
  totalTitle: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#6B7280',
    marginBottom: verticalScale(2),
  },
  totalCount: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: horizontalScale(24),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
  },
  sortIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    marginRight: horizontalScale(6),
    tintColor: '#4B5563',
  },
  sortText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: '#4B5563',
  },
  dropdownIcon: {
    width: horizontalScale(12),
    height: horizontalScale(12),
    marginLeft: horizontalScale(6),
    tintColor: '#4B5563',
  },
  listContent: {
    paddingBottom: verticalScale(40),
  }
});

export default styles;
