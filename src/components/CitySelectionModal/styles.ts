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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(48),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        tintColor: '#9CA3AF',
        marginRight: horizontalScale(12),
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.black,
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
