// src/screens/contractor/tabview/wallet/TransactionHistory/styles.ts

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
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        paddingHorizontal: horizontalScale(15),
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
    listContent: {
        paddingBottom: verticalScale(30),
    },
    skeletonCardView: {

        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    skeletonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skeletonRowSpaced: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    skeletonHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default styles;
