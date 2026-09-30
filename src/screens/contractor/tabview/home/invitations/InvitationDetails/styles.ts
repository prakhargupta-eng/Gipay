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
        paddingBottom: verticalScale(40),
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(20),
    },
    companyLogo: {
        width: horizontalScale(80),
        height: horizontalScale(80),
        borderRadius: horizontalScale(40),
        borderWidth: 2,
        borderColor: colors.primary,
        padding: 2,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: horizontalScale(40),
        backgroundColor: colors.lightGray,
    },
    headerTextContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    jobTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
        color: colors.textDark,
        flex: 1,
    },
    statusBadge: {
        backgroundColor: colors.statusOpenBg,
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.statusOpen,
    },
    companyName: {
        fontSize: fontSize(14),
        fontFamily: Fonts.light,
        color: '#9E9E9E',
        marginTop: verticalScale(2),
    },
    companyRatingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
    },
    starIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
        tintColor: colors.starYellow,
    },
    ratingText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.light,
        color: '#9E9E9E',
        marginLeft: horizontalScale(4),
        marginRight: horizontalScale(8),
    },
    detailsGrid: {
        marginTop: verticalScale(24),
        paddingBottom: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightBorder,
    },
    rateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    detailIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        resizeMode: 'contain',
        tintColor: '#9E9E9E',
    },
    detailText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: '#9E9E9E',
        marginLeft: horizontalScale(8),
    },
    negotiateRateText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: colors.gray,
        marginLeft: horizontalScale(8),
    },
    strikethroughJobRateText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    proposeLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proposeText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.primary,
    },
    chevronIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        resizeMode: 'contain',
        tintColor: colors.primary,
        marginLeft: horizontalScale(1),
        transform: [{ rotate: '-90deg' }],
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
        color: colors.textDark,
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
        fontFamily: Fonts.light,
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
        fontFamily: Fonts.light,
        color: colors.gray,
        marginBottom: verticalScale(8),
    },
    contractorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    contractorRowBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(32),
    },
    contractorLabel: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
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
        fontFamily: Fonts.light,
        color: colors.gray,
    },
    footer: {
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
    declineButton: {
        borderWidth: 1,
        borderColor: colors.red,
        marginRight: horizontalScale(12),
    },
    declineBtnText: {
        fontSize: fontSize(18),
        fontFamily: Fonts.medium,
        color: colors.red,
    },
    acceptButton: {
        borderWidth: 1,
        borderColor: colors.statusOpen,
    },
    acceptBtnText: {
        fontSize: fontSize(16),
        fontFamily: Fonts.bold,
        color: colors.statusOpen,
    },
    // Skeleton Styles
    skeletonContainer: {
        flex: 1,
        backgroundColor: colors.white,
        padding: horizontalScale(20),
    },
    skeletonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    skeletonHeaderText: {
        marginLeft: horizontalScale(15),
        flex: 1,
    },
    skeletonSpacing: {
        marginBottom: verticalScale(24),
    },
    skeletonSmallSpacing: {
        marginBottom: verticalScale(12),
    },
    skeletonLineSpacing: {
        marginBottom: verticalScale(8),
    },
});
