import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(12),
        height: verticalScale(52),
    },
    searchIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        tintColor: colors.textSecondary,
    },
    searchInput: {
        flex: 1,
        marginLeft: horizontalScale(10),
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.black,
        paddingVertical: 0,
        width: '80%',
    },
    filterBtn: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
    },
    categoryWrapper: {
        marginTop: verticalScale(20),
        marginBottom: verticalScale(10),
        marginHorizontal: horizontalScale(20),
    },
    categoryScroll: {
        gap: horizontalScale(10),
    },
    categoryTab: {
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(8),
        borderRadius: horizontalScale(20),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    activeCategoryTab: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    categoryText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    activeCategoryText: {
        color: colors.primary,
    },
    jobList: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(40),
    },
    // Card styles moved here for local usage if needed, or imported
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(4),
    },
    jobTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        flex: 1,
        marginRight: horizontalScale(10),
    },
    companyName: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginBottom: verticalScale(8),
    },
    badge: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
    },
    openBadge: {
        backgroundColor: '#E1F9E2',
    },
    bookedBadge: {
        backgroundColor: '#E3F2FD',
    },
    badgeText: {
        fontSize: fontSize(12),
        fontFamily: fonts.semiBold,
    },
    openBadgeText: {
        color: colors.green,
    },
    bookedBadgeText: {
        color: colors.primary,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        marginRight: horizontalScale(4),
    },
    ratingText: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
        color: colors.black,
    },
    separator: {
        marginHorizontal: horizontalScale(8),
        color: colors.textSecondary,
    },
    distanceText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    infoGrid: {
        marginTop: verticalScale(4),
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    infoIcon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        marginRight: horizontalScale(8),
        tintColor: colors.textSecondary,
    },
    infoText: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        flex: 1,
    },
    loaderFooter: {
        paddingVertical: verticalScale(20),
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: verticalScale(100),
    },
    emptyIcon: {
        width: horizontalScale(120),
        height: horizontalScale(120),
        marginBottom: verticalScale(16),
        opacity: 0.5,
    },
    emptyText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
});

export default styles;
