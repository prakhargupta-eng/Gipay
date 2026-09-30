import { StyleSheet, Platform } from 'react-native';
import {
    verticalScale,
    horizontalScale,
    fontSize,
} from '@styles/mixins';

import fonts from '@assets/Fonts';
import colors from '@styles/colors';

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },

    scrollContainer: {
        flexGrow: 1,
        paddingBottom: verticalScale(40),
    },

    container: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(70),
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

    title: {
        fontSize: verticalScale(24),
        fontFamily: fonts.bold,
        marginTop: verticalScale(34),
        color: colors.black,
    },

    subtitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(18),
    },

    formFields: {
        width: '100%',
    },

    inputWrapper: {
        marginTop: verticalScale(14),
    },

    bottomContainer: {
        left: 0,
        right: 0,

        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),

        paddingBottom:
            Platform.OS === 'ios'
                ? verticalScale(25)
                : verticalScale(20),

        backgroundColor: '#fff',
    },

    buttonWrapper: {
        marginTop: verticalScale(5),
    },

    loginOption: {
        textAlign: 'center',
        marginTop: verticalScale(18),
        color: colors.gray,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
    },

    loginLink: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
    },

    errorText: {
        color: colors.red,
        fontSize: verticalScale(12),
        marginTop: verticalScale(6),
        marginLeft: horizontalScale(4),
    },

    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(20),
    },

    term: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 4,
        marginRight: horizontalScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(3),
    },

    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontFamily: fonts.bold,
    },

    termsText: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        lineHeight: verticalScale(20),
    },

    termsLink: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
    },

    termsError: {
        marginLeft: horizontalScale(30),
    },
});

export default styles;