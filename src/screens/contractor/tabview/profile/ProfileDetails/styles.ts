import { StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    scrollContent: { paddingHorizontal: horizontalScale(20), paddingBottom: verticalScale(80) },

    profileHeader: { alignItems: 'center', marginTop: verticalScale(20) },
    imageWrapper: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        borderRadius: horizontalScale(50),
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible'
    },
    profileImage: { width: '100%', height: '100%', borderRadius: horizontalScale(50) },
    loader: { position: 'absolute' },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.white,
        width: horizontalScale(32),
        height: horizontalScale(32),
        borderRadius: horizontalScale(16),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2
    },
    cameraIcon: { width: horizontalScale(32), height: horizontalScale(32) },
    userName: { fontSize: fontSize(20), fontFamily: Fonts.bold, color: colors.black, marginTop: verticalScale(12) },
    commissionText: { fontSize: fontSize(12), color: colors.textSecondary, fontFamily: Fonts.medium, marginTop: verticalScale(4) },
    
    sectionTitle: { fontSize: fontSize(16), fontFamily: Fonts.bold, color: colors.black, marginTop: verticalScale(10), marginBottom: verticalScale(15) },
    infoRow: { marginBottom: verticalScale(18) },
    infoLabel: { fontSize: fontSize(13), color: colors.textSecondary, fontFamily: Fonts.medium, marginBottom: verticalScale(4) },
    infoValue: { fontSize: fontSize(15), color: colors.black, fontFamily: Fonts.medium },
    infoverfy: { 
        fontSize: fontSize(15), 
        color:  '#10B981', 
        fontFamily: Fonts.semiBold,
        backgroundColor: '#E6F7ED',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(10),
        overflow: 'hidden'
    },
    subLabel: { fontSize: fontSize(13), color: colors.textSecondary, fontFamily: Fonts.medium, marginBottom: verticalScale(10) },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: verticalScale(15) },
    tag: { 
        backgroundColor: '#F0EDFF', 
        paddingHorizontal: horizontalScale(10), 
        paddingVertical: verticalScale(6), 
        borderRadius: horizontalScale(8),
        flexDirection: 'row',
        alignItems: 'center'
    },
    tagText: { color: colors.primary, fontSize: fontSize(13), fontFamily: Fonts.semiBold },
    tagClose: { marginLeft: horizontalScale(6), padding: 2 },
    tagCloseText: { color: colors.primary, fontSize: fontSize(14), fontWeight: 'bold' },
    
    docField: { marginBottom: verticalScale(15) },
    docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(8) },
    docLabel: { fontSize: fontSize(12), color: colors.textSecondary, fontFamily: Fonts.medium },
    editIconSmall: { width: horizontalScale(18), height: horizontalScale(18), tintColor: colors.black },
    docItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.white, 
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        borderRadius: horizontalScale(12), 
        padding: horizontalScale(12) 
    },
    pdfIcon: { width: horizontalScale(24), height: horizontalScale(24), marginRight: horizontalScale(12) },
    docName: { flex: 1, fontSize: fontSize(14), color: colors.black, fontFamily: Fonts.medium },
    verifiedTextSmall: { color: colors.green, fontSize: fontSize(14), marginLeft: horizontalScale(8) },

    editSection: { marginTop: verticalScale(10) },
    inputGroup: { marginBottom: verticalScale(20) },
    inputLabel: { fontSize: fontSize(13), color: colors.textSecondary, fontFamily: Fonts.medium, marginBottom: verticalScale(8) },
    inputWithButton: { flexDirection: 'row', alignItems: 'center' },
    verifyInsideButton: { 
        position: 'absolute', 
        right: horizontalScale(12), 
        backgroundColor: colors.primary, 
        paddingHorizontal: horizontalScale(12), 
        paddingVertical: verticalScale(6), 
        borderRadius: horizontalScale(8) 
    },
    verifyButtonText: { color: colors.white, fontSize: fontSize(12), fontFamily: Fonts.bold },

    input: { 
        backgroundColor: colors.white, 
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        borderRadius: horizontalScale(12), 
        paddingHorizontal: horizontalScale(16), 
        height: verticalScale(52),
        fontSize: fontSize(15),
        color: colors.black,
        fontFamily: Fonts.medium
    },
    phoneInputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        borderRadius: horizontalScale(12), 
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(16)
    },
    countryCode: { fontSize: fontSize(15), color: colors.black, fontFamily: Fonts.medium, marginRight: horizontalScale(8) },
    phoneInput: { flex: 1, height: verticalScale(52), fontSize: fontSize(15), color: colors.black, fontFamily: Fonts.medium },
    dateInput: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        borderRadius: horizontalScale(12), 
        paddingHorizontal: horizontalScale(16), 
        height: verticalScale(52) 
    },
    dateText: { fontSize: fontSize(15), color: colors.black, fontFamily: Fonts.medium },
    calendarIcon: { width: horizontalScale(20), height: horizontalScale(20), tintColor: colors.textSecondary },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(20),

        paddingTop: verticalScale(15),
       
    },
    mainButton: {
        backgroundColor: colors.primary,
        height: verticalScale(56),
        borderRadius: horizontalScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    buttonText: { color: colors.white, fontSize: fontSize(16), fontFamily: Fonts.bold },
    viewSection: { marginTop: verticalScale(10) },
    headerSection: { alignItems: 'center', marginTop: verticalScale(20), marginBottom: verticalScale(30) },
    infoCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: horizontalScale(4),
        marginBottom: verticalScale(20),
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(12),
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: verticalScale(15),
    },
});

export default styles;
