import { StyleSheet, Platform } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    headerContainer: {
        backgroundColor: colors.white,
        zIndex: 999,
        elevation: 10,
    },

    // ─── 1. Static Top Header ──────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(12),
        backgroundColor: colors.white,
        zIndex: 10,
    },
    backBtn: {
        width: horizontalScale(40),
        height: verticalScale(40),
        justifyContent: 'center',
    },
    backIcon: {
        width: horizontalScale(22),
        height: horizontalScale(22),
        tintColor: colors.black,
    },
    headerTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: colors.black,
        textAlign: 'center',
        flex: 1,
    },
    threeDotCircleBtn: {
        width: horizontalScale(38),
        height: horizontalScale(38),
        borderRadius: horizontalScale(19),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seperator: {
        height: 0.5,
        borderBottomColor: colors.black,
        borderBottomWidth: 0.5,
    },
    centerLoaderContainer: {
        flex: 1,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── 2. Keyboard Avoiding & Messages Area ───────────────────────
    chatBodyContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: colors.white,
    },
    messagesList: {
        flex: 1,
        backgroundColor: colors.white,
    },
    messagesContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(16),
        flexGrow: 1,
    },

    topLoaderContainer: {
        paddingVertical: verticalScale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Date Separator Pill
    dateBadgeContainer: {
        alignItems: 'center',
        marginVertical: verticalScale(14),
    },
    dateBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(14),
    },
    dateBadgeText: {
        fontSize: fontSize(12),
        fontFamily: fonts.medium,
        color: '#4B5563',
    },

    // Received Message
    receivedRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: verticalScale(16),
        maxWidth: '82%',
    },
    avatar: {
        width: horizontalScale(38),
        height: horizontalScale(38),
        borderRadius: horizontalScale(19),
        marginRight: horizontalScale(10),
        backgroundColor: '#E5E7EB',
    },
    receivedBubbleContainer: {
        alignItems: 'flex-start',
        flexShrink: 1,
    },
    receivedBubble: {
        backgroundColor: '#F3F4F6',
        borderRadius: horizontalScale(16),
        borderTopLeftRadius: horizontalScale(4),
        paddingHorizontal: horizontalScale(14),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(6),
        minWidth: horizontalScale(72),
    },
    receivedStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        marginTop: verticalScale(2),
        marginLeft: horizontalScale(8),
    },
    receivedText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#374151',
        lineHeight: fontSize(20),
    },
    receivedTimeText: {
        fontSize: fontSize(11),
        fontFamily: fonts.regular,
        color: '#9CA3AF',
    },
    receivedTime: {
        fontSize: fontSize(11),
        fontFamily: fonts.regular,
        color: '#9CA3AF',
        marginTop: verticalScale(4),
        marginLeft: horizontalScale(4),
    },

    // Sent Message
    sentRow: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
        marginBottom: verticalScale(16),
        maxWidth: '78%',
    },
    sentBubble: {
        backgroundColor: '#1E00A3',
        borderRadius: horizontalScale(16),
        borderBottomRightRadius: horizontalScale(4),
        paddingHorizontal: horizontalScale(14),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(6),
        minWidth: horizontalScale(84),
    },
    sentStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        marginTop: verticalScale(2),
        marginLeft: horizontalScale(8),
    },
    sentTimeText: {
        fontSize: fontSize(11),
        fontFamily: fonts.regular,
        color: 'rgba(255, 255, 255, 0.7)',
        marginRight: horizontalScale(4),
    },
    sentTickIcon: {
        width: horizontalScale(15),
        height: horizontalScale(11),
    },
    sentTickIconUnread: {
        tintColor: 'rgba(255, 255, 255, 0.7)',
    },
    sentTickIconRead: {
        tintColor: '#38BDF8',
    },
    sentText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.white,
        lineHeight: fontSize(20),
    },
    sentTime: {
        fontSize: fontSize(11),
        fontFamily: fonts.regular,
        color: '#9CA3AF',
        marginTop: verticalScale(4),
        marginRight: horizontalScale(4),
    },

    // ─── 3. Bottom Input Bar with Upward Shadow ───────────────────
    inputBarContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(10),
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 10,
        borderTopWidth: Platform.OS === 'android' ? 1 : 0,
        borderTopColor: '#F3F4F6',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    inputPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(24),
        paddingHorizontal: horizontalScale(16),
        minHeight: verticalScale(48),
        maxHeight: verticalScale(100),
        paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : verticalScale(4),
    },
    inputPillDisabled: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        opacity: 0.8,
    },
    textInput: {
        flex: 1,
        fontSize: fontSize(14),
        lineHeight: fontSize(20),
        fontFamily: fonts.regular,
        color: colors.black,
        paddingVertical: 0,
        minHeight: verticalScale(24),
        maxHeight: verticalScale(76),
    },
    textInputDisabled: {
        color: '#9CA3AF',
    },

    
    sendBtn: {
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        marginHorizontal: horizontalScale(-12),
        width: horizontalScale(80),
        height: horizontalScale(80),
        marginBottom: -verticalScale(30),
    },
    sendBtnDisabled: {
        opacity: 0.4,
    },
    sendIcon: {
        width: horizontalScale(80),
        height: horizontalScale(80),
    },
    charCountContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: horizontalScale(8),
        paddingBottom: verticalScale(4),
    },
    charCountText: {
        fontSize: fontSize(11),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
    },
    charCountLimit: {
        color: '#EF4444',
    },

    // ─── Read Only Banner ───────────────────────────────
    readOnlyBanner: {
        backgroundColor: '#FEF3C7',
        borderTopWidth: 1,
        borderTopColor: '#FDE68A',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    readOnlyText: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#92400E',
        textAlign: 'center',
    },

    // ─── Offline State ──────────────────────────────────
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(32),
        backgroundColor: colors.white,
    },
    offlineImage: {
        width: horizontalScale(180),
        height: horizontalScale(180),
        marginBottom: verticalScale(20),
    },
    offlineTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: colors.black,
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    offlineText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: fontSize(20),
    },
    offlineBanner: {
        backgroundColor: '#FEE2E2',
        borderTopColor: '#FECACA',
    },
    offlineBannerText: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#DC2626',
        textAlign: 'center',
    },

    // ─── Center Error & Retry State ─────────────────────
    centerErrorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(32),
        backgroundColor: colors.white,
    },
    centerErrorImage: {
        width: horizontalScale(160),
        height: horizontalScale(160),
        marginBottom: verticalScale(16),
    },
    centerErrorTitle: {
        fontSize: fontSize(17),
        fontFamily: fonts.semiBold,
        color: colors.black,
        textAlign: 'center',
        marginBottom: verticalScale(6),
    },
    centerErrorDesc: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: fontSize(19),
        marginBottom: verticalScale(20),
        maxWidth: horizontalScale(280),
    },
    centerRetryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: horizontalScale(32),
        paddingVertical: verticalScale(11),
        borderRadius: horizontalScale(10),
        minWidth: horizontalScale(130),
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerRetryButtonDisabled: {
        backgroundColor: '#E5E7EB',
        opacity: 0.7,
    },
    centerRetryButtonText: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
        color: colors.white,
    },
    centerRetryButtonTextDisabled: {
        color: '#9CA3AF',
    },
    centerOfflineHint: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: '#DC2626',
        marginTop: verticalScale(12),
        textAlign: 'center',
    },

    // ─── Empty Chat State ──────────────────────────────
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(32),
        paddingVertical: verticalScale(20),
    },
    emptyImage: {
        width: horizontalScale(220),
        height: horizontalScale(200),
    },
    emptyTitle: {
        fontSize: fontSize(22),
        fontFamily: fonts.bold,
        color: '#1E1B4B',
        textAlign: 'center',
        marginTop: verticalScale(24),
    },
    emptyDesc: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: verticalScale(10),
        lineHeight: fontSize(21),
        maxWidth: horizontalScale(270),
    },
});

export default styles;
