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
        borderRadius: horizontalScale(24),
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
        padding: 0,
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
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(10),
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
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: horizontalScale(20),
    },
    modalContainer: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(20),
        alignItems: 'center',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: verticalScale(10),
    },
    modalTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        flex: 1,
        marginRight: horizontalScale(10),
    },
    closeBtn: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
        backgroundColor: '#F3F4F6',
    },
    closeText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#4B5563',
    },
    imageWrapper: {
        width: '100%',
        height: verticalScale(300),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    viewerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    loader: {
        position: 'absolute',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: horizontalScale(20),
    },
    errorText: {
        fontSize: fontSize(15),
        fontFamily: fonts.semiBold,
        color: '#DC2626',
        marginTop: verticalScale(10),
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#9CA3AF',
        marginTop: verticalScale(4),
        textAlign: 'center',
    },
});

export default styles;
