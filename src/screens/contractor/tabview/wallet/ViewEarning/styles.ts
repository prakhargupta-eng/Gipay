// src/screens/contractor/tabview/wallet/ViewEarning/styles.ts

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
        marginTop: verticalScale(30),
        paddingHorizontal: horizontalScale(20),
    },
    earningsCardView: {
        borderRadius: horizontalScale(20),
        marginBottom: verticalScale(10),
    },
    earningsCard: {
        borderRadius: horizontalScale(20),
        padding: horizontalScale(20),
    },
    cardLabel: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: verticalScale(8),
    },
    cardValue: {
        fontSize: fontSize(36),
        fontFamily: fonts.bold,
        color: colors.white,
        height: verticalScale(50),
        textAlignVertical: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(15),
        paddingHorizontal: horizontalScale(15),
        marginTop: verticalScale(30),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: verticalScale(50),
        marginBottom: verticalScale(20),
    },
    searchIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        tintColor: '#9CA3AF',
        marginRight: horizontalScale(10),
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    filterBtn: {
        padding: horizontalScale(5),
    },
    filterIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        tintColor: '#9CA3AF',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: verticalScale(20),
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(8),
        borderRadius: horizontalScale(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.black,
        marginRight: horizontalScale(8),
    },
    dropdownIcon: {
        width: horizontalScale(12),
        height: horizontalScale(12),
        tintColor: '#9CA3AF',
    },
    listContent: {
        paddingBottom: verticalScale(30),
    },
    skeletonCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    skeletonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skeletonRowMb4: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(4),
    },
    skeletonRowMb10: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(10),
    },
    skeletonMb12: {
        marginBottom: verticalScale(12),
    },
    activeFilterIcon: {
        tintColor: colors.primary,
    },
    dropdownWrapper: {
        width: horizontalScale(130),
    },
    dropdownContainer: {
        height: verticalScale(40),
        paddingHorizontal: horizontalScale(12),
    },
    footerLoader: {
        paddingVertical: verticalScale(20),
        alignItems: 'center',
    },
});

export default styles;
