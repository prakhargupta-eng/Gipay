import { StyleSheet } from 'react-native';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10), // Reduced to make room for back button
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(50),
        width: '100%',
        minHeight: verticalScale(40),
    },
    backButton: {
        position: 'absolute',
        left: 0,
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    backIcon: {
        width: horizontalScale(30),
        height: horizontalScale(30),
        resizeMode: 'contain',
    },
    logo: {
        width: verticalScale(196),
        height: horizontalScale(40),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    title: {
        fontSize: verticalScale(28),
        fontFamily: fonts.bold,
        marginTop: verticalScale(34),
        color: colors.black,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        marginTop: verticalScale(8),
        textAlign: 'left',
        lineHeight: 20,
    },
    emailText: {
        color: colors.black,
        fontFamily: fonts.medium,
        marginTop: verticalScale(4),
    },
    otpContainer: {
        marginTop: verticalScale(40),
        alignItems: 'center',
    },
    otpInputContainer: {
        width: horizontalScale(50 * 6 + 10 * 5), // 6 boxes + 5 gaps
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    otpPinCodeContainer: {
        width: horizontalScale(50),
        height: horizontalScale(58),
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: horizontalScale(5), // ✅ use this instead of gap
    },
    otpPinCodeFocused: {
        width: horizontalScale(50),
        height: horizontalScale(58),
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpPinCodeText: {
        fontSize: fontSize(20),
        fontFamily: fonts.semiBold,
        color: colors.black,
        textAlign: 'center',
    },
    timerText: {
        marginTop: verticalScale(30),
        alignSelf: 'center',
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
    },
    timerCount: {
        color: colors.red,
        fontFamily: fonts.semiBold,
        fontSize: fontSize(14),
    },
    bottomContainer: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(40),
        paddingTop: verticalScale(10),
        alignItems: 'center',
    },
    buttonWrapper: {
        width: '100%',
    },
    resendText: {
        marginTop: verticalScale(20),
        fontSize: fontSize(13),
        color: colors.gray,
        fontFamily: fonts.regular,
    },
    resendLink: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
    },
});

export default styles;
