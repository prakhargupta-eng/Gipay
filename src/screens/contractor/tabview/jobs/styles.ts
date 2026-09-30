import { StyleSheet, Platform, StatusBar } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT + verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(16),
  },
  headerTitle: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(20),
    color: colors.textDark,
  },
  notificationBtn: {
    position: 'absolute',
    right: horizontalScale(20),
    bottom: verticalScale(16),
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  notificationIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    resizeMode: 'contain',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: horizontalScale(20),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(25),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: verticalScale(20),
    height: verticalScale(48),
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: horizontalScale(25),
  },
  activeTabBtn: {
    backgroundColor: '#1B0A6B', // App primary dark blue
  },
  tabText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(14),
    color: '#1B0A6B',
  },
  activeTabText: {
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: horizontalScale(20),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(24),
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(50),
    marginBottom: verticalScale(30),
  },
  searchIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    tintColor: colors.gray,
    marginRight: horizontalScale(12),
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: fontSize(14),
    color: colors.textDark,
    height: '100%',
  },
  filterIcon: {
     width: horizontalScale(24),
    height: horizontalScale(24),
    tintColor: colors.gray,
    marginLeft: horizontalScale(12),
  },
  listContainer: {
    paddingBottom: verticalScale(120), // Extra padding for the absolute positioned TabBar
  }
});

export default styles;
