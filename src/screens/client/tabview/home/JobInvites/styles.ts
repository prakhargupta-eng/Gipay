import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(20),
        marginBottom: verticalScale(16),
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
        width: horizontalScale(20),
        height: horizontalScale(20),
    },
    searchInput: {
        flex: 1,
        marginLeft: horizontalScale(12),
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: colors.black,
        padding: 0,
    },
    filterScroll: {
        marginTop: verticalScale(16),
    },
    filterScrollContent: {
        gap: horizontalScale(12),
        paddingRight: horizontalScale(20), // Ensure padding at the end of scroll
    },
    filterChip: {
        paddingHorizontal: horizontalScale(18),
        paddingVertical: verticalScale(10),
        borderRadius: horizontalScale(20),
        borderWidth: 1,
        borderColor: '#EAE6F0',
        backgroundColor: colors.white,
    },
    filterChipActive: {
        borderColor: colors.primary,
    },
    filterChipText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#9497A6',
    },
    filterChipTextActive: {
        color: colors.primary,
    },
    listContent: {
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(20),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
        },
    contractorName: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
    },
    hourlyRateText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#888888',
        marginTop: verticalScale(2),
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(12),
        fontFamily: fonts.semiBold,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: verticalScale(12),
    },
    jobInfo: {
        marginTop: verticalScale(2),
    },
    jobTitle: {
        fontSize: fontSize(15),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(8),
    },
    rateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        marginRight: horizontalScale(8),
    },
    detailText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(60),
    },
    emptyText: {
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
    },
});

export default styles;
