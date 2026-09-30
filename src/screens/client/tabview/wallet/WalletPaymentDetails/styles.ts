import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(15),
    color: colors.gray,
  },
  errorText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(15),
    color: colors.red,
  },
  content: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(100),
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: horizontalScale(20),
    paddingVertical: verticalScale(24),
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: horizontalScale(64),
    height: horizontalScale(64),
    borderRadius: horizontalScale(32),
  },
  placeholderAvatar: {
    width: horizontalScale(64),
    height: horizontalScale(64),
    borderRadius: horizontalScale(32),
    backgroundColor: colors.lightPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(24),
    color: colors.primary,
  },
  nameText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(18),
    color: colors.textDark,
    marginBottom: verticalScale(8),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  arrowIcon: {
    marginRight: horizontalScale(6),
  },
  amountText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(22),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(12),
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(12),
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(16),
    color: colors.textDark,
    marginBottom: verticalScale(12),
    paddingLeft: horizontalScale(4),
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    padding: horizontalScale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(13),
    color: colors.gray,
  },
  detailValue: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(13),
    color: colors.textDark,
    maxWidth: '65%',
  },
  detailIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconWrapper: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    borderRadius: horizontalScale(12),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(8),
  },
  detailIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    tintColor: colors.primary,
    resizeMode: 'contain',
  },
});

export default styles;
