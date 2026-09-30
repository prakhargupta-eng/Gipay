import React, { useState, useEffect , useRef } from 'react';
import CustomToast from '@components/CustomToast';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import { useSystemStore } from '@store/useSystemStore';
import { pick, types } from '@react-native-documents/picker';
import DropdownField from '@components/DropdownField';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import SkeletonFrame from '@components/SkeletonFrame';
import { screenStyles as styles } from './styles';
import CertificationItem from './components/CertificationItem';
import { getPresignedUrl, uploadToS3, getCloudFrontUrl, isUploadAborted } from '@utils/awsUploadHelper';
import { getFileIcon } from '@utils/fileUtils';

import ConfirmationPopup from '@components/ConfirmationPopup';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

interface Certificate {
    id: string;
    certificateRecordId: string;
    name: string;
    status: 'verified' | 'pending' | 'rejected';
    fileUrl: string;
    fileName?: string;
    issueDate?: string;
}

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'Certifications'>;

const CertificationsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const settings = useSystemStore(state => state.settings);
    const [isLoading, setIsLoading] = useState(false);
    const toastRef = useRef<any>(null);
    const uploadAbortControllerRef = useRef<AbortController | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [certName, setCertName] = useState('');
    const [certId, setCertId] = useState('');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [availableCertificates, setAvailableCertificates] = useState<{ id: string, name: string }[]>([]);

    // Delete State
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        return () => {
            uploadAbortControllerRef.current?.abort();
            uploadAbortControllerRef.current = null;
        };
    }, []);

    const handleCloseModal = () => {
        uploadAbortControllerRef.current?.abort();
        uploadAbortControllerRef.current = null;
        setIsLoading(false);
        setIsModalVisible(false);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsInitialLoading(true);
            await Promise.all([fetchMasterCertificates(), fetchUserCertificates()]);
            setIsInitialLoading(false);
        };
        loadInitialData();
    }, []);

    const fetchMasterCertificates = async () => {
        try {
            const response = await AuthService.getCertificates();
            if (response.success && response.data) {
                setAvailableCertificates(response.data);
            }
        } catch (error: any) {
            devDebugger.log('Error fetching master certificates:', error);
        }
    };

    const fetchUserCertificates = async () => {
        try {
            const response = await ContractorService.getCertificates();
            if (response.success && response.data) {
                const mapped: Certificate[] = response.data.map((item: any) => ({
                    id: item._id,
                    certificateRecordId: item.certificateId,
                    name: item.type,
                    status: item.verificationStatus || 'pending',
                    fileUrl: item.url,
                    fileName: item.url?.split('/').pop(),
                }));
                setCertificates(mapped);
            }
        } catch (error: any) {
            devDebugger.log('Error fetching user certificates:', error);
        }
    };

    const handleAddCertificate = () => {
        setCertName('');
        setCertId('');
        setSelectedFile(null);
        setIsModalVisible(true);
    };

    const handleDeleteCertificate = (id: string) => {
        // At least one certificate should remain
        if (certificates.length <= 1) {
            toastRef.current?.show({ type: 'error',
                text1: 'Warning',
                text2: 'You must have at least one certificate.'
            });
            return;
        }

        setSelectedCertId(id);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!selectedCertId) return;

        setIsDeleting(true);
        try {
            const response = await ContractorService.deleteCertificate(selectedCertId);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Certificate deleted successfully'
                });
                setIsDeleteModalVisible(false);
                fetchUserCertificates();
            } else {
                toastRef.current?.show({ type: 'error',
                    text2: response.message || 'Failed to delete certificate'
                });
            }
        } catch (error: any) {
            toastRef.current?.show({ type: 'error',
                text2: error.message || 'Something went wrong while deleting'
            });
        } finally {
            setIsDeleting(false);
            setSelectedCertId(null);
        }
    };

    const handlePickDocument = async () => {
        try {
            const [result] = await pick({
                type: [types.pdf, types.doc, types.docx],
            });
            if (result) {
                const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
                const minSizeValue = settings?.minDocumentSize || 1;
                const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

                const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
                const maxSizeValue = settings?.maxDocumentSize || 10;
                const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

                if (result.size && (result.size < minSizeInBytes || result.size > maxSizeInBytes)) {
                    Toast.show({
                        type: 'error',
                        text1: 'Invalid File Size',
                        text2: `File must be between ${minSizeValue}${minSizeUnit} and ${maxSizeValue}${maxSizeUnit}.`
                    });
                    return;
                }
            }
            setSelectedFile(result);
        } catch (err) {
            devDebugger.log('Document picker error:', err);
        }
    };

    const handleSave = async () => {
        if (!certName.trim()) {
            toastRef.current?.show({ type: 'error',
                text2: 'Please enter certificate name'
            });
            return;
        }
        if (!selectedFile) {
            toastRef.current?.show({ type: 'error',
                text2: 'Please upload a document'
            });
            return;
        }

        uploadAbortControllerRef.current?.abort();
        const controller = new AbortController();
        uploadAbortControllerRef.current = controller;

        setIsLoading(true);
        try {
            let fileUrl = selectedFile.uri;

            if (selectedFile.uri && (selectedFile.uri.startsWith('content://') || selectedFile.uri.startsWith('file://'))) {
                const presignedRes = await getPresignedUrl(
                    selectedFile.size || 0,
                    selectedFile.type || 'application/pdf',
                    'contractor-docs',
                    controller.signal
                );

                if (controller.signal.aborted) return;

                if (presignedRes?.uploadUrl) {
                    await uploadToS3(
                        presignedRes.uploadUrl,
                        selectedFile.uri,
                        selectedFile.type || 'application/pdf',
                        controller.signal
                    );
                    if (controller.signal.aborted) return;
                    fileUrl =  presignedRes.key;
                } else {
                    throw new Error('Failed to get upload URL');
                }
            }

            if (controller.signal.aborted) return;

            const payload = {
                certificateId: certId,
                type: certName,
                url: fileUrl
            };

            const response = await ContractorService.addCertificate(payload);

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Certificate added successfully'
                });
                setIsModalVisible(false);
                fetchUserCertificates();
            } else {
                throw new Error(response.message || 'Failed to save');
            }
        } catch (error: any) {
            if (isUploadAborted(error, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('Certificate upload aborted by user');
                return;
            }
            toastRef.current?.show({ type: 'error',
                text2: error.message 
            });
        } finally {
            setIsLoading(false);
            uploadAbortControllerRef.current = null;
        }
    };

    const ShimmerCell = () => (
        <View style={{ marginBottom: verticalScale(16) }}>
            <SkeletonFrame
                width={'100%'}
                height={verticalScale(70)}
                borderRadius={horizontalScale(16)}
            />
        </View>
    );

    const renderItem = ({ item }: { item: Certificate }) => (
        <CertificationItem
            name={item.name}
            url={item.fileUrl}
            onPress={() => navigation.navigate('WebView', { url: getCloudFrontUrl(item.fileUrl), title: item.name })}
            onDelete={() => handleDeleteCertificate(item.id)}
            isLoading={isLoading}
        />
    );

    return (
        <View style={styles.root}>
            <TopHeader
                title={strings.auth.contractor.profile.certifications}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.container}>
                {isInitialLoading ? (
                    <View style={styles.listContent}>
                        {[1, 2, 3, 4, 5].map(idx => <ShimmerCell key={idx} />)}
                    </View>
                ) : (
                    <FlatList
                        data={certificates}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <AppText style={styles.emptyText}>No certifications found</AppText>
                            </View>
                        }
                    />
                )}

                <ConfirmationPopup
                    visible={isDeleteModalVisible}
                    onClose={() => {
                        setIsDeleteModalVisible(false);
                        setSelectedCertId(null);
                    }}
                    onConfirm={confirmDelete}
                    message="Are you sure you want to delete this certificate?"
                    confirmText="Delete"
                    cancelText="Cancel"
                    isLoading={isDeleting}
                    isDestructive
                />

                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleAddCertificate}
                    activeOpacity={0.8}
                >
                    <Image
                        source={require('@assets/images/common/addGradient.png')}
                        style={styles.fabIcon}
                    />
                </TouchableOpacity>
            </View>

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <AppText style={styles.modalTitle}>Certifications</AppText>

                        <DropdownField
                            placeholder="Select Certifications"
                            value={certName}
                            data={availableCertificates.map(c => c.name)}
                            onChange={(val) => {
                                setCertName(val);
                                const selected = availableCertificates.find(c => c.name === val);
                                if (selected) setCertId(selected.id);
                            }}
                            wrapperStyle={styles.dropdownWrapper}
                        />

                        <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
                            {selectedFile ? (
                                <View style={styles.selectedFileContainer}>
                                    <Image
                                        source={getFileIcon(selectedFile.uri)}
                                        style={styles.fileIcon}
                                    />
                                    <AppText style={styles.fileNameText} numberOfLines={1}>{selectedFile.name}</AppText>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.uploadIconContainer}>
                                        <Image
                                            source={require('@assets/images/common/upload.png')}
                                            style={styles.uploadIcon}
                                        />
                                    </View>
                                    <AppText style={styles.uploadTitle}>Upload Your Certificate</AppText>
                                    <AppText style={styles.uploadSubtitle}>{strings.auth.contractor.completeProfile.docSizeLimit(settings?.maxDocumentSize || 10, settings?.maxDocumentSizeUnit || 'MB')}</AppText>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={handleCloseModal}
                                disabled={isLoading}
                            >
                                <AppText style={styles.cancelBtnText}>Cancel</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <AppText style={styles.saveBtnText}>Save</AppText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
              <CustomToast ref={toastRef} />
</Modal>
        </View>
    );
};

export default CertificationsScreen;
