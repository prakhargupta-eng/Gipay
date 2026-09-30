import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    Image,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Platform,
    UIManager,
    Alert,
    LayoutAnimation
} from 'react-native';
import FastImage from 'react-native-fast-image';
import colors from '@colors';
import TopHeader from '@components/TopHeader';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import { useUserStore } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import CustomButton from '@components/CustomButton';
import styles from './styles';
import { getPresignedUrl, uploadToS3, getCloudFrontUrl, isUploadAborted } from '@utils/awsUploadHelper';

import { verticalScale, horizontalScale } from '@styles/mixins';
import DropdownField from '@components/DropdownField';
import { showImagePickerOptions } from '@utils/cameraPicker';
import { pickDocument, types } from '@utils/documentPicker';
import AuthService, { UpdateClientProfilePayload } from '@config/authService';
import { Toast } from '@utils/ToastManager';
import { formatEmail } from '@utils/validation';
import strings from '@strings';
import { getFileIcon } from '@utils/fileUtils';
import SkeletonFrame from '@components/SkeletonFrame';
import AppText from '@components/AppText';
import InputField from '@components/InputField';
import { validateRequired, validateCanadianPostalCode } from '@utils/validation';
import { debounce } from '@utils/debounce';
import CitySelectionModal from '@components/CitySelectionModal';
import MobileInput from '@components/MobileInput';
import { useAuth } from '@context/AuthContext';
import { useNetInfo } from '@react-native-community/netinfo';
import { devDebugger } from '@utils/devDebugger';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'ClientProfileDetails'>;

// MIN_FILE_SIZE and MAX_FILE_SIZE are now resolved dynamically from useSystemStore in handleDocumentPick

// ─── Sub-components (Defined OUTSIDE to prevent re-mounting) ──────────────────

const ProfileDetailsSkeleton = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
            <SkeletonFrame width={horizontalScale(110)} height={horizontalScale(110)} borderRadius={horizontalScale(55)} />
            <SkeletonFrame width={150} height={24} style={{ marginTop: 20 }} />
        </View>

        <View style={styles.infoCard}>
            {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.infoItem}>
                    <SkeletonFrame width={40} height={40} borderRadius={8} />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <SkeletonFrame width={80} height={14} style={{ marginBottom: 6 }} />
                        <SkeletonFrame width="60%" height={18} />
                    </View>
                </View>
            ))}
        </View>

        <SkeletonFrame width={120} height={20} style={{ marginTop: 24, marginBottom: 12 }} />
        <View style={styles.chipsContainer}>
            {[1, 2, 3].map(i => (
                <SkeletonFrame key={i} width={80} height={32} borderRadius={8} style={{ marginRight: 8, marginBottom: 8 }} />
            ))}
        </View>

        <View style={styles.sectionHeaderRow}>
            <SkeletonFrame width={150} height={20} />
            <SkeletonFrame width={80} height={24} borderRadius={8} />
        </View>
        <SkeletonFrame width="100%" height={100} borderRadius={12} />
    </ScrollView>
);

const InfoItem = ({ icon, label, value, showVerify = false, multiline = false }: { icon: any, label: string, value: string, showVerify?: boolean, multiline?: boolean }) => (
    <View style={styles.infoItem}>
        <View style={[styles.infoIconContainer]}>
            <Image source={icon} style={styles.infoIcon} resizeMode="contain" />
        </View>
        <View style={styles.infoTextContainer}>
            <AppText style={styles.infoLabel}>{label}</AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText style={[styles.infoValue, { flex: 1, marginRight: 8 }]} numberOfLines={multiline ? undefined : 1}>{value || 'NA'}</AppText>
                {showVerify && <AppText style={[styles.infoValueVerify]}>{strings.client.profileDetails.verified}</AppText>}
            </View>

        </View>
    </View>
);

const EditableField = ({ label, value, onChangeText, error, keyboardType = 'default', showVerify = false, isVerifyingEmail = false, onVerify, editable = true, prefix, isPhone, isVerifiedText = false }: any) => (
    <View style={styles.fieldWrapper}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText style={styles.fieldLabel}>{label}</AppText>
            {isVerifiedText && <AppText style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>{strings.client.profileDetails.verified}</AppText>}
        </View>
        <View style={[styles.inputContainer, error && { borderColor: colors.red }, !editable && { backgroundColor: '#F9FAFB', opacity: 0.8 }]}>
            {prefix && <AppText style={{ fontSize: 16, color: colors.black, marginRight: 8 }}>{prefix}</AppText>}
            <TextInput allowFontScaling={false} style={[styles.input, { flex: 1, marginRight: showVerify ? 8 : 0 }]}
                returnKeyType="done"
                value={value}
                onChangeText={(text) => {
                    let cleanText = text;
                    if (isPhone) {
                        cleanText = text.replace(/[^0-9]/g, '');
                    } else {
                        cleanText = text.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, '');
                    }
                    onChangeText && onChangeText(cleanText);
                }}
                placeholder={`Enter ${label}`}
                placeholderTextColor="#ABB5C5"
                keyboardType={keyboardType}
                editable={editable}
                maxLength={isPhone ? 10 : undefined}
            />
            {showVerify && (
                <TouchableOpacity
                    style={[styles.verifyButton, (isVerifyingEmail || !editable) && { opacity: 0.7 }]}
                    onPress={onVerify}
                    disabled={isVerifyingEmail || !editable}
                >
                    {isVerifyingEmail ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <AppText style={styles.verifyText}>{strings.common.verify}</AppText>
                    )}
                </TouchableOpacity>
            )}
        </View>
        {error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
);

const DocumentCard = ({ docName, url, isUploading }: { docName?: string, url?: string, isUploading?: boolean }) => {
    const icon = getFileIcon(url);
    const isImage = url?.toLowerCase().match(/\.(png|jpg|jpeg)$/) || url?.startsWith('data:image/');
    const isPdf = url?.toLowerCase().endsWith('.pdf');
    const subText = isPdf ? strings.client.profileDetails.pdfDocument : isImage ? strings.client.profileDetails.imageDocument : strings.client.profileDetails.document;

    return (
        <View style={styles.documentCard}>
            {isUploading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
            ) : (
                <Image
                    source={icon}
                    style={styles.pdfIcon}
                    resizeMode="contain"
                />
            )}
            <View style={styles.documentInfo}>
                <AppText style={styles.documentTitle} numberOfLines={1}>
                    {isUploading ? strings.client.profileDetails.uploading : (docName || strings.client.profileDetails.businessRegisterPdf)}
                </AppText>
                <AppText style={styles.documentSub}>{subText}</AppText>
            </View>
        </View>
    );
};

const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null;

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return { color: colors.statusApproved, bg: colors.statusApprovedBg };
            case 'rejected': return { color: colors.statusRejected, bg: colors.statusRejectedBg };
            case 'pending': return { color: colors.statusPendingText, bg: colors.statusPendingBgLight };
            default: return { color: colors.statusDefault, bg: colors.statusDefaultBgLight };
        }
    };

    const statusMap: Record<string, string> = {
        'pending': 'Under Review',
        'approved': 'Approved',
        'rejected': 'Rejected'
    };

    const style = getStatusStyles(status);
    const displayStatus = statusMap[status.toLowerCase()] || status;

    return (
        <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
            <AppText style={[styles.statusBadgeText, { color: style.color }]}>
                {displayStatus}
            </AppText>
        </View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const ClientProfileDetailsScreen = () => {
    const { isConnected } = useNetInfo();
    const isOffline = isConnected === false;
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<ClientAppStackParamList, 'ClientProfileDetails'>>();
    const { clientProfile, setClientProfile } = useUserStore();
    const settings = useSystemStore(state => state.settings);
    const status = clientProfile?.profile?.businessRegistrationDocument?.verificationStatus;
    const isRejected = status?.toLowerCase() === 'rejected';

    const [isLoading, setIsLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [emailVerified, setEmailVerified] = useState(true);
    const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(true);

    // Local States for Editing
    const [orgName, setOrgName] = useState('');
    const [contactName, setContactName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1');

    const [category, setCategory] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPicking, setIsPicking] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const uploadAbortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            uploadAbortControllerRef.current?.abort();
            uploadAbortControllerRef.current = null;
        };
    }, []);

    const [updatedEmail, setupdatedEmail] = useState(false)
    const [updatedMobile, setupdatedMobile] = useState(false)
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Canada');
    const { signOut } = useAuth();
  
    const [selectedCityId, setSelectedCityId] = useState('');
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);
    const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);

  // Field-specific validation
    const validateField = React.useCallback((name: string, value: any) => {
        let error = '';
        switch (name) {
            case 'streetAddress':
                error = validateRequired(value, strings.auth.contractor.completeProfile.streetAddressLabel);
                if (!error && value.trim().length < 5) error = strings.validation.invalidStreetAddress;
                break;
            case 'city':
                error = validateRequired(value, strings.auth.contractor.completeProfile.cityLabel);
                break;
            case 'province':
                error = validateRequired(value, strings.auth.contractor.completeProfile.provinceLabel);
                break;
            case 'postalCode':
                error = validateRequired(value, strings.auth.contractor.completeProfile.postalCodeLabel);
                if (!error) error = validateCanadianPostalCode(value) || '';
                break;
            case 'country':
                error = validateRequired(value, strings.auth.contractor.completeProfile.countryLabel);
                if (!error && value.trim().length < 2) error = strings.validation.invalidCountry;
                break;
            
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    }, []);

    const debouncedValidateField = React.useMemo(
        () =>
            debounce((name: string, value: any) => {
                validateField(name, value);
            }, 500),
        [validateField]
    );
    useEffect(() => {
        fetchProfile();
        fetchProvinces();
        fetchCountry();
    }, []);

    const fetchCities = async () => {
        if (!province) {
            Toast.show({
                type: 'info',
                text2: strings.client.profileDetails.selectProvinceFirst
            });
            return;
        }

        setIsCityModalVisible(true);
    };

    const fetchProvinces = async () => {
        try {
            const response = await AuthService.getProvinces();
            if (response.success && response.data) {
                const mappedProvinces = response.data.provinces.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setProvinces(mappedProvinces);
            }
        } catch (error) {
            devDebugger.error('[ClientProfileDetails] Fetch Provinces Error:', error);
        }
    };

    const fetchCountry = async () => {
        try {
            const response = await AuthService.getCountries(1,10,'canada');
            if (response.success && response.data) {
                const mappedCountries = response.data.countries.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setCountries(mappedCountries);
            }
        } catch (error) {
            devDebugger.error('[ClientProfileDetails] Fetch Countries Error:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await AuthService.getClientProfileInfo();
            if (response.success && response.data) {
                setClientProfile(response.data);
            }
        } catch (error) {
            devDebugger.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientProfile) {
            const profile = clientProfile.profile || {};
            setOrgName(profile.organizationName || '');
            setContactName(profile.contactPersonName || '');

            const currentEmail = clientProfile.user?.email || '';
            setEmail(currentEmail);
            setEmailVerified(true); // If it's coming from store, assume it's verified or original

            const phone = profile.phoneNumber || clientProfile.user?.mobile || '';
            const cleanPhone = phone.replace(/^\+1\s?/, '');
            setPhoneNumber(cleanPhone);
            setMobileVerified(true);
            setMobileVerified(true);
            
            const addressInfo = profile.identityVerification?.address;
            if (addressInfo) {
                setAddress(addressInfo.street || '');
                setCity(addressInfo.city?.name || '');
                setSelectedCityId(addressInfo.city?._id || addressInfo.city?.id || '');
                setProvince(addressInfo.province?._id || addressInfo.province?.id || '');
                setCountry(addressInfo.country?._id || addressInfo.country?.id || '');
                setPostalCode(addressInfo.postalCode || '');
            } else {
                setAddress(profile.companyAddress || '');
            }

            if (clientProfile.user?.isEmailUpdated) {
                setupdatedEmail(true);
            }
            if (clientProfile.user?.isMobileUpdated) {
                setupdatedMobile(true);
            }

            // Handle businessCategory array
            const rawCategory = profile.businessCategory;
            let categoryVal: string[] = [];
            if (Array.isArray(rawCategory)) {
                categoryVal = rawCategory.map((c: any) => c.id || c._id || String(c));
            } else if (typeof rawCategory === 'object' && rawCategory !== null) {
                const id = (rawCategory as any).id || (rawCategory as any)._id;
                if (id) categoryVal = [id];
            } else if (rawCategory) {
                categoryVal = [String(rawCategory)];
            }
            setCategory(categoryVal);

            setSelectedDoc(profile.businessRegistrationDocument || null);
        }
    }, [clientProfile]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync category ID if it was initially set as a name
    useEffect(() => {
        if (categories.length > 0 && category.length > 0) {
            const updatedCategories = category.map(catId => {
                const match = categories.find(c => c.label === catId);
                return match ? match.value : catId;
            });

            // Only update if something changed
            if (JSON.stringify(updatedCategories) !== JSON.stringify(category)) {
                setCategory(updatedCategories);
            }
        }
    }, [categories]);

    // Handle Return from OTP
    useEffect(() => {
        if (route.params?.emailVerified && route.params?.newEmail) {
            setEmail(route.params.newEmail);
            setupdatedEmail(true);
            Toast.show({ type: 'success', text1: strings.client.profileDetails.emailVerifiedTitle, text2: strings.client.profileDetails.emailVerifiedDesc });
        }
        if (route.params?.mobileVerified && route.params?.newMobile) {
            const newMobile = route.params.newMobile;
            const cleanMobile = newMobile.replace(/^\+1\s?/, '');
            setPhoneNumber(cleanMobile);
            setMobileVerified(true);
            setupdatedMobile(true);
            Toast.show({ type: 'success', text1: strings.client.profileDetails.mobileVerifiedTitle, text2: strings.client.profileDetails.mobileVerifiedDesc });
        }
    }, [route.params]);

    const isEmailChanged = email.trim().toLowerCase() !== clientProfile?.user?.email?.trim().toLowerCase();

    const handleVerifyEmail = async () => {
        if (!email) return;
        setIsVerifyingEmail(true);
        try {
            const res = await AuthService.updateEmail(email);
            if (res.success && res.data) {
                const expiresIn = res.data.expiresIn || 59;
                navigation.navigate('verifyCode', {
                    email: email,
                    otpId: res.data.otpId,
                    flowType: 'profileUpdate',
                    expiresIn: expiresIn,
                    role: 'client'
                });
            } else {
                Toast.show({ type: 'error', text1: strings.common.error, text2: res.message });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: strings.common.error, text2: error.message });
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    const isMobileChanged = (() => {
        const current = phoneNumber.replace(/[^0-9]/g, '');
        const profilePhone = clientProfile?.profile?.phoneNumber || clientProfile?.user?.mobile || '';
        const normalizedProfile = profilePhone.replace(/^\+1\s?/, '').replace(/[^0-9]/g, '');
        return current !== normalizedProfile;
    })();

    const handleVerifyMobile = async () => {
        if (!phoneNumber) return;

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 10) {
            Toast.show({
                type: 'error',
                text1: strings.client.profileDetails.invalidPhoneTitle,
                text2: strings.client.profileDetails.invalidPhoneDesc
            });
            return;
        }

        setIsVerifyingMobile(true);
        try {
            // phoneNumber is already clean (10 digits)
            const cleanCountryCode = parseInt(countryCode.replace(/\D/g, ''), 10) || 1;
            const res = await AuthService.updateMobile(phoneNumber, cleanCountryCode);
            if (res.success && res.data) {
                const expiresIn = 59;
                navigation.navigate('verifyCode', {
                    mobile: phoneNumber,
                    countryCode: cleanCountryCode,
                    otpId: res.data.otpId,
                    flowType: 'mobile-update',
                    expiresIn: expiresIn,
                    role: 'client'
                });
            } else {
                Toast.show({ type: 'error', text1: strings.common.error, text2: res.message });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: strings.common.error, text2: error.message });
        } finally {
            setIsVerifyingMobile(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await AuthService.getBusinessCategories();
            if (res.success) {
                const data = res.data;
                const formatted = (Array.isArray(data) ? data : []).map((c: any) => ({
                    label: c.name,
                    value: c.id || c._id
                }));
                setCategories(formatted);
            }
        } catch (error) {
            devDebugger.log('Error fetching categories:', error);
        }
    };

    if (!clientProfile) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const handleImagePick = () => {
        if (isPicking) return;
        setIsPicking(true);
        showImagePickerOptions((result) => {
            if (result) {
                setSelectedImage(result);
            }
            setIsPicking(false);
        });
    };

    const handleDocumentPick = async () => {
        if (isPicking || isUploadingDoc) return;
        setIsPicking(true);
        try {
            setErrors(prev => ({ ...prev, document: '' }));
            const settings = useSystemStore.getState().settings;
            const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
            const minSizeValue = settings?.minDocumentSize || 10;
            const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

            const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
            const maxSizeValue = settings?.maxDocumentSize || 5;
            const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

            const doc = await pickDocument({
                allowedTypes: [types.pdf, types.doc, types.docx, types.images],
                minSize: minSizeInBytes,
                maxSize: maxSizeInBytes,
            });

            if (doc) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                setIsUploadingDoc(true);
                // 1. Get Presigned URL
                const type = doc.type || 'application/pdf';
                const presignedRes = await getPresignedUrl(
                    doc.size || 0,
                    type,
                    'organization' as any,
                    controller.signal
                );

                if (controller.signal.aborted) return;

                if (presignedRes?.uploadUrl) {
                    const { uploadUrl, key } = presignedRes;

                    // 2. Upload to S3
                    await uploadToS3(uploadUrl, doc.uri, type, controller.signal);

                    if (controller.signal.aborted) return;

                    setSelectedDoc({
                        uri: doc.uri,
                        s3Key: key,
                        documentName: doc.name,
                        verificationStatus: 'pending'
                    });

                    Toast.show({ type: 'success', text2: strings.client.profileDetails.documentUploadedSuccessfully });
                }
            }
        } catch (err: any) {
            if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('Document upload aborted by user leaving screen');
                return;
            }
            devDebugger.error('Document Pick/Upload Error:', err);
            Toast.show({ type: 'error', text1: strings.client.profileDetails.documentErrorTitle, text2: err.message || strings.client.profileDetails.failedToUploadDocument });
        } finally {
            setIsPicking(false);
            setIsUploadingDoc(false);
            uploadAbortControllerRef.current = null;
        }
    };

    const handleRemoveDocument = () => {
        setSelectedDoc(null);
        if (errors.document) setErrors(prev => ({ ...prev, document: '' }));
    };

    const getDisplayFileName = () => {
        if (!selectedDoc) return '';
        const name = selectedDoc.documentName || selectedDoc.name;
        if (name) return name;

        const key = selectedDoc.s3Key || selectedDoc.documentUrl;
        if (key) {
            return key.split('/').pop() || "Business Registration";
        }
        return "Business Registration";
    };

    const handleSave = async () => {
        // Validation
        const newErrors: Record<string, string> = {};
        if (!orgName.trim()) newErrors.orgName = strings.validation.fieldEmpty;
        if (!contactName.trim()) newErrors.contactName = strings.validation.fieldEmpty;
        if (!address.trim()) newErrors.address = strings.validation.fieldEmpty;
        if (!selectedCityId) newErrors.city = strings.validation.fieldEmpty;
        if (!province) newErrors.province = strings.validation.fieldEmpty;
        if (!country) newErrors.country = strings.validation.fieldEmpty;
        if (!postalCode) {
            newErrors.postalCode = strings.validation.fieldEmpty;
        } else {
            const postalCodeInvalid = validateCanadianPostalCode(postalCode);
            if (postalCodeInvalid) newErrors.postalCode = postalCodeInvalid;
        }
        if (!category || category.length === 0) newErrors.category = strings.validation.fieldEmpty;

        if (province && !selectedCityId) {
            Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please select a city first before updating.' });
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Toast.show({ type: 'error', text1: strings.client.profileDetails.validationErrorTitle, text2: strings.client.profileDetails.fillMandatoryFields });
            return;
        }

        // Mandatory Document Check
        const currentDocUrl = selectedDoc?.documentUrl || selectedDoc?.url || '';
        const hasNewDoc = !!selectedDoc?.uri;

        if (!currentDocUrl && !hasNewDoc) {
            Toast.show({
                type: 'error',
                text1: strings.client.profileDetails.validationErrorTitle,
                text2: strings.client.profileDetails.uploadMandatoryDocument
            });
            return;
        }

        setIsSaving(true);
        try {
            const profileData = clientProfile?.profile;
            let profileImageKey = clientProfile?.user?.profileImageUrl || '';
            let documentKey = profileData?.businessRegistrationDocument?.documentUrl || '';
            let docName = profileData?.businessRegistrationDocument?.documentName || '';


            // 1. Upload Profile Image if a new one was picked
            if (selectedImage && selectedImage.uri && !selectedImage.uri.startsWith('http')) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                const res = await getPresignedUrl(selectedImage.size || 1024 * 50, selectedImage.mime || 'image/jpeg', 'client', controller.signal);
                if (controller.signal.aborted) return;

                if (res?.uploadUrl) {
                    await uploadToS3(res.uploadUrl, selectedImage.uri, selectedImage.mime || 'image/jpeg', controller.signal);
                    if (controller.signal.aborted) return;
                    profileImageKey = res.key;
                }
            }

            // 2. Use the already uploaded document key
            if (selectedDoc) {
                documentKey = selectedDoc.s3Key || selectedDoc.documentUrl || '';
                docName = selectedDoc.documentName || selectedDoc.name || '';
            }

            // 3. Update Profile API
            const updatePayload: UpdateClientProfilePayload = {
                organisationName: orgName,
                fullName: contactName,
                phoneNumber: phoneNumber,
                countryCode: countryCode.startsWith('+') ? countryCode : `+${countryCode}`,
                companyAddress: address,
                city: selectedCityId,
                province: province,
                country: country,
                postalCode: postalCode,
                profileImage: profileImageKey,
                email: email,
                ...(isRejected ? {
                    businessCategory: category.map(catId => ({
                        id: catId,
                        name: categories.find(c => c.value === catId)?.label || ''
                    })),
                    documentUrl: documentKey,
                    documentName: docName,
                } : {})
            };


            const res = await AuthService.updateClientProfile(updatePayload);
            if (res.success) {
                if (updatedEmail) {
                    Alert.alert(
                        strings.auth.contractor.profileDetails.emailUpdatedTitle,
                        strings.auth.contractor.profileDetails.emailUpdatedDesc,
                        [
                            {
                                text: 'Logout',
                                onPress: async () => {
                                    try {
                                        await AuthService.logout();
                                        signOut();
                                    } catch (error) {
                                        devDebugger.log('Error during logout:', error);
                                        signOut(); // Ensure we sign out even if the API fails
                                    }
                                },
                            }
                        ],
                        { cancelable: false }
                    );
                } else {
                    Toast.show({ type: 'success', text1: strings.common.success, text2: strings.client.profileDetails.profileUpdatedSuccessfully });
                    // Exit edit mode directly
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsEditMode(false);
                }



                // Fetch fresh profile data to ensure UI is perfectly in sync
                const profileRes = await AuthService.getClientProfileInfo();
                if (profileRes.success && profileRes.data) {
                    setClientProfile(profileRes.data);
                }

                setIsEditMode(false);
                setEmailVerified(true);
                setMobileVerified(true);
                setupdatedEmail(false);
                setupdatedMobile(false);
            } else {
                Toast.show({ type: 'error', text1: strings.client.profileDetails.updateFailedTitle, text2: res.message });
            }
        } catch (error: any) {
            if (isUploadAborted(error, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('Save/Upload aborted in ClientProfileDetailsScreen');
                return;
            }
            devDebugger.error('Error saving profile:', error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Something went wrong' });
        } finally {
            setIsSaving(false);
            uploadAbortControllerRef.current = null;
        }
    };




    let profileImageSource = require('@assets/images/common/dummyUser.png');
    if (selectedImage?.uri) {
        profileImageSource = { uri: selectedImage.uri };
    } else if (clientProfile?.user?.profileImageUrl && !imageError) {
        profileImageSource = { uri: clientProfile.user.profileImageUrl };
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <TopHeader
                title={isEditMode ? strings.auth.contractor.profileDetails.editTitle : strings.auth.contractor.profileDetails.viewTitle}
                onBack={() => navigation.goBack()}
            />
            <View style={styles.content}>
                {isLoading ? (
                    <ProfileDetailsSkeleton />
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, isEditMode && { paddingBottom: verticalScale(100) }]}
                    >

                        {/* 🖼 Profile Image Section */}
                        <View style={styles.headerSection}>
                            <TouchableOpacity
                                onPress={isEditMode && !isSaving ? handleImagePick : undefined}
                                style={[styles.avatarContainer, isSaving && { opacity: 0.7 }]}
                                activeOpacity={isEditMode ? 0.7 : 1}
                                disabled={isSaving}
                            >
                                {imageLoading && (
                                    <View style={styles.imageLoader}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    </View>
                                )}
                                <FastImage
                                    source={profileImageSource}
                                    style={styles.avatar}
                                    onLoadStart={() => setImageLoading(true)}
                                    onLoadEnd={() => setImageLoading(false)}
                                    onError={() => {
                                        setImageLoading(false);
                                        setImageError(true);
                                    }}
                                />


                                {isEditMode && (
                                    <View style={styles.editPhotoLabel}>
                                        <Image
                                            source={require('@assets/images/common/camera.png')}
                                            style={styles.cameraIconSmall}
                                            resizeMode="contain"
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <AppText style={styles.userName}>{contactName || strings.client.profileDetails.defaultUser}</AppText>
                        </View>

                        {/* 📋 Content Section */}
                        {isEditMode ? (
                            <>
                                <AppText style={styles.title}>{strings.client.profileDetails.personalInfo}</AppText>

                                <EditableField
                                    label={strings.client.profileDetails.orgNameLabel}
                                    value={orgName}
                                    onChangeText={(text: string) => {
                                        // Prevent special characters (allow only letters, numbers, and spaces)
                                        const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
                                        setOrgName(sanitizedText);
                                        if (errors.orgName) setErrors({ ...errors, orgName: '' });
                                    }}
                                    error={errors.orgName}
                                    editable={!isSaving}
                                />

                                <EditableField
                                    label={strings.client.profileDetails.contactNameLabel}
                                    value={contactName}
                                    onChangeText={(text: string) => {
                                        // Prevent special characters and emojis
                                        const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, '');
                                        setContactName(sanitizedText);
                                        if (errors.contactName) setErrors({ ...errors, contactName: '' });
                                    }}
                                    error={errors.contactName}
                                    editable={!isSaving}
                                />

                                <View style={styles.fieldWrapper}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <AppText style={styles.fieldLabel}>{strings.client.profileDetails.phoneNumberLabel}</AppText>
                                        {updatedMobile && <AppText style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>{strings.client.profileDetails.verified}</AppText>}
                                    </View>
                                    <MobileInput
                                        mobile={phoneNumber}
                                        countryCode={countryCode}
                                        onChangeMobile={(text: string) => {
                                            const cleanText = text.replace(/[^0-9]/g, '');
                                            setPhoneNumber(cleanText);

                                            // Check if changed compared to original profile (normalized)
                                            const profilePhone = clientProfile?.profile?.phoneNumber || clientProfile?.user?.mobile || '';
                                            const profileClean = profilePhone.replace(new RegExp(`^\\${countryCode}\\s?`), '').replace(/[^0-9]/g, '');

                                            if (cleanText !== profileClean) setMobileVerified(false);
                                            else setMobileVerified(true);

                                            if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                                        }}
                                        onChangeCountryCode={(code) => setCountryCode(code)}
                                        showVerifyButton={isMobileChanged && !mobileVerified && phoneNumber.replace(/\s+/g, '') !== '+1' && phoneNumber.trim() !== ''}
                                        isVerifying={isVerifyingMobile}
                                        onVerify={handleVerifyMobile}
                                        editable={!isSaving && !updatedMobile}
                                        updatedMobile={updatedMobile}
                                        containerStyle={errors.phoneNumber ? { borderColor: colors.red } : {}}
                                    />
                                    {errors.phoneNumber && <AppText style={styles.errorText}>{errors.phoneNumber}</AppText>}
                                </View>

                                <EditableField
                                    label={strings.client.profileDetails.emailLabel}
                                    value={email}
                                    keyboardType="email-address"
                                    onChangeText={(text: string) => {
                                        const cleanText = formatEmail(text);
                                        setEmail(cleanText);
                                        if (cleanText !== clientProfile?.user?.email?.trim().toLowerCase()) setEmailVerified(false);
                                        else setEmailVerified(true);
                                        if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    error={errors.email}
                                    showVerify={isEmailChanged && !emailVerified && email.trim() !== ''}
                                    isVerifyingEmail={isVerifyingEmail}
                                    onVerify={handleVerifyEmail}
                                    editable={!isSaving && !updatedEmail}
                                    isVerifiedText={updatedEmail}
                                />

                                <EditableField
                                    label={strings.client.profileDetails.addressLabel}
                                    value={address}
                                    onChangeText={(text: string) => {
                                        // Remove emojis but allow standard address characters
                                        const cleaned = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F02B}\u{1F004}\u{1F0CF}\u{1F0D1}]/gu, '');
                                        setAddress(cleaned);
                                        if (errors.address) setErrors({ ...errors, address: '' });
                                    }}
                                    error={errors.address}
                                    editable={!isSaving}
                                />
                                <View style={styles.row}>
                                    <DropdownField
                                        label={strings.auth.contractor.completeProfile.countryLabel}
                                        placeholder={strings.auth.contractor.completeProfile.enterCountry}
                                        value={country}
                                        disabled={isLoading}
                                        onChange={(val) => {
                                            setCountry(val);
                                            validateField('country', val);
                                        }}
                                        data={countries}
                                        error={errors.country}
                                        wrapperStyle={[styles.inputWrapper, { flex: 1, marginRight: horizontalScale(10) }]}
                                        labelStyle={{ marginBottom: verticalScale(12) }}
                                        errorTextStyle={{ marginTop: verticalScale(6) }}
                                    />
                                    <DropdownField
                                        label={strings.auth.contractor.completeProfile.provinceLabel}
                                        placeholder={strings.auth.contractor.completeProfile.enterProvince}
                                        value={province}
                                        disabled={isLoading}
                                        onChange={(val) => {
                                            setProvince(val);
                                            setCity('');
                                            setSelectedCityId('');
                                            validateField('province', val);
                                        }}
                                        error={errors.province}
                                        data={provinces}
                                        wrapperStyle={[styles.inputWrapper, { flex: 1 }]}
                                        labelStyle={{ marginBottom: verticalScale(12) }}
                                        errorTextStyle={{ marginTop: verticalScale(6) }}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            fetchCities();
                                        }}
                                        style={{ flex: 1, marginRight: horizontalScale(10) }}
                                    >
                                        <View pointerEvents="none" style={{ flex: 1 }}>
                                            <InputField
                                                label={strings.auth.contractor.completeProfile.cityLabel}
                                                placeholder={strings.auth.contractor.completeProfile.selectCity}
                                                value={city}
                                                editable={false}
                                                error={errors.city}
                                                wrapperStyle={styles.inputWrapper}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <InputField
                                        label={strings.auth.contractor.completeProfile.postalCodeLabel}
                                        placeholder={strings.auth.contractor.completeProfile.enterPostalCode}
                                        value={postalCode}
                                        onChangeText={(val) => {
                                            const formatted = val.toUpperCase();
                                            setPostalCode(formatted);
                                            debouncedValidateField('postalCode', formatted);
                                        }}
                                        autoCapitalize="characters"
                                        editable={!isLoading}
                                        error={errors.postalCode}
                                        wrapperStyle={[styles.inputWrapper, { flex: 1 }]}
                                    />
                                </View>
                                <View style={styles.fieldWrapper}>
                                    <AppText style={styles.fieldLabel}>{strings.client.profileDetails.categoryLabel}</AppText>
                                    <DropdownField
                                        label=""
                                        data={categories}
                                        value={category}
                                        onChange={(vals: any) => {
                                            if (!isSaving) {
                                                setCategory(vals);
                                                if (errors.category) setErrors({ ...errors, category: '' });
                                            }
                                        }}
                                        placeholder={strings.client.profileDetails.categoryPlaceholder}
                                        isMultiSelect={true}
                                        disabled={!isRejected} // Category is locked unless rejected
                                    />
                                    {errors.category && <AppText style={styles.errorText}>{errors.category}</AppText>}
                                </View>

                                <AppText style={[styles.sectionTitle, { marginBottom: 0 }]}>{strings.client.profileDetails.registrationDocLabel}</AppText>
                                <View style={{ alignItems: 'flex-end', marginBottom: 16, marginTop: 4 }}>
                                    <StatusBadge status={clientProfile?.profile?.businessRegistrationDocument?.verificationStatus} />
                                </View>

                                {isRejected && (
                                    <AppText style={styles.rejectionMessage}>{clientProfile?.profile?.businessRegistrationDocument?.rejectionReason || strings.client.profileDetails.rejectionNote}</AppText>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.uploadContainer,
                                        errors.document ? styles.uploadContainerError : null,
                                        (isUploadingDoc || selectedDoc) && { opacity: 0.6 }
                                    ]}
                                    onPress={handleDocumentPick}
                                    activeOpacity={0.7}
                                    disabled={isUploadingDoc || !!selectedDoc || !isRejected}
                                >
                                    {isUploadingDoc ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <>
                                            <View style={styles.uploadIconContainer}>
                                                <Image source={require('@assets/images/common/camera.png')} style={styles.upload} resizeMode="contain" />
                                            </View>
                                            <AppText style={styles.uploadText}>{strings.auth.client.setupOrg.uploadPlaceholder}</AppText>
                                            <AppText style={styles.uploadSubText}>{strings.auth.client.setupOrg.uploadSubtitles(settings?.maxDocumentSize || 5, settings?.maxDocumentSizeUnit || 'MB')}</AppText>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {selectedDoc && (
                                    <View style={styles.previewContainer}>
                                        <View style={styles.documentThumbnail}>
                                            <Image
                                                source={getFileIcon(selectedDoc?.uri || selectedDoc?.documentUrl || selectedDoc?.s3Key)}
                                                style={styles.documentIcon}
                                            />
                                            {isRejected && (
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={handleRemoveDocument}
                                                >
                                                    <Image
                                                        source={require('@assets/images/common/close.png')}
                                                        style={styles.removeIconImg}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <AppText style={styles.fileName} numberOfLines={2}>
                                            {getDisplayFileName()}
                                        </AppText>
                                    </View>
                                )}
                                {errors.document && (
                                    <AppText style={styles.errorText}>
                                        {errors.document}
                                    </AppText>
                                )}
                            </>
                        ) : (
                            <>
                                <AppText style={styles.sectionTitle}>{strings.client.profileDetails.personalInfo}</AppText>
                                <View style={styles.infoCard}>

                                    <InfoItem
                                        icon={require('@assets/images/common/clanderBlue.png')}
                                        label={strings.client.profileDetails.orgNameLabel}
                                        value={orgName}

                                    />
                                    <View style={styles.separator} />
                                    <InfoItem
                                        icon={require('@assets/images/common/email.png')}
                                        label={strings.client.profileDetails.emailLabel}
                                        value={email}
                                        showVerify={true}
                                    />


                                    {!!phoneNumber && (
                                        <>
                                            <View style={styles.separator} />
                                            <InfoItem
                                                icon={require('@assets/images/common/contectus.png')}
                                                label={strings.client.profileDetails.phoneNumberLabel}
                                                value={countryCode + " " + phoneNumber}
                                                showVerify={true}
                                            />
                                        </>
                                    )}
                                    <View style={styles.separator} />
                                    <InfoItem
                                        icon={require('@assets/images/common/pinPurper.png')}
                                        label={strings.client.profileDetails.addressLabel}
                                        value={clientProfile?.profile?.companyAddress || address}
                                        multiline={true}
                                    />

                                </View>

                                {!isOffline && (
                                    <>
                                        <AppText style={styles.sectionTitle}>{strings.client.profileDetails.businessCategory}</AppText>
                                        <View style={styles.chipsContainer}>
                                            {category.length > 0 ? (
                                                category.map((id, index) => {
                                                    const cat = categories.find(c => c.value === id);
                                                    return (
                                                        <View key={id} style={styles.categoryChip}>
                                                            <AppText style={styles.categoryChipText}>{cat?.label}</AppText>
                                                        </View>
                                                    );
                                                })
                                            ) : (
                                                <AppText style={styles.value}>{strings.common.na}</AppText>
                                            )}
                                        </View>
                                    </>
                                )}

                                <AppText style={[styles.sectionTitle, { marginBottom: 0 }]}>{strings.client.profileDetails.registrationDocLabel}</AppText>
                                <View style={{ alignItems: 'flex-end', marginBottom: 16, marginTop: 4 }}>
                                    <StatusBadge status={clientProfile?.profile?.businessRegistrationDocument?.verificationStatus} />
                                </View>

                                {isRejected && (
                                    <AppText style={styles.rejectionMessage}> {strings.common.reasonPrefix}{clientProfile?.profile?.businessRegistrationDocument?.rejectionReason || strings.client.profileDetails.rejectionNote}</AppText>
                                )}
                                <TouchableOpacity onPress={() => {
                                    const docUrl = clientProfile?.profile?.businessRegistrationDocument?.documentUrl;
                                    if (docUrl) {
                                        navigation.navigate('WebView', {
                                            url: getCloudFrontUrl(docUrl),
                                            title: strings.client.profileDetails.preview || 'Preview'
                                        });
                                    }
                                }}>
                                    <DocumentCard
                                        docName={clientProfile?.profile?.businessRegistrationDocument?.documentName || clientProfile?.profile?.businessRegistrationDocument?.documentUrl?.split('/').pop()?.replace('document-', '') || "Business Registration"}
                                        url={clientProfile?.profile?.businessRegistrationDocument?.documentUrl}
                                    />
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={{ height: verticalScale(140) }} />
                    </ScrollView>
                )}
            </View>

            {!isOffline && (
                <View style={styles.footer}>
                    {isEditMode ? (
                        <CustomButton
                            title={strings.client.profileDetails.updateChanges}
                            onPress={handleSave}
                            loading={isSaving}
                            disabled={isSaving}
                        />
                    ) : (
                        <CustomButton
                            title={strings.client.profileDetails.editProfile}
                            onPress={() => {
                                setupdatedEmail(false)
                                setupdatedMobile(false)
                                setIsEditMode(true)
                            }}
                        />
                    )}
                </View>
            )}
            <CitySelectionModal
                visible={isCityModalVisible}
                onClose={() => setIsCityModalVisible(false)}
                provinceId={province}
                selectedCityId={selectedCityId}
                onSelect={(item) => {
                    setSelectedCityId(item.value);
                    setCity(item.label);
                    validateField('city', item.label);
                    setIsCityModalVisible(false);
                }}
            />
        </View>
    );
};


export default ClientProfileDetailsScreen;
