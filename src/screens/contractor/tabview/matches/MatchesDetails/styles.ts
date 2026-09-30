import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import Fonts from '@assets/Fonts';

export default StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(120),
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(20),
    },
    companyLogo: {
        width: horizontalScale(60),
        height: horizontalScale(60),
        borderRadius: horizontalScale(40),
        borderWidth: 2,
        borderColor: colors.primary,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: horizontalScale(40),
        backgroundColor: colors.lightGray,
    },
    headerTextContent: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRightContent: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    jobTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
        color: colors.textDark,
        marginBottom: verticalScale(4),
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
        fontFamily: Fonts.light,
        color: colors.gray,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(12),
    },
    starIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
    },
    ratingText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.gray,
        marginLeft: horizontalScale(4),
    },
    detailsGrid: {
        marginTop: verticalScale(24),
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        marginRight:horizontalScale(10)
    },
    locationDetailItem: {
        alignItems: 'flex-start',
    },
    locationIcon: {
        marginTop: verticalScale(2),
    },
    dateTimeItemLeft: {
        marginBottom: 0,
        marginRight: horizontalScale(15),
    },
    dateTimeItemRight: {
        marginBottom: 0,
    },
    detailIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
        tintColor: colors.gray,
    },
    detailText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: colors.gray,
        marginLeft: horizontalScale(8),
    },
    negotiationRatesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    originalRateText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: colors.gray,
        marginLeft: horizontalScale(8),
        textDecorationLine: 'line-through',
    },
    negotiatedRateText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: colors.gray,
        marginLeft: horizontalScale(12),
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    mapContainer: {
        width: '100%',
        height: verticalScale(180),
        borderRadius: horizontalScale(16),
        overflow: 'hidden',
        marginTop: verticalScale(12),
        borderWidth: 1,
        borderColor: colors.lightBorder,
    },
    mapImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    sectionTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
        color: colors.black,
        marginTop: verticalScale(24),
        marginBottom: verticalScale(12),
    },
    descriptionBox: {
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(16),
        minHeight: verticalScale(80),
    },
    descriptionText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.gray,
        lineHeight: fontSize(20),
    },
    certificationBox: {
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(16),
    },
    certText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.gray,
        marginBottom: verticalScale(8),
    },
    contractorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    contractorLabel: {
        fontSize: fontSize(15),
        fontFamily: Fonts.bold,
        color: colors.textDark,
    },
    countBox: {
        width: horizontalScale(48),
        height: verticalScale(36),
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.ABB5C5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(20),
        backgroundColor: colors.white,
    },
    footerButton: {
        flex: 1,
        height: verticalScale(56),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    disputeButton: {
        borderWidth: 1,
        borderColor: colors.primary,
        marginRight: horizontalScale(12),
    },
    disputeBtnText: {
        fontSize: fontSize(18),
        fontFamily: Fonts.medium,
        color: colors.primary,
    },
    clockInButton: {
        backgroundColor: colors.primary,
    },
    clockInBtnText: {
        color: colors.white,
        fontSize: fontSize(16),
        fontFamily: Fonts.bold,
    },
    // Map Styles
    blueDot: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        borderRadius: horizontalScale(10),
        backgroundColor: '#2563EB',
        borderWidth: 4,
        borderColor: colors.white,
    },
    redMarker: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        borderRadius: horizontalScale(12),
        backgroundColor: 'red',
    },
    locationCard: {
        position: 'absolute',
        top: verticalScale(15),
        right: horizontalScale(15),
        backgroundColor: colors.white,
        padding: horizontalScale(12),
        borderRadius: horizontalScale(12),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxWidth: '70%',
    },
    locationCardTitle: {
        fontFamily: Fonts.semiBold,
        fontSize: fontSize(14),
        color: colors.white,
    },
    locationCardSubtitle: {
        fontFamily: Fonts.regular,
        fontSize: fontSize(12),
        color: colors.gray,
        marginTop: verticalScale(2),
    },
    locationBtn: {
        position: 'absolute',
        bottom: verticalScale(15),
        right: horizontalScale(15),
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(20),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationBtnIcon: {
        fontSize: fontSize(20),
        color: colors.primary,
    },
    // Skeleton Styles
    skeletonBox: {
        backgroundColor: '#E0E0E0',
        borderRadius: horizontalScale(8),
    }
});
