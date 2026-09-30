import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
    },
    switcherWrapper: {
        marginTop: verticalScale(16),
        alignItems: 'center',
        paddingHorizontal: horizontalScale(40),
    },
    toggleContainer: {
        marginVertical: 0,
    },
    toggleWrapper: {
        width: '100%',
        height: verticalScale(48),
        borderRadius: horizontalScale(30),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    toggleSlider: {
        width: '50%',
        height: verticalScale(48),
        borderRadius: horizontalScale(30),
        backgroundColor: colors.primary,
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
    searchContainer: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(20),
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        width: horizontalScale(24),
    height: horizontalScale(24),
    },
    searchInput: {
        flex: 1,
        marginLeft: horizontalScale(12),
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    filterBtn: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: horizontalScale(8),
    },
    categoryWrapper: {
        marginTop: verticalScale(20),
        marginBottom: verticalScale(8),
    },
    categoryScroll: {
        paddingHorizontal: horizontalScale(20),
    },
    categoryTab: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(5),
        borderRadius: horizontalScale(25),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: horizontalScale(12),
    },
    activeCategoryTab: {
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    categoryText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#888888',
    },
    activeCategoryText: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
    },
    listContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(40),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: verticalScale(100),
    },
    emptyIcon: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        marginBottom: verticalScale(16),
        opacity: 0.5,
    },
    emptyText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
    },
    footerButton: {
        padding: horizontalScale(20),
        backgroundColor: colors.white,
    }
});

export default styles;
