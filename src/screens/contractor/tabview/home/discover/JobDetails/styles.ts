import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize, SCREEN_WIDTH } from '@styles/mixins';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    flex1: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(120),
    },
    detailsHeader: {
        marginBottom: verticalScale(24),
    },
    detailsTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    detailsTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.semiBold,
        color: colors.black,
        flex: 1,
    },
    detailsCompanyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsCompany: {
        fontSize: fontSize(16),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
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
        fontFamily: fonts.regular,
        color: colors.black,
    },
    badge: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
    },
    openBadge: {
        backgroundColor: '#E1F9E2',
    },
    openBadgeText: {
        color: colors.green,
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
    },
    infoIcon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        marginRight: horizontalScale(8),
        tintColor: colors.textSecondary,
    },
    infoText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: colors.gray,
        flex: 1,
    },
    negotiationRatesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    originalRateText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: colors.gray,
        marginLeft: horizontalScale(8),
        textDecorationLine: 'line-through',
    },
    negotiatedRateText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: colors.gray,
        marginLeft: horizontalScale(12),
    },
    sectionTitle: {
        fontSize: fontSize(18),
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
        fontFamily: fonts.light,
        color: colors.gray,
        lineHeight: fontSize(20),
    },
    certificationBox: {
        padding: horizontalScale(16),
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        marginBottom: verticalScale(28),
        gap: verticalScale(8),
    },
    certificationItem: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: colors.gray,
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
        fontFamily: fonts.regular,
        color: colors.gray,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(34),
        gap: horizontalScale(12),
       
    },
    proposeButton: {
        flex: 1,
        height: verticalScale(54),
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proposeButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    applyButton: {
        flex: 1,
        height: verticalScale(54),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.white,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: SCREEN_WIDTH - horizontalScale(40),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(24),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    modalTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    closeIconBtn: {
        padding: 4,
    },
    modalCloseIcon: {
        width: horizontalScale(30),
        height: horizontalScale(30),
        tintColor: colors.black,
    },
    inputLabel: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        marginBottom: verticalScale(8),
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(54),
        fontSize: fontSize(16),
        fontFamily: fonts.regular,
        color: colors.black,
        marginBottom: verticalScale(30),
    },
    submitButton: {
        backgroundColor: colors.primary,
        height: verticalScale(54),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.white,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    appliedMessageContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.lightGreen,
        borderColor: colors.successGreen,
        borderWidth: 1,
        borderRadius: horizontalScale(12),
        paddingVertical: verticalScale(12)
    },
    appliedMessageText: {
        color: colors.successGreen,
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        marginLeft: horizontalScale(8),
    },
    appliedIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        tintColor: colors.successGreen,
    },
    proposedMessageContainer: {
        backgroundColor: colors.pendingStatusBg,
        borderColor: colors.pending,
    },
    proposedMessageText: {
        color: colors.pending,
    },
    proposedIcon: {
        tintColor: colors.pending,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: horizontalScale(12),
        width: '100%',
    },
    ineligibleContainer: {
        backgroundColor: '#FFF1F0',
        borderColor: '#FFA39E',
        borderWidth: 1,
        borderRadius: horizontalScale(8),
        paddingVertical: verticalScale(8),
        paddingHorizontal: horizontalScale(12),
        marginBottom: verticalScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    ineligibleText: {
        color: colors.red,
        fontFamily: fonts.medium,
        fontSize: fontSize(13),
        textAlign: 'center',
    },
});

export default styles;
