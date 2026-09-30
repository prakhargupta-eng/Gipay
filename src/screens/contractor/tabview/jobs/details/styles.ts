import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(120),
    },
    detailsHeader: {
        marginBottom: verticalScale(24),
    },
    strikethroughText: {
        textDecorationLine: 'line-through',
        color: '#B0B0B0',
    },
    detailsTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    detailsTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        flex: 1,
        marginRight: horizontalScale(10)
    },
    detailsCompanyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsCompany: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: colors.gray,
    },
    detailsRatingRow: {
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
    badge: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
    },
    badgeText: {
        fontSize: fontSize(12),
        fontFamily: fonts.semiBold,
    },
    detailsTagsContainer: {
        marginBottom: verticalScale(32),
        gap: verticalScale(12),
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: horizontalScale(20),
    },
    infoRowSplit: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        marginRight: horizontalScale(8),
        tintColor: colors.gray,
    },
        infoText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: colors.gray,
    },
    infoTextSplit: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: colors.gray,
        marginRight: horizontalScale(16),
    },
    sectionTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(12),
    },
    descriptionBox: {
        padding: horizontalScale(16),
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        marginBottom: verticalScale(28),
    },
    descriptionText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        lineHeight: fontSize(20),
    },
    certificationBox: {
        padding: horizontalScale(16),
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        marginBottom: verticalScale(28),
        gap: verticalScale(8),
        paddingVertical: verticalScale(16),
    },
    certificationItem: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    requiredContractorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(40),
    },
    countBox: {
        width: horizontalScale(50),
        height: horizontalScale(44),
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'column',
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(34),
        gap: verticalScale(12),
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: horizontalScale(12),
        width: '100%',
    },
    paymentButton: {
        flex: 1,
        height: verticalScale(54),
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    paymentButtonText: {
       fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.primary,
    },
    attendanceButton: {
        flex: 1,
        height: verticalScale(54),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    attendanceButtonText: {
       fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.white,
    },
    disputeButton: {
        width: '100%',
        height: verticalScale(54),
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.red || '#FF4D4F',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        padding: horizontalScale(16),
    },
    marginBottom16: {
        marginBottom: verticalScale(16),
    },
    marginBottom10: {
        marginBottom: verticalScale(10),
    },
    marginLeft8: {
        marginLeft: horizontalScale(8),
    },
    disabledOpacity: {
        opacity: 0.5,
    },
    headerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(7),
    },
    headerCircleBtn: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActionIcon: {
        width: horizontalScale(51),
        height: horizontalScale(51),
    },
});

export default styles;
