import { StyleSheet, Platform } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(16),
    },
    searchContainer: {
        marginBottom: verticalScale(16),
    },
    searchBarContainer: {
        height: horizontalScale(56),
        borderRadius: horizontalScale(24),
        borderColor: colors.statBorder,
        backgroundColor: colors.white,
    },
    searchIconInside: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        tintColor: colors.gray,
        marginRight: horizontalScale(10),
    },
    filterSection: {
        marginBottom: verticalScale(20),
          marginTop: verticalScale(70),
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    datePickerWrapper: {
        flex: 1,
    },
    dateLabelTop: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.black,
        marginBottom: verticalScale(8),
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.statBorder,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(12),
        height: horizontalScale(48),
    },
    dateText: {
        fontSize: fontSize(13),
        fontFamily: Fonts.regular,
        color: colors.black,
    },
    calendarIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        tintColor: colors.gray,
    },
    listContent: {
        paddingBottom: verticalScale(20),
    },
    draftCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.statBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(4),
    },
    savedOnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
    },
    savedOnIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        tintColor: colors.gray,
    },
    dateLabel: {
        fontSize: fontSize(12),
        fontFamily: Fonts.regular,
        color: colors.gray,
    },
    deleteButton: {
        padding: horizontalScale(5),
    },
    trashIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        resizeMode: 'contain',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: verticalScale(50),
    },
    emptyText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: '#9CA3AF',
    }
});

export default styles;
