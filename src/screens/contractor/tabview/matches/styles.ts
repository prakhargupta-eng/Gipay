import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import Fonts from '@assets/Fonts';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
    },
    switchContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(30),
        paddingBottom: verticalScale(10),
    },
    toggleWrapper: {
        backgroundColor: colors.white,
        borderColor: colors.lightBorder,
        borderWidth: 1,
        borderRadius: horizontalScale(30),
        height: verticalScale(48)

    },
    toggleSlider: {
        backgroundColor: colors.primary,
        borderRadius: horizontalScale(27),
        height: verticalScale(48)
    },
    toggleText: {
        color: colors.primary,
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
    },
    toggleActiveText: {
        color: colors.white,
        fontFamily: Fonts.regular,
    },
    listContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(15),
        paddingBottom: verticalScale(100),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.lightBorder,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    jobTitle: {
        fontSize: fontSize(18),
        fontFamily: Fonts.bold,
        color: colors.textDark,
        flex: 1,
        marginRight:verticalScale(10)
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.bold,
    },
    companyName: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.ABB5C5,
        marginBottom: verticalScale(8),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    starIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
    },
    ratingText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.ABB5C5,
        marginLeft: horizontalScale(4),
    },
    infoGrid: {
        marginTop: verticalScale(4),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: horizontalScale(16),
    },
    infoIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
        tintColor: colors.ABB5C5,
    },
    infoText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.regular,
        color: colors.ABB5C5,
        marginLeft: horizontalScale(8),
    },
    negotiationRatesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    originalRateText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.regular,
        color: colors.ABB5C5,
        marginLeft: horizontalScale(8),
        textDecorationLine: 'line-through',
    },
    negotiatedRateText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.regular,
        color: colors.ABB5C5,
        marginLeft: horizontalScale(12),
    },
    negotiateBtn: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgLight,
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(10),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(36),
        marginTop: verticalScale(4),
    },
    negotiateIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
        tintColor: colors.textDark,
    },
    negotiateText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.bold,
        color: colors.textDark,
        marginLeft: horizontalScale(8),
    },
});
