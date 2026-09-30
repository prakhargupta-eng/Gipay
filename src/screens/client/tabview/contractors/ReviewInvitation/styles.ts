import { StyleSheet } from 'react-native';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';

const styles = StyleSheet.create({
    // ─── Screen ───────────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    content: {
        padding: horizontalScale(20),
        paddingBottom: verticalScale(40),
    },

    summaryWrapper: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: horizontalScale(16),
        backgroundColor: '#FFFFFF',
    },

    // ─── Job Card ─────────────────────────────────────────────
    jobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: horizontalScale(14),
        backgroundColor: '#FFF',
        marginTop: verticalScale(4),
    },

    imageWrapper: {
        width: verticalScale(60),
        height: verticalScale(60),
        borderRadius: verticalScale(30),
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(14),
    },

    jobImage: {
        width: verticalScale(40),
        height: verticalScale(40),
    },

    jobInfo: {
        flex: 1,
        justifyContent: 'center',
    },

    jobTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: '#111827',
    },

    jobSubTitle: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#6B7280',
        marginTop: verticalScale(2),
    },

    location: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#6B7280',
        marginTop: verticalScale(4),
    },

    date: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#6B7280',
        marginTop: verticalScale(4),
    },

    // ─── Section Title ────────────────────────────────────────
    sectionTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.medium,
        color: '#111827',
        marginTop: verticalScale(28),
        marginBottom: verticalScale(16),
    },

    // ─── Summary Cards ────────────────────────────────────────
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: verticalScale(16),
        padding: horizontalScale(16),
        marginBottom: verticalScale(12),
    },

    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: horizontalScale(10),
    },

    iconCircle: {
        width: verticalScale(42),
        height: verticalScale(42),
        borderRadius: verticalScale(21),
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(12),
    },

    icon: {
        width: verticalScale(24),
        height: verticalScale(24),
        tintColor: colors.primary
    },

    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    cardTitle: {
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
        color: '#111827',
    },

    cardDescription: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#6B7280',
        marginTop: verticalScale(4),
    },

    countText: {
        fontSize: fontSize(22),
        fontFamily: fonts.semiBold,
    },

    // ─── Total ────────────────────────────────────────────────
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(20),
        marginBottom: verticalScale(24),
    },

    totalLabel: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: '#111827',
    },

    totalValue: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: '#111827',
    },

    // ─── Note ─────────────────────────────────────────────────
    noteContainer: {
        backgroundColor: '#EEF2FF',
        borderRadius: verticalScale(10),
        padding: horizontalScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },

    noteIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        marginRight: horizontalScale(12),
        tintColor: '#4338CA',
    },

    noteText: {
        flex: 1,
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#4B5563',
        lineHeight: fontSize(18),
    },

    noteBold: {
        fontFamily: fonts.bold,
        color: '#4338CA',
    },

    // ─── Bottom Button ────────────────────────────────────────
    buttonContainer: {
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(20),
        backgroundColor: '#FFF',
    },

    // ─── Modal ────────────────────────────────────────────────
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(24),
    },

    modalContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: verticalScale(20),
        paddingHorizontal: horizontalScale(24),
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(20),
        alignItems: 'center',
    },

    lottieWrapper: {
        marginBottom: verticalScale(16),
    },

    lottieSize: {
        width: verticalScale(100),
        height: verticalScale(100),
    },

    modalTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: '#111827',
        marginBottom: verticalScale(6),
    },

    modalDescription: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: '90%',
    },

    modalJobName: {
        fontSize: fontSize(15),
        fontFamily: fonts.semiBold,
        color: colors.gray,
        marginTop: verticalScale(4),
        marginBottom: verticalScale(16),
        textAlign: 'center',
    },

    // Modal summary rows
    summaryBox: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: verticalScale(12),
        padding: horizontalScale(14),
        marginBottom: verticalScale(20),
        gap: verticalScale(10),
    },

    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(10),
    },

    summaryIconCircle: {
        width: verticalScale(32),
        height: verticalScale(32),
        borderRadius: verticalScale(16),
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    summaryIcon: {
        width: verticalScale(16),
        height: verticalScale(16),
    },

    summaryText: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#374151',
    },

    // ─── Button Row ───────────────────────────────────────────
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        marginTop: verticalScale(12),
    },

    cancelButton: {
        flex: 1,
        paddingVertical: verticalScale(13),
        borderRadius: verticalScale(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        marginRight: horizontalScale(6),
    },

    cancelText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#374151',
    },

    sendButton: {
        flex: 1,
        paddingVertical: verticalScale(13),
        borderRadius: verticalScale(10),
        backgroundColor: '#4F46E5',
        alignItems: 'center',
        marginLeft: horizontalScale(6),
    },

    sendText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#FFFFFF',
    },

    // ─── Status Cards ─────────────────────────────────────────
    statusCard: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: verticalScale(12),
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(10),
    },

    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },

    statusLabel: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
    },

    statusCount: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
    },

    // ─── Done Button ──────────────────────────────────────────
    doneButton: {
        width: '70%',
        paddingVertical: verticalScale(13),
        borderRadius: verticalScale(10),
        backgroundColor: '#4F46E5',
        alignItems: 'center',
        marginTop: verticalScale(8),
    },

    doneText: {
        fontSize: fontSize(15),
        fontFamily: fonts.semiBold,
        color: '#FFFFFF',
    },

    successImage: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        marginBottom: verticalScale(12),
    },

    summaryImage: {
        width: '60%',
        height: '60%',
        resizeMode: 'contain',
    },
    closeImage: {
        width: '40%',
        height: '40%',
        marginRight: verticalScale(10),
        marginTop: verticalScale(12),
    },
    closeButton: {
        position: 'absolute',
        top: verticalScale(12),
        right: horizontalScale(12),
    },  

    // ─── Bottom Sheet ─────────────────────────────────────────
    bottomSheetOverlay: {
        justifyContent: 'flex-end',
        paddingHorizontal: 0,
    },
    bottomSheetContainer: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingHorizontal: 0,
        height: '80%',
    },
    bottomSheetHeader: {
        width: '100%',
        paddingHorizontal: horizontalScale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    closeButtonSmall: {
        padding: horizontalScale(4),
    },
    closeIconSmall: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        tintColor: '#6B7280',
    },
    bottomSheetScroll: {
        width: '100%',
        paddingHorizontal: horizontalScale(24),
    },
    bottomSheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    bottomSheetAvatar: {
        width: verticalScale(44),
        height: verticalScale(44),
        borderRadius: verticalScale(22),
        marginRight: horizontalScale(12),
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    bottomSheetItemInfo: {
        flex: 1,
    },
    bottomSheetItemName: {
        fontSize: fontSize(15),
        color: '#111827',
        fontFamily: fonts.medium,
    },
    bottomSheetItemCategory: {
        fontSize: fontSize(13),
        color: '#6B7280',
        marginTop: verticalScale(2),
        fontFamily: fonts.light,
    },
    bottomSheetSpacer: {
        height: verticalScale(20),
    },
});

export default styles;