import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: verticalScale(20),
    },
    body: {
        paddingHorizontal: horizontalScale(20),
    },
    sectionTitle: {
        fontSize: fontSize(22),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(10),
    },
    description: {
        fontSize: fontSize(15),
        fontFamily: fonts.regular,
        color: '#666',
        lineHeight: verticalScale(22),
        marginBottom: verticalScale(25),
    },
    instructionsCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: verticalScale(16),
        padding: horizontalScale(20),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    instructionsTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(15),
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    bulletNumber: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: horizontalScale(12),
    },
    bulletText: {
        color: colors.white,
        fontSize: fontSize(12),
        fontFamily: fonts.bold,
    },
    instructionText: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#4B5563',
    },
    infoBox: {
        backgroundColor: '#EFF6FF',
        borderRadius: verticalScale(10),
        padding: horizontalScale(12),
        marginTop: verticalScale(10),
    },
    infoText: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#1E40AF',
        textAlign: 'center',
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
    },
    lottieCheck: {
        width: horizontalScale(160),
        height: horizontalScale(160),
    },
    verifiedTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(10),
    },
    verifiedSubtitle: {
        fontSize: fontSize(15),
        fontFamily: fonts.regular,
        color: '#666',
        textAlign: 'center',
        lineHeight: verticalScale(22),
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: verticalScale(30),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.white,
        paddingTop: verticalScale(10),
    },
});

export default styles;
