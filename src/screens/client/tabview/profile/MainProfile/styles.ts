import { StyleSheet, Platform } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
    height: verticalScale(56),
    marginTop: verticalScale(10),
  },
  headerTitle: {
    fontSize: fontSize(20),
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  scrollContent: {
    paddingBottom: verticalScale(100), // Space for tab bar
    paddingHorizontal: horizontalScale(20),
  },
  userInfoSection: {
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
  },
  avatarContainer: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: horizontalScale(50),
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: horizontalScale(50),
  },
  userName: {
    fontSize: fontSize(20),
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(4),
  },
  section: {
    marginBottom: verticalScale(12),
  },
  sectionHeader: {
    fontSize: fontSize(16),
    fontFamily: Fonts.medium,
    color: colors.black,
    marginBottom: verticalScale(16),
  },
  settingItem: {
    height: verticalScale(60),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: colors.statBorder,
    paddingHorizontal: horizontalScale(16),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: horizontalScale(36),
    height: horizontalScale(36),
    backgroundColor: colors.lightPurple,
    borderRadius: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  itemIcon: {
    width: horizontalScale(34),
    height: horizontalScale(34),
  },
  settingText: {
    fontSize: fontSize(16),
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  chevron: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.gray,
    transform: [{ rotate: '180deg' }],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(40),
  },
  footerButton: {
    width: '48%',
    height: verticalScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  footerBtnIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    marginRight: horizontalScale(10),
  },
  footerBtnText: {
    fontSize: fontSize(14),
    fontFamily: Fonts.medium,
  },
});

export default styles;
