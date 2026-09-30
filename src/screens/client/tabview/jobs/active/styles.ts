import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: horizontalScale(30),
    padding: horizontalScale(4),
    marginTop: verticalScale(20),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: horizontalScale(26),
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: fontSize(15),
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  activeTabButtonText: {
    color: colors.white,
  },
  listContent: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(120),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  jobTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: horizontalScale(8),
    backgroundColor: '#E8FBF0',
  },
  statusText: {
    fontSize: fontSize(12),
    fontFamily: fonts.semiBold,
    color: '#10C71A',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  detailIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    marginRight: horizontalScale(10),
  },
  detailText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: verticalScale(100),
    right: horizontalScale(20),
    zIndex: 999,
    backgroundColor: colors.white, // Background for shadow
    borderRadius: horizontalScale(30),
    // Shadow for iOS
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 10,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: horizontalScale(30),
  },
  addIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.white,
    marginRight: horizontalScale(8),
    marginLeft: horizontalScale(20),
  },
  addJobText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
    color: colors.white,
        marginRight: horizontalScale(20),

  },
});

export default styles;
