import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(40),
    },
    disputeCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(20),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: verticalScale(32),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    disputeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(16),
    },
    titleInfo: {
        flex: 1,
    },
    disputeLabel: {
        fontSize: fontSize(15),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(4),
    },
    disputeTitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    statusBadge: {
        backgroundColor: colors.badgeGreen,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(12),
        fontFamily: fonts.semiBold,
        color: colors.badgeGreenText,
    },
    section: {
        marginBottom: verticalScale(16),
         marginTop: verticalScale(8),
    },
    disputeDesc: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    hyperlinkText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    attachmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(10),
        borderRadius: horizontalScale(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: verticalScale(8),
    },
    attachmentIcon: {
        width: horizontalScale(18),
        height: horizontalScale(18),
        marginRight: horizontalScale(8),
        tintColor: colors.primary,
    },
    attachmentText: {
        fontSize: fontSize(14),
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    // Job Info Styles
    jobTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginTop: verticalScale(8),
    },
    company: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: colors.statusGrayText,
        marginTop: verticalScale(4),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
        marginBottom: verticalScale(20),
    },
    starIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        marginRight: horizontalScale(6),
    },
    ratingText: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.textSecondary,
    },
    tagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        marginRight: horizontalScale(12),
    },
    tagIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        marginRight: horizontalScale(10),
        tintColor: '#9CA3AF',
    },
    tagText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#9CA3AF',
    },
    // Details Groups
    detailsGroup: {
        marginTop: verticalScale(24),
    },
    groupTitle: {
        fontSize: fontSize(17),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(12),
    },
    descBox: {
        padding: horizontalScale(20),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    descText: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: colors.statusGrayText,
        lineHeight: 22,
    },
    certBox: {
        padding: horizontalScale(20),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    certItem: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: colors.statusGrayText,
        marginBottom: verticalScale(8),
    },
    contractorSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(24),
    },
    countBox: {
        width: horizontalScale(50),
        height: verticalScale(40),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(10),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: fontSize(14),
        fontFamily: fonts.bold,
        color: colors.textSecondary,
    }
});

export default styles;
