import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
    backgroundColor:colors.white,
  },
  listContent: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(120),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: horizontalScale(20),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  cardInner: {
    padding: horizontalScale(16),
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
    flex: 1,
    marginRight: horizontalScale(10),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: horizontalScale(8),
    backgroundColor: '#E0F2FE',
  },
  statusText: {
    fontSize: fontSize(12),
    fontFamily: fonts.semiBold,
    color: '#0EA5E9',
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
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: verticalScale(50),
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: fontSize(16),
    fontFamily: fonts.semiBold,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
});

export default styles;
