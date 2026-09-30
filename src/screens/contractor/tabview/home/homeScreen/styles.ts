import { StyleSheet } from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: verticalScale(120), // Space for notched tabbar and bottom banner
    },
    quickActionsContainer: {
        marginHorizontal: horizontalScale(20),
        marginTop: verticalScale(24), // Overlap with dashboard curve if needed
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    quickActionsCard:{
            paddingVertical: verticalScale(20),

    },
        
    quickActionsTitle: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(16),
        color: colors.black,
        marginLeft: horizontalScale(20),
        marginBottom: verticalScale(16),
    },
    quickActionsInner: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    section: {
        marginTop: verticalScale(24),
    },
    horizontalList: {
        paddingLeft: horizontalScale(20),
        paddingRight: horizontalScale(4), // Balance the end margin
        paddingBottom: verticalScale(10),
    },
    emptyContainer: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(10),
    },
    emptyText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    bannerContainer: {
        position: 'absolute',
        bottom: verticalScale(120), // Above the tab bar
        left: horizontalScale(20),
        right: horizontalScale(20),
        backgroundColor: '#FFF9E6',
        padding: horizontalScale(15),
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#FFE58F',
        zIndex: 50,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bannerText: {
        flex: 1,
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: '#856404',
        lineHeight: fontSize(18),
    },
});

export default styles;
