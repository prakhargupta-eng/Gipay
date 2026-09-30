import React, { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Dimensions,
    Image,
    Platform,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '@context/AuthContext';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import DropdownField from '@components/DropdownField';
import { pickDocument } from '@utils/documentPicker';
import { types } from '@react-native-documents/picker';
import { useSystemStore } from '@store/useSystemStore';

import strings from '@constants/strings';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import { getPresignedUrl, uploadToS3, isUploadAborted } from '@utils/awsUploadHelper';
import colours from '@styles/colors';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────

interface Step4Props {
    onNext: () => void;
    onBack: () => void;
}

interface PickedDoc {
    uri: string;
    name: string | null;
    size: number | null;
}

interface CertificateOption {
    id: string;
    name: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const DocumentCard: React.FC<{
    label: string;
    subLabel: string;
    doc: PickedDoc | null;
    error?: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}> = ({ label, subLabel, doc, error, onPress, disabled, loading }) => (
    <View style={styles.cardWrapper}>
        <AppText style={styles.fieldLabel}>{label}</AppText>
        <TouchableOpacity
            style={[
                styles.uploadCard,
                !!error && styles.uploadCardError,
                (disabled || loading) && { opacity: 0.6 }
            ]}
            onPress={onPress}
            activeOpacity={0.75}
            disabled={disabled || loading}
        >
            {loading ? (
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <AppText style={[styles.uploadCardTitle, { marginTop: verticalScale(10) }]}>Uploading...</AppText>
                </View>
            ) : (
                <>
                    <View style={styles.uploadIconCircle}>
                        <Image
                            source={require('@assets/images/common/upload.png')}
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                    </View>
                    <AppText style={styles.uploadCardTitle} numberOfLines={1}>
                        {doc ? doc.name : label.replaceAll(/\s*\(Optional\)/gi, '')}
                    </AppText>
                    {!doc && (
                        <AppText style={styles.uploadCardSubTitle} numberOfLines={1}>
                            {subLabel}
                        </AppText>
                    )}
                </>
            )}
        </TouchableOpacity>
        {!!error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

const CompleteProfileStep4: React.FC<Step4Props> = ({ onBack }) => {
    const insets = useSafeAreaInsets();
    const { userId, updateLastStep, completeProfile } = useAuth();
    const settings = useSystemStore(state => state.settings);

    // Form State
    const [resume, setResume] = useState<PickedDoc | null>(null);
    const [portfolio, setPortfolio] = useState<string>('');
    const [selectedCertificates, setSelectedCertificates] = useState<CertificateOption[]>([]);
    const [certificateDocs, setCertificateDocs] = useState<Record<string, PickedDoc>>({});
    const [agreement, setAgreement] = useState<PickedDoc | null>(null);
    const [license, setLicense] = useState<PickedDoc | null>(null);

    // UI State
    const [availableCertificates, setAvailableCertificates] = useState<CertificateOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingStatus, setUploadingStatus] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const uploadAbortControllerRef = useRef<AbortController | null>(null);

    const isAnyUploading = Object.values(uploadingStatus).some(val => val === true);

    useEffect(() => {
        return () => {
            uploadAbortControllerRef.current?.abort();
            uploadAbortControllerRef.current = null;
        };
    }, []);

    useEffect(() => {
        updateLastStep('CompleteProfileStep4');
        fetchCertificates();
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await ContractorService.getProfileInfo(userId!);
            if (response.success && response.data) {
                const initialData = response.data.profile?.documents || response.data.documents;
                if (initialData) {
                    const getFileName = (url: string) => url.split('?')[0].split('/').pop() || 'File Attached';

                    if (initialData.resumeUrl) {
                        setResume({ uri: initialData.resumeUrl, name: getFileName(initialData.resumeUrl), size: 0 });
                    }
                    if (initialData.professionalLicenseUrl) {
                        setLicense({ uri: initialData.professionalLicenseUrl, name: getFileName(initialData.professionalLicenseUrl), size: 0 });
                    }
                    if (initialData.agreementUrl) {
                        setAgreement({ uri: initialData.agreementUrl, name: getFileName(initialData.agreementUrl), size: 0 });
                    }
                    setPortfolio(initialData.portfolioUrl || '');
                    const certificateData = initialData.certificates || initialData.certificate;
                    if (certificateData) {
                        let certificatesArray: any[] = [];
                        if (Array.isArray(certificateData)) {
                            certificatesArray = certificateData;
                        } else if (typeof certificateData === 'object' && certificateData !== null) {
                            // Check if it's a single certificate object or a dictionary
                            if (certificateData.certificateId || certificateData._id) {
                                certificatesArray = [certificateData];
                            } else {
                                // Handle dictionary/object format (multiple certificates keyed by ID)
                                certificatesArray = Object.entries(certificateData).map(([id, details]: [string, any]) => ({
                                    certificateId: id,
                                    ...details
                                }));
                            }
                        }

                        if (certificatesArray.length > 0) {
                            const certs: CertificateOption[] = certificatesArray.map((c: any) => ({
                                id: c.certificateId || c.id,
                                name: c.type || c.name || 'Certificate'
                            }));
                            setSelectedCertificates(certs.slice(0, 1));

                            const docs: Record<string, PickedDoc> = {};
                            certificatesArray.forEach((c: any) => {
                                const certId = c.certificateId || c.id;
                                if (c.url && certId) {
                                    const getFileName = (url: string) => url.split('?')[0].split('/').pop() || 'Certificate Attached';
                                    docs[certId] = { uri: c.url, name: getFileName(c.url), size: 0 };
                                }
                            });
                            setCertificateDocs(docs);
                        }
                    }
                }
            }
        } catch (error) {
            devDebugger.log('[Step4] Fetch Profile Error:', error);
        }
    };

    const fetchCertificates = async () => {
        try {
            const response = await AuthService.getCertificates();
            if (response.success && response.data) {
                setAvailableCertificates(response.data);
            }
        } catch (error) {
            devDebugger.error('[Step4] Fetch Certificates Error:', error);
        }
    };

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleUpload = async (
        label: string,
        setDoc: (doc: PickedDoc | null) => void,
        folder: string,
        errorKey: string,
        statusKey: string,
        allowedTypes: any[] = [types.pdf, types.doc, types.docx],
        maxSize?: number
    ) => {
        try {
            const settings = useSystemStore.getState().settings;
            const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
            const minSizeValue = settings?.minDocumentSize || 1;
            const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

            const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
            const maxSizeValue = settings?.maxDocumentSize || 10;
            const defaultMaxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

            const finalMaxSize = maxSize !== undefined ? maxSize : defaultMaxSizeInBytes;

            const doc = await pickDocument({
                allowedTypes,
                minSize: minSizeInBytes,
                maxSize: finalMaxSize,
            });

            if (doc) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                setUploadingStatus(prev => ({ ...prev, [statusKey]: true }));
                const fileType = doc.type || 'application/pdf';

                // Use the passed 'folder' parameter
                const res = await getPresignedUrl(doc.size || 1024 * 1024, fileType, folder as any, controller.signal);

                if (controller.signal.aborted) return;

                if (res?.uploadUrl) {
                    await uploadToS3(res.uploadUrl, doc.uri, fileType, controller.signal);
                    if (controller.signal.aborted) return;
                    // Store the full clean URI for the backend payload and use the server filename for display
                    const uploadedFileName = res.fileUrl.split('?')[0].split('/').pop() || doc.name;
                    setDoc({ uri: res.key, name: uploadedFileName, size: doc.size });
                    if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: '' }));
                } else {
                    throw new Error('Failed to get upload authorization');
                }
            }
        } catch (error: any) {
            if (isUploadAborted(error, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log(`[Step4] Upload aborted by user for ${label}`);
                return;
            }
            devDebugger.error(`[Step4] Upload Error for ${label}:`, error);
            Toast.show({ type: 'error', text1: strings.common.error, text2: error.message });
        } finally {
            setUploadingStatus(prev => ({ ...prev, [statusKey]: false }));
            uploadAbortControllerRef.current = null;
        }
    };

    const handlePickResume = () => {
        const settings = useSystemStore.getState().settings;
        const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
        const maxSizeValue = settings?.maxDocumentSize || 10;
        const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;
        handleUpload('Resume', setResume, 'contractor-docs', 'resume', 'resume', [types.pdf, types.doc, types.docx], maxSizeInBytes);
    };

    const handlePickLicense = () => {
        const settings = useSystemStore.getState().settings;
        const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
        const maxSizeValue = settings?.maxDocumentSize || 10;
        const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;
        handleUpload('License', setLicense, 'contractor-docs', 'license', 'license', [types.pdf, types.images], maxSizeInBytes);
    };

    const handlePickAgreement = () => {
        const settings = useSystemStore.getState().settings;
        const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
        const maxSizeValue = settings?.maxDocumentSize || 15;
        const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;
        handleUpload('Agreement', setAgreement, 'contractor-docs', 'agreement', 'agreement', [types.pdf], maxSizeInBytes);
    };

    const handlePickCertificateDoc = async (certId: string, certName: string) => {
        if (!selectedCertificates[0]?.name) {
            Toast.show({ type: 'error', text2: 'Please select certification name first' });
            return;
        }
        const settings = useSystemStore.getState().settings;
        const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
        const maxSizeValue = settings?.maxDocumentSize || 10;
        const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;
        handleUpload(certName, (doc) => {
            if (doc) setCertificateDocs(prev => ({ ...prev, [certId]: doc }));
        }, 'contractor-docs', `cert_${certId}`, `cert_${certId}`, [types.pdf, types.images], maxSizeInBytes);
    };

    // ── Validation ──────────────────────────────────────────────────────────

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // if (!resume) {
        //     newErrors.resume = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.uploadResumeLabel);
        // }

        if (portfolio.trim()) {
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
            if (portfolio.includes(' ')) {
                newErrors.portfolio = "Spaces are not allowed in the URL";
            } else if (!urlRegex.test(portfolio)) {
                newErrors.portfolio = "Please enter a valid URL format";
            }
        }

        if (selectedCertificates.length === 0 || !selectedCertificates[0]?.id) {
            newErrors.certificate = strings.validation.selectCertificateRequired || "Certification selection is mandatory";
        } else {
            selectedCertificates.forEach(cert => {
                if (!certificateDocs[cert.id]) {
                    newErrors[`cert_${cert.id}`] = "Certificate upload is mandatory after name selection";
                }
            });
        }

        // if (!agreement) {
        //     newErrors.agreement = "Signed agreement document is mandatory";
        // }

        setErrors(newErrors);

        const hasCertErrors = selectedCertificates.some(cert => !!newErrors[`cert_${cert.id}`]);
        if (newErrors.certificate || hasCertErrors || newErrors.resume || newErrors.agreement) {
            const errorMsg = newErrors.certificate || (hasCertErrors ? "Please upload the selected certificate" : (newErrors.resume || newErrors.agreement || strings.validation.uploadSelectedCertificates));
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: errorMsg,
            });
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = async () => {
        Keyboard.dismiss();
        if (validate()) {

            setIsLoading(true);
            try {
                // Documents are already uploaded and full URIs are stored in state
                const certificate: any[] = [];
                if (selectedCertificates.length > 0) {
                    selectedCertificates.forEach(cert => {
                        certificate.push({
                            certificateId: cert.id,
                            type: cert.name,
                            url: certificateDocs[cert.id]?.uri || ''
                        });
                    });
                }

                const payload = {
                    agreementUrl: agreement?.uri || '',
                    resumeUrl: resume?.uri || '',
                    portfolioUrl: portfolio,
                    professionalLicenseUrl: license?.uri || '',
                    certificate: certificate[0] || null, // Backend seems to expect a single object
                };


                const response = await AuthService.addDocuments(payload);

                if (response.success) {
                    completeProfile();
                } else {
                    Toast.show({
                        type: 'error',
                        text1: strings.common.error,
                        text2: response.message || strings.auth.contractor.completeProfile.uploadFailedDocs,
                    });
                }
            } catch (error: any) {
                devDebugger.error('[Step4] Error:', error);
                Toast.show({
                    type: 'error',
                    text1: strings.common.error,
                    text2: error.message || strings.auth.contractor.signup.somethingWentWrong,
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.body, { marginTop: verticalScale(20) }]}>
                            <AppText style={styles.sectionTitle}>{strings.auth.contractor.completeProfile.documentUpload}</AppText>

                            {/* 1. Resume Upload */}
                            <DocumentCard
                                label={strings.auth.contractor.completeProfile.uploadResumeLabel}
                                subLabel={strings.auth.contractor.completeProfile.uploadResumeLimit(settings?.maxDocumentSize || 10, settings?.maxDocumentSizeUnit || 'MB')}
                                doc={resume}
                                disabled={isLoading || (isAnyUploading && !uploadingStatus.resume)}
                                loading={uploadingStatus.resume}
                                error={errors.resume}
                                onPress={handlePickResume}
                            />

                            <InputField
                                label={strings.auth.contractor.completeProfile.portfolioLabel}
                                placeholder={strings.auth.contractor.completeProfile.portfolioPlaceholder}
                                value={portfolio}
                                onChangeText={(t) => {
                                    setPortfolio(t);
                                    if (errors.portfolio) setErrors(prev => ({ ...prev, portfolio: '' }));
                                }}
                                error={errors.portfolio}
                                editable={!isLoading}
                                wrapperStyle={styles.fieldWrapper}
                                maxLength={100}
                            />

                            <DropdownField
                                label={strings.auth.contractor.completeProfile.selectCertificateLabel}
                                placeholder={strings.common.select}
                                value={selectedCertificates[0]?.name || ''}
                                disabled={isLoading}
                                onChange={(val) => {
                                    const selected = availableCertificates.find(c => c.name === val);
                                    if (selected) {
                                        // Only one certificate can be selected
                                        setSelectedCertificates([selected]);
                                        if (errors.certificate) setErrors(prev => ({ ...prev, certificate: '' }));
                                    }
                                }}
                                data={availableCertificates.map(c => c.name)}
                                error={errors.certificate}
                                wrapperStyle={styles.fieldWrapper}
                                labelStyle={styles.fieldLabel}
                            />

                            {/* {!!(selectedCertificates.length > 0 && errors.certificate) && (
                                <AppText style={styles.errorText}>{errors.certificate}</AppText>
                            )} */}

                            {/* Certificate Upload Field */}
                            {selectedCertificates.length > 0 && (
                                <DocumentCard
                                    key={selectedCertificates[0].id}
                                    label={strings.auth.contractor.completeProfile.uploadYourCertificate}
                                    subLabel={strings.auth.contractor.completeProfile.uploadCertificateLimit(settings?.maxDocumentSize || 10, settings?.maxDocumentSizeUnit || 'MB')}
                                    doc={certificateDocs[selectedCertificates[0].id] || null}
                                    disabled={isLoading || (isAnyUploading && !uploadingStatus[`cert_${selectedCertificates[0].id}`])}
                                    loading={uploadingStatus[`cert_${selectedCertificates[0].id}`]}
                                    error={errors[`cert_${selectedCertificates[0].id}`]}
                                    onPress={() => handlePickCertificateDoc(selectedCertificates[0].id, selectedCertificates[0].name)}
                                />
                            )}

                            <DocumentCard
                                label={strings.auth.contractor.completeProfile.uploadLicenseLabel}
                                subLabel={strings.auth.contractor.completeProfile.uploadLicenseLimit(settings?.maxDocumentSize || 10, settings?.maxDocumentSizeUnit || 'MB')}
                                doc={license}
                                disabled={isLoading || (isAnyUploading && !uploadingStatus.license)}
                                loading={uploadingStatus.license}
                                error={errors.license}
                                onPress={handlePickLicense}
                            />

                            <DocumentCard
                                label={strings.auth.contractor.completeProfile.uploadAgreementLabel}
                                subLabel={strings.auth.contractor.completeProfile.uploadAgreementLimit(settings?.maxDocumentSize || 15, settings?.maxDocumentSizeUnit || 'MB')}
                                doc={agreement}
                                disabled={isLoading || (isAnyUploading && !uploadingStatus.agreement)}
                                loading={uploadingStatus.agreement}
                                error={errors.agreement}
                                onPress={handlePickAgreement}
                            />
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>

            {/* ── Bottom button row ── */}
            <View style={[styles.buttonRow]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        Keyboard.dismiss();
                        onBack();
                    }}
                    activeOpacity={0.75}
                >
                    <AppText style={styles.backButtonText}>{strings.common.back}</AppText>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <LoginButton
                        text={strings.common.continue}
                        onPress={handleContinue}
                        loading={isLoading}
                        disabled={isLoading}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: verticalScale(20),
    },
    body: {
        paddingHorizontal: horizontalScale(20),
    },
    sectionTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(20),
    },
    cardWrapper: {
        marginBottom: verticalScale(20),
    },
    fieldWrapper: {
        marginBottom: verticalScale(20),
    },
    fieldLabel: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#ABB5C5',
        marginBottom: verticalScale(10),
        marginLeft: 0,
    },

    // ── Upload Card ──
    uploadCard: {
        width: '100%',
        height: verticalScale(130),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: verticalScale(16),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadCardError: {
        borderColor: colors.red,
    },
    uploadIconCircle: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: horizontalScale(22),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    iconImage: {
        width: horizontalScale(44),
        height: horizontalScale(44),
    },
    uploadCardTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: '#333333',
        textAlign: 'center',
    },
    uploadCardSubTitle: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: colours.gray,
        textAlign: 'center',
    },
    loadingWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingIcon: {
        width: horizontalScale(30),
        height: horizontalScale(30),
        marginBottom: verticalScale(10),
    },

    // ── Error ──
    errorText: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: colors.red,
        marginTop: verticalScale(5),
    },

    // ── Bottom bar ──
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(15),
        paddingBottom: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.white,
        paddingTop: verticalScale(10),
    },
    backButton: {
        flex: 1,
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: verticalScale(16),
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    backButtonText: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: colors.primary,
    },
});

export default CompleteProfileStep4;
