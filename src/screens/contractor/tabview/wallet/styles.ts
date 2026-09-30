// src/screens/contractor/tabview/wallet/styles.ts

import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingHorizontal: horizontalScale(20),
        borderBottomLeftRadius: horizontalScale(30),
        borderBottomRightRadius: horizontalScale(30),
        overflow: 'hidden',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        position: 'relative',
    },
    headerTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: colors.white,
    },
    notificationBtn: {
        position: 'absolute',
        right: 0,
        padding: horizontalScale(8),
        borderRadius: horizontalScale(12),
    },
    notificationIcon: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        tintColor: colors.white,
    },
    mainCard: {
        borderRadius: horizontalScale(24),
        paddingHorizontal: horizontalScale(16),
        paddingTop: verticalScale(10),
        paddingVertical: horizontalScale(5),
        marginBottom: verticalScale(18),
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.3)',

    },
    cardLabel: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.white,
        marginBottom: verticalScale(8),
    },
    cardValue: {
        fontSize: fontSize(40), // Larger for emphasis
        fontFamily: fonts.bold,
        color: colors.white,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: horizontalScale(15),
    },
    subCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // More visible
        borderRadius: horizontalScale(15),
        padding: horizontalScale(15),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: verticalScale(20),
    },
    subCardLabel: {
        fontSize: fontSize(12),
        fontFamily: fonts.bold,
        marginBottom: verticalScale(8),
    },
    subCardValue: {
        fontSize: fontSize(24), // Increased from 20
        fontFamily: fonts.bold,
        color: colors.white,
    },
    menuContainer: {
        marginTop: verticalScale(30),
        paddingHorizontal: horizontalScale(20),
        gap: verticalScale(16), // Balanced spacing
        paddingBottom: verticalScale(40), // Space at bottom
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(25), // More rounded
        padding: horizontalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    menuIconWrapper: {
        width: horizontalScale(50),
        height: horizontalScale(50),
        borderRadius: horizontalScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(15),
    },
    menuIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(2),
    },
    menuSubTitle: {
        fontSize: fontSize(12),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    arrowIcon: {
        width: horizontalScale(25),
        height: horizontalScale(25),
        tintColor: '#D1D5DB',
        transform: [{ rotate: '180deg' }], // Rotate back icon to face right
    },
});

export default styles;
