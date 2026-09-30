import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    marginHorizontal: horizontalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: fontSize(18),
    color: '#111111',
  },
  companyText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(15),
    color: '#888888',
    marginBottom: verticalScale(12),
  },
  badge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: horizontalScale(6),
  },
  badgeText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(12),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  starIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    resizeMode: 'contain',
    marginRight: horizontalScale(6),
  },
  ratingText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(15),
    color: '#888888',
  },
  distanceText: {
    fontFamily: Fonts.regular,
    fontSize: fontSize(15),
    color: '#888888',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  iconSmall: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    resizeMode: 'contain',
    tintColor: '#A0A0A0',
    marginRight: horizontalScale(8),
  },
  infoText: {
    fontFamily: Fonts.light,
    fontSize: fontSize(12),
    color: '#888888',
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
    color: '#B0B0B0',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(10),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    gap: horizontalScale(6),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(6),
    borderRadius: horizontalScale(6),
  },
  actionIcon: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    resizeMode: 'contain',
    tintColor: '#333333',
    marginRight: horizontalScale(4),
  },
  actionText: {
    fontFamily: Fonts.medium,
    fontSize: fontSize(12),
    color: '#333333',
  },
  infoBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: horizontalScale(4),
  },
  infoIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    resizeMode: 'contain',
  }
});

export default styles;
