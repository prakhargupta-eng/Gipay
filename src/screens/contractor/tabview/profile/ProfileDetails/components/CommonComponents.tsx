import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import styles from '../styles';
import strings from '@constants/strings';
import { Toast } from '@utils/ToastManager';
import { getCloudFrontUrl } from '@utils/awsUploadHelper';
import { getFileIcon } from '@utils/fileUtils';
import AppText from '@components/AppText';

export const Tag = ({ label, index, onDelete }: { label: string; index: number; onDelete?: () => void }) => (
    <View key={index} style={styles.tag}>
        <AppText style={styles.tagText}>{label}</AppText>
        {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.tagClose}>
                <AppText style={styles.tagCloseText}>x</AppText>
            </TouchableOpacity>
        )}
    </View>
);

export const InfoRow = ({ label, value, showVerify = false, multiline = false }: { label: string; value: string; showVerify?: boolean; multiline?: boolean }) => (
    <View style={styles.infoRow}>
         <AppText style={styles.infoLabel}>{label}</AppText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
           
              <AppText style={[styles.infoValue, { flex: 1, marginRight: 8 }]} {...(!multiline && { numberOfLines: 1 })}>{value || 'N/A'}</AppText>
            {showVerify && (
                <AppText style={styles.infoverfy}>{strings.auth.contractor.profileDetails.verified}</AppText>
            )}
        </View>
      
    </View>
);

export const DocumentField = ({ label, doc, navigation }: { label: string; doc: any; navigation: any }) => {
    const name = doc?.documentName || doc?.name || 'No file';
    const url = doc?.documentUrl || doc?.uri;

    return (
        <TouchableOpacity
            style={styles.docField}
            onPress={() => {
                if (url) {
                    navigation.navigate('WebView', { url: getCloudFrontUrl(url), title: `${strings.client.profileDetails.preview} ${label}` });
                } else {
                    Toast.show({ type: 'info', text1: 'Not Available', text2: 'This document is not uploaded yet.' });
                }
            }}
        >
            <AppText style={styles.docLabel}>{label}</AppText>
            <View style={styles.docItem}>
                <Image source={getFileIcon(url)} style={styles.pdfIcon} />
                <AppText style={styles.docName} numberOfLines={1}>{name}</AppText>
            </View>
        </TouchableOpacity>
    );
};
