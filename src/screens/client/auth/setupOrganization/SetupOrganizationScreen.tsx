import React, { useState, useEffect, useRef } from 'react';
import useBlockBackButton from '@hooks/useBlockBackButton';
import {
    View,
    StatusBar,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ImageStyle
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientProfileStackParamList } from '@navigation/client/ClientProfileStack';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import DropdownField from '@components/DropdownField';
import { dismissKeyboardAndThen } from '@utils/keyboard';
import { pickDocument, types } from '@utils/documentPicker';

import styles, { loaderColor } from './style';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { useAuth } from '@context/AuthContext';
import { useUserStore } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import { Toast } from '@utils/ToastManager';
import { getPresignedUrl, uploadToS3, isUploadAborted } from '@utils/awsUploadHelper';
import { getFileIcon } from '@utils/fileUtils';
import AppText from '@components/AppText';
import { debounce } from '@utils/debounce';
import { validateRequired, validateCanadianPostalCode } from '@utils/validation';
import { verticalScale, horizontalScale, } from '@styles/mixins';
import CitySelectionModal from '@components/CitySelectionModal';
import { devDebugger } from '@utils/devDebugger';


type SetupOrganizationScreenNavigationProp = NativeStackNavigationProp<
    ClientProfileStackParamList,
    'setupOrganization'
>;

interface SetupOrganizationScreenProps {
    navigation: SetupOrganizationScreenNavigationProp;
}

const SetupOrganizationScreen: React.FC<SetupOrganizationScreenProps> = ({
    navigation: _navigation,
}) => {
    useBlockBackButton();
    const { updateLastStep, username, completeProfile } = useAuth();
    const settings = useSystemStore(state => state.settings);

    // Form State
    const [address, setAddress] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const [categories, setCategories] = useState<string[]>([]); // Stores selected category IDs
    const [businessCategories, setBusinessCategories] = useState<{ label: string; value: string }[]>([]);

    const { tempFullName } = useUserStore();

    const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);

    const [document, setDocument] = useState<{
        name: string | null;
        uri: string;
        type: string | null;
    } | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);
    const uploadAbortControllerRef = useRef<AbortController | null>(null);

    const [selectedCityId, setSelectedCityId] = useState('');

    useEffect(() => {
        return () => {
            uploadAbortControllerRef.current?.abort();
            uploadAbortControllerRef.current = null;
        };
    }, []);

    // Error State
    const [errors, setErrors] = useState<{
        address?: string;
        categories?: string;
        document?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
    }>({});

    const importIcon = require('@assets/images/common/import.png');

    useEffect(() => {
        fetchCategories();
        fetchProvinces();
        fetchCountry();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await AuthService.getBusinessCategories();
            if (response.success && response.data) {
                // Map API results to {label, value} objects for DropdownField
                const mappedCategories = response.data.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setBusinessCategories(mappedCategories);
            }
        } catch (error) {
            devDebugger.error('[SetupOrganization] Fetch Categories Error:', error);
        }
    };

    //FEtch city

    const fetchCities = () => {
        if (!province) {
            Toast.show({
                type: 'info',
                text2: 'Please select a province first'
            });
            return;
        }
        setIsCityModalVisible(true);
    };

    const fetchProvinces = async () => {
        try {
            const response = await AuthService.getProvinces();
            if (response.success && response.data) {
                // Map API results to {label, value} objects for DropdownField
                const mappedProvinces = response.data.provinces.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setProvinces(mappedProvinces);
            }
        } catch (error) {
            devDebugger.error('[SetupOrganization] Fetch Provinces Error:', error);
        }
    };

    // get Country
    const fetchCountry = async () => {
        try {
            const response = await AuthService.getCountries(1, 100, 'Canada');
            if (response.success && response.data) {
                // Map API results to {label, value} objects for DropdownField
                const mappedCountries = response.data.countries.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setCountries(mappedCountries);
            }
        } catch (error) {
            devDebugger.error('[SetupOrganization] Fetch Countries Error:', error);
        }
    };
    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!address.trim()) {
            newErrors.address = strings.validation.fieldMandatory(strings.auth.client.setupOrg.addressLabel);
        }
        if (categories.length === 0) {
            newErrors.categories = strings.validation.selectAtLeastOne;
        }
        if (!document) {
            newErrors.document = strings.validation.fieldMandatory(strings.auth.client.setupOrg.registrationDocLabel);
        }
        if (!selectedCityId) {
            newErrors.city = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.cityLabel);
        }
        if (!province) {
            newErrors.province = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.provinceLabel);
        }
        if (!country) {
            newErrors.country = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.countryLabel);
        }
        if (!postalCode) {
            newErrors.postalCode = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.postalCodeLabel);
        } else {
            const postalCodeInvalid = validateCanadianPostalCode(postalCode);
            if (postalCodeInvalid) newErrors.postalCode = postalCodeInvalid;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (validateForm()) {
            if (!uploadedUrl) {
                Toast.show({
                    type: 'error',
                    text1: 'Upload Document',
                    text2: 'Please upload business registration document'
                });
                return;
            }
            setIsLoading(true);
            try {
                const response = await AuthService.setupOrganisation({
                    companyAddress: address,
                    city: selectedCityId,
                    province: province,
                    country: country,
                    postalCode: postalCode,
                    businessCategories: categories, // Sending the array directly
                    businessRegistrationDocument: {
                        documentUrl: uploadedUrl
                    }
                });

                if (response.success) {
                    updateLastStep('paymentInfo');
                    dismissKeyboardAndThen(() => completeProfile());
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Setup Failed',
                        text2: response.message || 'Something went wrong'
                    });
                }
            } catch (error: any) {
                Toast.show({
                    type: 'error',
                    text2: error.message || 'Something went wrong'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handlePickDocument = async () => {
        try {
            if (uploadedUrl) return; // Prevent picking if already uploaded

            setErrors(prev => ({ ...prev, document: undefined }));
            const settings = useSystemStore.getState().settings;
            const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
            const minSizeValue = settings?.minDocumentSize || 10;
            const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

            const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
            const maxSizeValue = settings?.maxDocumentSize || 10;
            const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

            const doc = await pickDocument({
                minSize: minSizeInBytes,
                maxSize: maxSizeInBytes,
                allowedTypes: [types.pdf, types.doc, types.docx, types.images]
            });

            if (doc) {
                // Validate PNG if it's an image
                if (doc.type?.startsWith('image/') && doc.type !== 'image/png') {
                    // We could throw here, but types.images usually includes jpg. 
                    // I will allow it for now unless explicitly rejected.
                }

                setDocument({ name: doc.name, uri: doc.uri, type: doc.type });

                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                setIsUploading(true);

                // 1. Get Presigned URL using helper
                const presignedRes = await getPresignedUrl(
                    doc.size || 0,
                    doc.type || 'application/pdf',
                    'organization' as any,
                    controller.signal
                );

                if (controller.signal.aborted) return;

                if (presignedRes?.uploadUrl) {
                    const { uploadUrl } = presignedRes;

                    // 2. Upload to S3 using the utility method
                    await uploadToS3(uploadUrl, doc.uri, doc.type || 'application/pdf', controller.signal);

                    if (controller.signal.aborted) return;

                    // 3. Save final URL
                    setUploadedUrl(presignedRes.key);
                } else {
                    throw new Error('Failed to get upload URL');
                }
            }
        } catch (err: any) {
            if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('[SetupOrg] Upload aborted by user');
                return;
            }
            devDebugger.error('[SetupOrg] Upload error:', err);
            setErrors(prev => ({ ...prev, document: err.message || 'Upload failed' }));
        } finally {
            setIsUploading(false);
            uploadAbortControllerRef.current = null;
        }
    };

    const handleRemoveDocument = () => {
        uploadAbortControllerRef.current?.abort();
        uploadAbortControllerRef.current = null;
        setIsUploading(false);
        setDocument(null);
        setUploadedUrl('');
    };

    const getDisplayFileName = () => {
        if (!uploadedUrl) return '';
        const parts = uploadedUrl.split('/');
        return parts[parts.length - 1];
    };
    // Field-specific validation
    const validateField = React.useCallback((name: string, value: any) => {
        let error = '';
        switch (name) {
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
    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.container}>

                    {/* Scroll Area */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                            <View style={styles.content}>
                                <StatusBar
                                    barStyle="dark-content"
                                    translucent
                                    backgroundColor="transparent"
                                />

                                <AppText style={styles.title}>{strings.auth.client.setupOrg.screenTitle}</AppText>

                                <AppText style={styles.sectionTitle}>{strings.auth.client.setupOrg.sectionTitle}</AppText>

                                <InputField
                                    label={strings.auth.client.setupOrg.addressLabel}
                                    placeholder={strings.auth.client.setupOrg.addressPlaceholder}
                                    value={address}
                                    onChangeText={text => {
                                        setAddress(text);
                                        if (errors.address)
                                            setErrors(prev => ({ ...prev, address: undefined }));
                                    }}
                                    wrapperStyle={styles.inputWrapper}
                                    error={errors.address}
                                    placeholderTextColor="#9CA3AF"
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
                                <DropdownField
                                    label={strings.auth.client.setupOrg.categoryLabel}
                                    placeholder={strings.auth.client.setupOrg.categoryPlaceholder}
                                    data={businessCategories}
                                    value={categories}
                                    onChange={val => {
                                        setCategories(val);
                                        if (errors.categories)
                                            setErrors(prev => ({ ...prev, categories: undefined }));
                                    }}
                                    isMultiSelect={true}
                                    wrapperStyle={styles.inputWrapper}
                                    error={errors.categories}
                                />

                                <AppText style={styles.label}>{strings.auth.client.signup.fullNameLabel}</AppText>
                                <View style={styles.fullNameContainer}>
                                    <AppText style={[styles.fullNameText, !(username || tempFullName) && styles.placeholderText]}>
                                        {username || tempFullName || strings.mock.kelvinDoe}
                                    </AppText>
                                </View>

                                <AppText style={styles.label}>{strings.auth.client.setupOrg.registrationDocLabel}</AppText>

                                <TouchableOpacity
                                    style={[
                                        styles.uploadContainer,
                                        errors.document ? styles.uploadContainerError : null,
                                        (isUploading || uploadedUrl !== '') && { opacity: 0.6 }
                                    ]}
                                    onPress={handlePickDocument}
                                    activeOpacity={0.7}
                                    disabled={isUploading || uploadedUrl !== ''}
                                >
                                    {isUploading ? (
                                        <ActivityIndicator size="small" color={loaderColor} />
                                    ) : (
                                        <>
                                            <View style={styles.uploadIconContainer}>
                                                <Image source={importIcon} style={styles.upload as ImageStyle} />
                                            </View>
                                            <AppText style={styles.uploadText}>{strings.auth.client.setupOrg.uploadPlaceholder}</AppText>
                                            <AppText style={styles.uploadSubText}>{strings.auth.client.setupOrg.uploadSubtitles(settings?.maxDocumentSize || 10, settings?.maxDocumentSizeUnit || 'MB')}</AppText>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {uploadedUrl !== '' && (
                                    <View style={styles.previewContainer}>
                                        <View style={styles.documentThumbnail}>
                                            <Image
                                                source={getFileIcon(uploadedUrl || document?.uri)}
                                                style={styles.documentIcon}
                                            />
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
                                        </View>
                                        <AppText style={styles.fileName} numberOfLines={2}>
                                            {getDisplayFileName()}
                                        </AppText>
                                    </View>
                                )}
                                {errors.document ? (
                                    <AppText style={styles.errorText}>
                                        {errors.document}
                                    </AppText>
                                ) : null}
                            </View>
                        </TouchableWithoutFeedback>

                    </ScrollView>


                </View>
            </KeyboardAvoidingView>
                {/* Bottom Fixed Section */}
                <View style={styles.buttonWrapper}>
                    <LoginButton
                        text={strings.common.next}
                        onPress={handleNext}
                        loading={isLoading}
                        disabled={isLoading || isUploading}
                    />
                </View>

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

export default SetupOrganizationScreen;
