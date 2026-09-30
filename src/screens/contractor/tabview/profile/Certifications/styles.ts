import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

export const screenStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
    },
    listContent: {
        paddingTop: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(100),
    },
    fab: {
        position: 'absolute',
        bottom: verticalScale(40),
        right: horizontalScale(24),
        borderRadius: horizontalScale(30),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    fabIcon: {
        width: horizontalScale(60),
        height: horizontalScale(60),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(100),
    },
    emptyText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: horizontalScale(32),
        borderTopRightRadius: horizontalScale(32),
        padding: horizontalScale(24),
        paddingBottom: verticalScale(40),
    },
    modalHandle: {
        width: horizontalScale(40),
        height: verticalScale(4),
        backgroundColor: '#E5E7EB',
        borderRadius: horizontalScale(2),
        alignSelf: 'center',
        marginBottom: verticalScale(16),
    },
    modalTitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
        marginBottom: verticalScale(16),
    },
    inputLabel: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.black,
        marginBottom: verticalScale(12),
    },
    uploadBox: {
        height: verticalScale(180),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(30),
        backgroundColor: colors.white,
    },
    uploadIconContainer: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        backgroundColor: '#F3F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    uploadIcon: {
        width: horizontalScale(40),
        height: horizontalScale(40),
    },
    uploadTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(4),
    },
    uploadSubtitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
    },
    uploadPlaceholder: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalBtn: {
        width: '48%',
        height: verticalScale(50),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    saveBtn: {
        backgroundColor: '#1B00A6',
    },
    cancelBtnText: {
        color: '#1B00A6',
        fontFamily: fonts.bold,
        fontSize: fontSize(18),
    },
    saveBtnText: {
        color: colors.white,
        fontFamily: fonts.bold,
        fontSize: fontSize(18),
    },
    dropdownWrapper: {
        marginBottom: verticalScale(20),
    },
    selectedFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
    },
    fileIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        marginRight: horizontalScale(10),
    },
    fileNameText: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.black,
    },
});

export const itemStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(12),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(12),
    },
    certIcon: {
        width: horizontalScale(32),
        height: horizontalScale(32),
    },
    detailsContainer: {
        flex: 1,
    },
    name: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    deleteButton: {
        padding: horizontalScale(8),
    },
    deleteIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        tintColor: colors.black,
    },
});
