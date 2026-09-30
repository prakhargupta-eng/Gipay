import { StyleSheet } from 'react-native';
import Colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(40),
        marginBottom: verticalScale(20),
    },
    backButton: {
        padding: horizontalScale(5),
    },
    backIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        resizeMode: 'contain',
        tintColor: Colors.black,
    },
    headerTitle: {
        fontFamily: fonts.regular,
        fontSize: fontSize(18),
        color: Colors.black,
        marginLeft: horizontalScale(15),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginHorizontal: horizontalScale(20),
        borderRadius: horizontalScale(24),
        paddingHorizontal: horizontalScale(15),
        height: verticalScale(45),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: verticalScale(30),
        marginTop: verticalScale(30),
    },
    searchIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        tintColor: '#94A3B8',
        marginRight: horizontalScale(10),
    },
    searchInput: {
        flex: 1,
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: Colors.black,
    },
    listContent: {
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(20),
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(15),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardSelected: {
        borderColor: '#0EA5E9',
        borderWidth: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameText: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(15),
        color: Colors.black,
    },
    roleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(4),
        marginBottom: verticalScale(12),
    },
    roleText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: '#64748B',
    },
    rateText: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(13),
        color: Colors.black,
    },
    badgeContainer: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(4),
    },
    badgeText: {
        fontFamily: fonts.medium,
        fontSize: fontSize(11),
        color: '#16A34A',
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: horizontalScale(15),
    },
    iconSmall: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        tintColor: '#64748B',
        marginRight: horizontalScale(6),
    },
    dateText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(11),
        color: '#64748B',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: horizontalScale(6),
        paddingVertical: verticalScale(6),
        paddingHorizontal: horizontalScale(12),
        marginRight: horizontalScale(10),
    },
    actionBtnIcon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        tintColor: Colors.primary,
        marginRight: horizontalScale(6),
    },
    actionBtnText: {
        fontFamily: fonts.medium,
        fontSize: fontSize(12),
        color: Colors.primary,
    },
});
