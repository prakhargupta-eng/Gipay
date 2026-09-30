import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    FlatList,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import AppText from '@components/AppText';
import { Toast } from '@utils/ToastManager';

interface EvidenceSheetModalProps {
    visible: boolean;
    onClose: () => void;
    evidences: any[];
    jobTitle: string;
}

const EvidenceSheetModal: React.FC<EvidenceSheetModalProps> = ({
    visible,
    onClose,
    evidences,
    jobTitle,
}) => {
    const navigation = useNavigation<any>();

    const handleOpenEvidence = (evidence: any) => {
        const fileUrl = typeof evidence === 'string' ? evidence : evidence?.fileUrl;
        
        if (!fileUrl) {
            Toast.show({ type: 'error', text2: 'Invalid or missing attachment url.' });
            return;
        }

        const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
        const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];

        if (!supportedExtensions.includes(ext)) {
            Toast.show({
                type: 'error',
                text2: 'Unsupported file format. This file is not viewable.'
            });
            return;
        }

        onClose();
        
        // Wait briefly for modal to close on iOS before navigating
        setTimeout(() => {
            navigation.navigate('WebView', {
                url: fileUrl,
                title: 'Attachment'
            });
        }, Platform.OS === 'ios' ? 300 : 0);
    };

    const extractFilename = (url: string) => {
        if (!url) return 'Unknown_File';
        const parts = url.split('/');
        return parts[parts.length - 1] || 'Attachment';
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={styles.sheetContent}>
                    
                    <View style={styles.header}>
                        <AppText style={styles.headerTitle} numberOfLines={1}>{jobTitle}</AppText>
                        
                    </View>

                    <AppText style={styles.subtitle}>
                        {evidences.length} {evidences.length === 1 ? 'Attachment' : 'Attachments'}
                    </AppText>

                    <FlatList
                        data={evidences}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: verticalScale(20) }}
                        renderItem={({ item }) => {
                            const fileUrl = typeof item === 'string' ? item : item?.fileUrl;
                            const filename = extractFilename(fileUrl);
                            
                            return (
                                <TouchableOpacity 
                                    style={styles.evidenceRow} 
                                    activeOpacity={0.7}
                                    onPress={() => handleOpenEvidence(item)}
                                >
                                    <View style={styles.fileInfo}>
                                        <Image 
                                            source={require('@assets/images/common/png.png')} 
                                            style={styles.fileIcon} 
                                        />
                                        <AppText style={styles.filename} numberOfLines={1}>
                                            {filename}
                                        </AppText>
                                    </View>
                                    
                                    <View style={styles.viewBtn}>
                                        <Image 
                                            source={require('@assets/images/common/backIcon.png')} 
                                            style={[styles.backIcon, { transform: [{ rotate: '180deg' }] }]} 
                                        />
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        flex: 1,
    },
    sheetContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: horizontalScale(24),
        borderTopRightRadius: horizontalScale(24),
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(20),
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(10),
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: colors.black,
        textAlign: 'center',
        marginRight: horizontalScale(10),
    },
    closeBtn: {
        padding: horizontalScale(5),
    },
    closeIcon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        tintColor: colors.gray,
    },
    subtitle: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.gray,
        marginBottom: verticalScale(16),
        textAlign: 'center',
    },
    evidenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: horizontalScale(12),
        padding: horizontalScale(12),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: horizontalScale(10),
    },
    fileIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        marginRight: horizontalScale(10),
        resizeMode: 'contain',
    },
    filename: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textDark,
    },
    viewBtn: {
        padding: horizontalScale(5),
    },
    backIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        tintColor: colors.primary,
        resizeMode: 'contain',
    }
});

export default EvidenceSheetModal;
