import { StyleSheet, Dimensions } from 'react-native';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';
import { fontSize, verticalScale, horizontalScale } from '@styles/mixins';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundScrollView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    page: {
        width: width,
        height: '100%',
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    contentContainer: {
        paddingHorizontal: horizontalScale(30),
        alignItems: 'center',
        paddingBottom: verticalScale(40),
    },
    titleCarouselContainer: {
        width: width,
        overflow: 'hidden',
        marginBottom: verticalScale(15),
    },
    titleRow: {
        flexDirection: 'row',
        width: width * 2,
    },
    titleWrapper: {
        width: width,
        paddingHorizontal: horizontalScale(25),
        alignItems: 'center',
    },
    headline: {
        color: colors.white,
        fontSize: fontSize(30),
        fontFamily: fonts.medium,
        textAlign: 'center',
        lineHeight: verticalScale(42),
    },
    button: {
        marginTop: verticalScale(5),
        width: '100%',
    },
    buttonContainer: {
        width: '100%',
    },
    gradientButton: {
        height: verticalScale(55),
        borderRadius: verticalScale(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: fontSize(18),
        fontFamily: fonts.medium,
    },
    footer: {
        flexDirection: 'row',
        marginTop: verticalScale(15),
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: fontSize(15),
        fontFamily: fonts.medium,
    },
    loginText: {
        color: colors.white,
        fontSize: fontSize(15),
        fontFamily: fonts.bold,
        textDecorationLine: 'underline',
        marginLeft: horizontalScale(5),
    },
});

export default styles;
