import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize, SCREEN_WIDTH } from '@styles/mixins';
import Fonts from '@assets/Fonts';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(15),
        marginTop: verticalScale(10),
    },
    backButton: {
        position: 'absolute',
        left: horizontalScale(20),
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
    },
    backIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: fontSize(20),
        fontFamily: Fonts.bold,
        color: colors.textDark,
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightBorder,
        borderRadius: horizontalScale(12),
        marginHorizontal: horizontalScale(20),
        paddingHorizontal: horizontalScale(15),
        height: verticalScale(56),
        marginTop: verticalScale(20),
    },
    searchIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        resizeMode: 'contain',
        tintColor: colors.textSecondary,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.textDark,
        paddingHorizontal: horizontalScale(10),
    },
    filterIcon: {
        width: horizontalScale(24),
    height: horizontalScale(24),
        resizeMode: 'contain',
        tintColor: colors.textSecondary,
    },
     categoryWrapper: {
        marginTop: verticalScale(0),
        marginBottom: verticalScale(10),
    },
    filterPillsScroll: {
        flexGrow: 1,
        paddingHorizontal: horizontalScale(20),
        marginVertical: verticalScale(20),
    },
    pill: {
        paddingHorizontal: horizontalScale(15),
        height: verticalScale(36),
        borderRadius: horizontalScale(10),
        borderWidth: 1,
        borderColor: colors.lightBorder,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(10),
    },
    activePill: {
        backgroundColor: colors.white,
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    pillText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.textSecondary,
    },
    activePillText: {
        color: colors.primary,
        fontFamily: Fonts.medium,
    },
    listContent: {
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(20),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        borderWidth: 1,
        borderColor: colors.lightBorder,
        marginBottom: verticalScale(20),
        overflow: 'hidden',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        // Elevation for Android
        elevation: 5,
    },
    cardContent: {
        padding: horizontalScale(20),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    jobTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
        color: colors.textDark,
        flex: 1,
        marginRight: horizontalScale(10),
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
    },
    companyName: {
        fontSize: fontSize(14),
        fontFamily: Fonts.light,
        color: '#9E9E9E', // Lighter gray as per image
        marginTop: verticalScale(2),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(12),
    },
    starIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        resizeMode: 'contain',
    },
    ratingText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: '#9E9E9E',
        marginLeft: horizontalScale(6),
    },
    infoGrid: {
        marginTop: verticalScale(16),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: horizontalScale(24),
    },
    infoIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        resizeMode: 'contain',
        tintColor: '#9E9E9E',
    },
    infoText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: '#9E9E9E',
        marginLeft: horizontalScale(10),
    },
    rateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    negotiateText: {
        fontSize: fontSize(12),
        fontFamily: Fonts.light,
        color: '#9E9E9E',
        marginLeft: horizontalScale(12),
    },
    cardFooter: {
        flexDirection: 'row',
        paddingVertical: verticalScale(16),
    },
    footerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    declineButton: {
        // Custom dashed line used in component instead
    },
    acceptButton: {
        // No right border
    },
    buttonIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        resizeMode: 'contain',
    },
    acceptedDeclineIcon: {
        width: horizontalScale(22),
        height: horizontalScale(22),
        resizeMode: 'contain',
    },
    buttonText: {
        fontSize: fontSize(13),
        fontFamily: Fonts.regular,
        marginLeft: horizontalScale(12),
    },
    declineText: {
        color: '#F44336',
    },
    acceptText: {
        color: '#4CAF50',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: verticalScale(60),
    },
    emptyIcon: {
        width: horizontalScale(80),
        height: horizontalScale(80),
        resizeMode: 'contain',
        tintColor: '#E0E0E0',
        marginBottom: verticalScale(16),
    },
    emptyText: {
        fontSize: fontSize(16),
        fontFamily: Fonts.medium,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Skeleton Styles
    skeletonCard: {
        backgroundColor: colors.white,
        width: '100%',
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.lightBorder,
    },
    skeletonCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    skeletonCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(12),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: colors.lightBorder,
    },
});
