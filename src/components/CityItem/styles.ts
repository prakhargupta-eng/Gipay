import { StyleSheet } from 'react-native';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';

const styles = StyleSheet.create({
    cityItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(16),
        paddingHorizontal: horizontalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cityIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        marginRight: horizontalScale(12),
        tintColor: colors.gray,
    },
    cityLabel: {
        fontSize: fontSize(15),
        fontFamily: fonts.regular,
        color: colors.black,
    },
    selectedLabel: {
        fontFamily: fonts.medium,
        color: colors.primary,
    },
    checkIcon: {
        width: horizontalScale(25),
        height: horizontalScale(25),
        tintColor: colors.primary,
    },
});

export default styles;
