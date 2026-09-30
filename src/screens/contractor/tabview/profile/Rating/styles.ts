import { StyleSheet, Dimensions } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    switchContainer: {
        marginTop: verticalScale(10),
        marginHorizontal: horizontalScale(20),
        alignItems: 'center',
    },
    toggleContainer: {
        marginVertical: 0,
    },
    toggleWrapper: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        width: horizontalScale(340),
        height: verticalScale(48),
        borderRadius: verticalScale(25),
    },
    toggleSlider: {
        backgroundColor: colors.primary,
        height: verticalScale(48),
        borderRadius: verticalScale(25),
        width: horizontalScale(170),
    },
    toggleText: {
        color: colors.primary,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
    },
    toggleActiveText: {
        color: colors.white,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
    },
    listContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(30),
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        marginBottom: verticalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.black,
        marginRight: horizontalScale(16),
    },
    jobText: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: '#9CA3AF',
        marginTop: 4,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
    },
    ratingText: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
        color: '#9CA3AF',
    },
    detailsRow: {
        flexDirection: 'row',
        marginTop: verticalScale(16),
        alignItems: 'center',
    },
    iconInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
        tintColor: '#9CA3AF',
    },
    detailText: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: '#6B7280',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: verticalScale(16),
        gap: horizontalScale(8),
    },
    tag: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
        borderWidth: 1,
        borderColor: colors.border,
    },
    tagText: {
        fontSize: fontSize(11),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: verticalScale(100),
    },
    emptyText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    footerLoader: {
        marginVertical: verticalScale(20),
        alignItems: 'center',
    },
});
