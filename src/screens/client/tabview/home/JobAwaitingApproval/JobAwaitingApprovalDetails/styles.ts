import { StyleSheet } from 'react-native';
import Colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';

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
        flex: 1,
        textAlign: 'center',
        fontFamily: fonts.regular,
        fontSize: fontSize(18),
        color: Colors.black,
        marginRight: horizontalScale(25),
    },
    content: {
        flex: 1,
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(20),
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    avatar: {
        width: horizontalScale(50),
        height: horizontalScale(50),
        borderRadius: horizontalScale(25),
        marginRight: horizontalScale(15),
    },
    nameText: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(16),
        color: Colors.black,
    },
    rateText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: '#64748B',
        marginTop: verticalScale(2),
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: verticalScale(20),
    },
    sectionTitle: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(16),
        color: Colors.black,
        marginBottom: verticalScale(12),
    },
    jobInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    jobInfoRowSpaced: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        marginLeft: horizontalScale(15),
    },
    iconSmall: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        tintColor: Colors.gray,
        marginRight: horizontalScale(8),
    },
    infoText: {
        fontFamily: fonts.light,
        fontSize: fontSize(12),
        color: colors.gray,
    },
    infoTextWithMargin: {
        fontFamily: fonts.light,
        fontSize: fontSize(12),
        color: colors.gray,
        marginRight: horizontalScale(10),
    },
    aboutBox: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: horizontalScale(8),
        padding: horizontalScale(15),
        marginBottom: verticalScale(20),
    },
    aboutText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: colors.gray,
        lineHeight: 20,
    },
    certList: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: horizontalScale(8),
        padding: horizontalScale(15),
        marginBottom: verticalScale(20),
    },
    certItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#64748B',
        marginRight: horizontalScale(8),
    },
    certText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: colors.gray,
    },
    countRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    countLabel: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(16),
        color: Colors.black,
    },
    countValueBox: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: horizontalScale(6),
        paddingHorizontal: horizontalScale(15),
        paddingVertical: verticalScale(6),
    },
    countValue: {
        fontFamily: fonts.medium,
        fontSize: fontSize(13),
        color: Colors.black,
    },
    avatarContainer: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
      
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    bottomSpacer: {
        height: verticalScale(40),
    },
    jobInfoRowStart: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: verticalScale(10),
    },
    jobInfoRowWithMarginLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        marginLeft: 15,
    },
});
