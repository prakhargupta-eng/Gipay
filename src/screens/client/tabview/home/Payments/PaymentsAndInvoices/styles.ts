import { StyleSheet, Platform } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchContainer: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(24),
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(50),
  },
  searchIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.textSecondary,
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(10),
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.textDark,
  },
  filterBtn: {
    padding: horizontalScale(8),
  },
  filterIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.textSecondary,
    resizeMode: 'contain',
  },
  filterTabsContainer: {
    marginTop: verticalScale(16),
  },
  filterTabsContent: {
    paddingRight: horizontalScale(20),
  },
  filterTab: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(20),
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: horizontalScale(10),
    backgroundColor: colors.white,
  },
  filterTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  filterTabText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(14),
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.primary,
  },

  listContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
  avatarContainer: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: horizontalScale(24),
    backgroundColor: colors.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: fontSize(16),
    color: colors.primary,
  },
  titleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(15),
    color: colors.textDark,
    marginRight: horizontalScale(10)
  },
  jobRef: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(12),
    color: colors.textSecondary,
    marginTop: verticalScale(2),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(6),
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(13),
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  iconSmallCost: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    marginRight: horizontalScale(6),
        tintColor: colors.textSecondary,

    resizeMode: 'contain',
  },
  iconSmall: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    marginRight: horizontalScale(6),
    resizeMode: 'contain',
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    color: colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: colors.statBorder,
    marginBottom: verticalScale(16),
  },
  smallIconContainer: {
    width: horizontalScale(28),
    height: horizontalScale(28),
    borderRadius: horizontalScale(8),
    backgroundColor: colors.lightPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(10),
  },
  costIcon: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    resizeMode: 'contain',
  },
   costIcon1: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    resizeMode: 'contain',
    tintColor: colors.primary,
    
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  costLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costLabel: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    color: colors.gray,
  },
  costValue: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(12),
    color: colors.textDark,
  },
  netPayableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  netPayableLabel: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(12),
    color: colors.gray,
  },
  netPayableValue: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(12),
    color: colors.primary,
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    marginRight: horizontalScale(4),
  },
  transactionType: {
    fontSize: fontSize(11),
    fontFamily: Fonts.medium,
    color: colors.primary,
    marginTop: verticalScale(4),
  },
});

export default styles;
