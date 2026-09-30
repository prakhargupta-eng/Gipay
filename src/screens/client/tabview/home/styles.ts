import { StyleSheet } from "react-native";
import { horizontalScale, verticalScale, fontSize } from "@styles/mixins";
import colors from "@styles/colors";
import Fonts from "@assets/Fonts";


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: verticalScale(20),
    },
    headerGradient: {
        paddingTop: verticalScale(50),
        paddingBottom: verticalScale(20),
        height: verticalScale(270),
    },
    headerGradientImage: {

        height: verticalScale(270),
        position: 'absolute',
        resizeMode: 'stretch',
        width: '100%'
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),

    },
    logo: {
        width: horizontalScale(50),
        height: horizontalScale(25),
        marginRight: horizontalScale(12),
        tintColor: colors.white,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerLogo: {
        width: horizontalScale(40),
        height: verticalScale(40),
    },
    headerGreeting: {
        fontSize: fontSize(16),
        fontFamily: Fonts.regular,
        color: colors.white,
    },
    quickaction: {
        borderColor: colors.E8E8E8,
        borderWidth: 1,
        marginTop: verticalScale(20),
        paddingVertical: horizontalScale(20),
        borderRadius: verticalScale(16),
    },
    quickActionText: {
        paddingLeft: horizontalScale(20),

    },
    headerName: {
        fontSize: fontSize(20),
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    notificationButton: {
        width: horizontalScale(40),
        height: verticalScale(40),
        borderRadius: verticalScale(20),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIcon: {
        width: horizontalScale(20),
        height: verticalScale(20),
    },
    escrowCard: {
        marginHorizontal: horizontalScale(20),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(20),
        padding: horizontalScale(20),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: verticalScale(23),

    },
    escrowLabel: {
        fontSize: fontSize(14),
        fontFamily: Fonts.regular,
        color: colors.white,
    },
    escrowAmount: {
        fontSize: fontSize(32),
        fontFamily: Fonts.bold,
        color: colors.white,
        marginTop: verticalScale(4),
    },
    statsSection: {
        paddingHorizontal: horizontalScale(20),
        columnGap: verticalScale(15)
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(15),
    },
    quickActionsSection: {
        paddingHorizontal: horizontalScale(20),
        borderRadius: verticalScale(16),

    },
    quickActionsSectionGradient: {
        borderRadius: verticalScale(16),
        backgroundColor: colors.white,
    },
    quickActionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    quickActionsTitle: {
        fontSize: fontSize(18),
        fontFamily: Fonts.bold,
        color: colors.black,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    seeAllText: {
        fontSize: fontSize(14),
        fontFamily: Fonts.medium,
        color: colors.primary,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    recentPaymentsSection: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(20),
    },
    recentPaymentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    recentPaymentsTitle: {
        fontSize: fontSize(18),
        fontFamily: Fonts.bold,
        color: colors.black,
    },
    recentPaymentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    paymentItemWrapper: {
        paddingHorizontal: horizontalScale(0), // Handled by section padding usually, but consistent with previous
    },
    bottomSpacer: {
        height: verticalScale(100),
    },
    whiteBackground: {
        marginTop: verticalScale(25),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: verticalScale(20),
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default styles;