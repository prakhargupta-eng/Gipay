import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    paddingHorizontal: horizontalScale(20),
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: horizontalScale(32),
    borderBottomRightRadius: horizontalScale(32),
    paddingBottom: verticalScale(28),
    backgroundColor: '#1E0B89', // Fallback to prevent image cutoff
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(18),
    position: 'relative',
  },
  headerTitle: {
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  notificationButton: {
    position: 'absolute',
    right: 0,
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: horizontalScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: horizontalScale(22),
    height: horizontalScale(22),
  },
  escrowCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: horizontalScale(28),
    paddingHorizontal: horizontalScale(22),
    paddingVertical: verticalScale(20),
    marginTop: verticalScale(10),
  },
  escrowTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  escrowLabel: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  escrowAmount: {
    fontSize: fontSize(40),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  addMoneyButton: {
    backgroundColor: '#00B017',
    borderRadius: horizontalScale(30),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addMoneyText: {
    fontSize: fontSize(15),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(0),
    paddingBottom: verticalScale(40),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    paddingHorizontal: horizontalScale(20),
    // Removed horizontal padding and top margin since it will be in ListHeaderComponent
  },
  sectionTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  seeAllText: {
    fontSize: fontSize(13),
    fontFamily: fonts.medium,
    color: '#301A9E',
  },
  paymentsList: {
    // Gap handled by FlatList ItemSeparatorComponent or contentContainerStyle
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E2EE',
  },
  avatar: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: horizontalScale(12),
    backgroundColor: '#F3EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(14),
  },
  avatarText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: '#8A49F7',
  },
  paymentDetails: {
    flex: 1,
    justifyContent: 'center',
    marginRight: horizontalScale(8),
  },
  jobTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: '#1A1D26',
    marginBottom: verticalScale(4),
  },
  contractorName: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#8A8E9B',
  },
  timeAgo: {
    color: '#8A8E9B',
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  paymentAmount: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: '#1A1D26',
    marginBottom: verticalScale(6),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: horizontalScale(16),
  },
  statusText: {
    fontSize: fontSize(12),
    fontFamily: fonts.semiBold,
  },
  statusPaidBg: {
    backgroundColor: '#E7F9F0',
  },
  statusPaidText: {
    color: '#12B76A',
  },
  statusPendingBg: {
    backgroundColor: '#FFF4E0',
  },
  statusPendingText: {
    color: '#F5A623',
  },
  bottomSpacer: {
    height: verticalScale(90),
  },
});

export default styles;
