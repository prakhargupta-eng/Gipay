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
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(30),
    },
    contractorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    avatarWrapper: {
        width: horizontalScale(60),
        height: horizontalScale(60),
        borderRadius: horizontalScale(30),
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerInfo: {
        flex: 1,
        marginLeft: horizontalScale(16),
    },
    contractorName: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    hourlyRateText: {
        fontSize: fontSize(13),
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
        backgroundColor: '#E5E7EB',
        marginVertical: verticalScale(16),
    },
    titleSection: {
        marginBottom: verticalScale(20),
    },
    jobTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.semiBold,
        color: colors.black,
    },
    companyName: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#888888',
        marginTop: verticalScale(4),
    },
    detailsGrid: {
        marginBottom: verticalScale(24),
        gap: verticalScale(12),
    },
    rowLayout: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        marginRight: horizontalScale(12),
    },
    gridText: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#888888',
        flex: 1,
    },
    sectionContainer: {
        marginBottom: verticalScale(24),
    },
    sectionTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(12),
    },
    descBox: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(12),
        padding: horizontalScale(16),
    },
    descriptionText: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#888888',
        lineHeight: fontSize(20),
    },
    certBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(12),
        padding: horizontalScale(16),
        backgroundColor: colors.white,
        gap: verticalScale(10),
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: fontSize(14),
        color: '#888888',
        marginRight: horizontalScale(8),
    },
    certText: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#888888',
        flex: 1,
    },
    requiredContractorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(8),
    },
    requiredContractorTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
    },
    countBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(10),
        width: horizontalScale(44),
        height: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    countText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.gray,
    },
});

export default styles;

