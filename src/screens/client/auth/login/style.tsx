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
        marginTop: verticalScale(70),
        paddingBottom: verticalScale(40),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    logo: {
        width: verticalScale(196),
        height: horizontalScale(40),
        resizeMode: 'contain',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
    },
    backIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    formCard: {
        marginTop: verticalScale(20),
    },
    title: {
        fontSize: verticalScale(28),
        fontFamily: fonts.bold,
        marginTop: verticalScale(40),
        color: colors.black,
        textAlign: 'left',
    },

    subtitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        marginTop: verticalScale(8),
        textAlign: 'left',
    },

    input: {
        marginTop: verticalScale(18),
    },

    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: verticalScale(12),
        marginBottom: verticalScale(35),
        height: 30,
        justifyContent: 'center',
    },

    forgot: {
        color: colors.primary,
        fontFamily: fonts.medium,
        fontSize: fontSize(13),
    },

    signup: {
        textAlign: 'center',
        marginTop: verticalScale(25),
        color: colors.gray,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
    },

    signupLink: {
        color: colors.primary,
        fontFamily: fonts.regular,
        fontSize: 14
    },

    errorText: {
        color: colors.red,
        fontSize: verticalScale(12),
        marginTop: verticalScale(6),
        marginLeft: horizontalScale(4),
    },

});

export default styles;
