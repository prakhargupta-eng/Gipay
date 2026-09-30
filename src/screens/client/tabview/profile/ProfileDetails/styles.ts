import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
    },
    headerSection: {
        alignItems: 'center',
        marginTop: verticalScale(10),
        marginBottom: verticalScale(32),
    },
     row: {
        flexDirection: 'row',
    },
    inputWrapper: {
        marginBottom: verticalScale(15),
    },
    avatarContainer: {
        width: horizontalScale(110),
        height: horizontalScale(110),
        borderRadius: horizontalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: horizontalScale(55),
       
    },
    imageLoader: {
        position: 'absolute',
        zIndex: 1,
    },
    editPhotoLabel: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.white,
        width: horizontalScale(32),
        height: horizontalScale(32),
        borderRadius: horizontalScale(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        zIndex:30

    },
    cameraIconSmall: {
        width: horizontalScale(30),
        height: horizontalScale(30),
    },
    userName: {
        fontSize: fontSize(20),
        fontFamily: Fonts.bold,
        color: colors.black,
        marginTop: verticalScale(12),
    },
    title: {
        fontSize: fontSize(16),
        fontFamily: Fonts.bold,
        color: colors.black,
    },
    sectionTitle: {
        fontSize: fontSize(16),
        fontFamily: Fonts.bold,
        color: colors.black,
        marginTop: verticalScale(20),
         marginBottom: verticalScale(20)
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    // View Mode Styles
    infoCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: horizontalScale(4),
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(12),
    },
    infoIconContainer: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoIcon: {
        width: horizontalScale(35),
        height: horizontalScale(35),
    },
    infoTextContainer: {
        marginLeft: horizontalScale(16),
        flex: 1,
    },
    infoLabel: {
        fontSize: fontSize(13),
        color: '#9CA3AF',
        fontFamily: Fonts.regular,
        marginBottom: 2,
    },
    infoValueVerify: {
        fontSize: fontSize(15),
        color: '#10B981',
        fontFamily: Fonts.semiBold,
        backgroundColor: '#E6F7ED',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(10),
        overflow: 'hidden'
    },
    infoValue: {
        fontSize: fontSize(15),
        color: colors.black,
        fontFamily: Fonts.semiBold,
    },
    value: {
        fontSize: fontSize(15),
        color: colors.black,
        fontFamily: Fonts.semiBold,
    },

    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: horizontalScale(12),
    },
    categoryChip: {
        backgroundColor: '#F0EDFF',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(8),
        borderRadius: horizontalScale(8),
        marginRight: horizontalScale(8),
        marginBottom: verticalScale(8),
    },
    categoryChipText: {
        fontSize: fontSize(14),
        color: '#1B00A6',
        fontFamily: Fonts.medium,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    // Document Card
    documentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: horizontalScale(16),
        marginBottom: verticalScale(20),
    },
    pdfIcon: {
        width: horizontalScale(32),
        height: horizontalScale(32),
    },
    documentInfo: {
        marginLeft: horizontalScale(16),
        flex: 1,
    },
    documentTitle: {
        fontSize: fontSize(15),
        color: colors.black,
        fontFamily: Fonts.semiBold,
    },
    documentSub: {
        fontSize: fontSize(12),
        color: '#9CA3AF',
        fontFamily: Fonts.regular,
        marginTop: 2,
    },
    // Edit Mode Styles
    fieldWrapper: {
        marginBottom: verticalScale(20),
    },
    fieldLabel: {
        fontSize: fontSize(14),
        color: '#9CA3AF',
        fontFamily: Fonts.medium,
        marginBottom: verticalScale(8),
    },
    inputContainer: {
        height: verticalScale(56),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    input: {
        flex: 1,
        fontSize: fontSize(16),
        color: colors.black,
        fontFamily: Fonts.medium,
        height: '100%',
        padding: 0,
    },
    verifyButton: {
        backgroundColor: '#1B00A6',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(6),
    },
    verifyText: {
        color: colors.white,
        fontSize: fontSize(12),
        fontFamily: Fonts.bold,
    },
    errorText: {
        color: colors.red,
        fontSize: fontSize(12),
        marginTop: 4,
        marginLeft: 4,
    },
    mainButton: {
        height: verticalScale(56),
        backgroundColor: '#1B00A6',
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: verticalScale(16),
    },
    mainButtonText: {
        fontSize: fontSize(16),
        color: colors.white,
        fontFamily: Fonts.bold,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(30),
        paddingTop: verticalScale(10),
    },
    rejectionMessage: {
        fontSize: fontSize(14),
        fontFamily: Fonts.bold,
        color: colors.red,
        marginTop: verticalScale(-8),
        marginBottom: verticalScale(16),
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(12),
        // paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: horizontalScale(80),
    },
    statusBadgeText: {
        fontSize: fontSize(13),
        fontFamily: Fonts.semiBold,
    },
    uploadContainer: {
        width: '100%',
        height: verticalScale(140),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(16),
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
        borderRadius: horizontalScale(22),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    upload: {
        width: horizontalScale(40),
        height: horizontalScale(40),
    },
    uploadText: {
        fontSize: fontSize(16),
        fontFamily: Fonts.medium,
        color: '#1F2937',
        textAlign: 'center',
    },
    uploadSubText: {
        fontSize: fontSize(13),
        fontFamily: Fonts.regular,
        color: '#9CA3AF',
        marginTop: verticalScale(4),
        textAlign: 'center',
    },
    previewContainer: {
        marginTop: verticalScale(20),
        alignSelf: 'flex-start',
    },
    documentThumbnail: {
        width: horizontalScale(70),
        height: horizontalScale(70),
        backgroundColor: '#F3F4F6',
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    documentIcon: {
        width: horizontalScale(32),
        height: horizontalScale(32),
        resizeMode: 'contain',
    },
    removeButton: {
        position: 'absolute',
        top: -horizontalScale(10),
        right: -horizontalScale(10),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
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
        fontFamily: Fonts.bold,
        color: colors.black,
    },
    fileName: {
        fontSize: fontSize(12),
        fontFamily: Fonts.medium,
        color: colors.black,
        marginTop: verticalScale(8),
        width: horizontalScale(80),
        textAlign: 'center',
    },
});

export default styles;
