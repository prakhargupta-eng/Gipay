import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(30),
        paddingBottom: verticalScale(40),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(40),
        width: '100%',
    },
    backButton: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
    },
    backIcon: {
        width: horizontalScale(30),
        height: horizontalScale(30),
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: fontSize(20),
        fontFamily: Fonts.bold,
        color: colors.black,
    },
    formCard: {
        marginTop: verticalScale(60),
    },
    input: {
        marginBottom: verticalScale(10),
    },
    buttonContainer: {
        marginTop: verticalScale(30),
    }
});

export default styles;
