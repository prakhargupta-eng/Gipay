import { StyleSheet } from 'react-native';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    content: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(30),
    },
    title: {
        fontSize: fontSize(28),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(30),
    },
    sectionTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(20),
    },
    inputWrapper: {
        marginBottom: verticalScale(20),
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        marginBottom: verticalScale(10),
        marginLeft: horizontalScale(5),
    },
    uploadContainer: {
        width: '100%',
        height: verticalScale(140),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        borderStyle: 'dashed',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
        paddingHorizontal: horizontalScale(20),
    },
    uploadContainerError: {
        borderColor: colors.red,
    },
    uploadIconContainer: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    uploadIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        resizeMode: 'contain',
        tintColor: colors.gray,
    },
    uploadText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: '#1F2937',
        textAlign: 'center',
    },
    uploadSubText: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: '#9CA3AF',
        marginTop: verticalScale(4),
        textAlign: 'center',
    },
    errorText: {
        color: colors.red,
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        marginTop: verticalScale(6),
        marginLeft: horizontalScale(4),
    },
    buttonWrapper: {
        paddingHorizontal: horizontalScale(20),
        // paddingTop: verticalScale(15),
        paddingBottom: verticalScale(30),
        backgroundColor: colors.white,
    },
    nonEditableInput: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
    },
    upload: {
        width: 44,
        height: 44,
    },
    inputStyle: {
        borderColor: colors.black,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: verticalScale(10),
        gap: horizontalScale(8),
        marginBottom: verticalScale(20),
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAE5FF',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    tagText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#4F46E5',
        marginRight: horizontalScale(6),
    },
    removeIcon: {
        fontFamily: fonts.medium,
        fontSize: fontSize(20),
        color: colors.primary,
    },
    previewContainer: {
        marginTop: verticalScale(20),
        alignSelf: 'flex-start',
    },
    documentThumbnail: {
        width: horizontalScale(70),
        height: horizontalScale(70),
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pdfIcon: {
        width: horizontalScale(32),
        height: horizontalScale(32),
        resizeMode: 'contain',
    },
    fileName: {
        fontSize: fontSize(12),
        fontFamily: fonts.medium,
        color: colors.black,
        marginTop: verticalScale(8),
        width: horizontalScale(80),
        textAlign: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: -horizontalScale(10),
        right: -horizontalScale(10),
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: horizontalScale(24),
        height: horizontalScale(24),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    removeIconImg: {
        width: horizontalScale(25),
        height: horizontalScale(25),
    },
    removeIconText: {
        fontSize: fontSize(12),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    fullNameContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(14),
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    fullNameText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.black,
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    documentIcon: {
        width: horizontalScale(32),
        height: horizontalScale(horizontalScale(32)),
        resizeMode: 'contain',
    },
});

export const loaderColor = colors.primary;

export default styles;