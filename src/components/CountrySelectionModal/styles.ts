import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.white,
        height: '60%',
        borderTopLeftRadius: horizontalScale(20),
        borderTopRightRadius: horizontalScale(20),
        padding: horizontalScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    title: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    closeText: {
        color: colors.black,
        fontFamily: fonts.medium,
        fontSize: fontSize(16),
    },
    loader: {
        marginTop: verticalScale(50),
    },
    list: {
        paddingBottom: verticalScale(20),
    },
});

export default styles;
