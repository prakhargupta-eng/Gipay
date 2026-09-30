import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';

import FastImage from 'react-native-fast-image';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';
import DropdownField from '@components/DropdownField';
import DatePicker from 'react-native-date-picker';
import { formatDateYYYYMMDD, validateRequired, validateCanadianPostalCode, validateAge18 } from '@utils/validation';
import { formatDOBLocally, parseDOBToLocalDate } from '@utils/dateUtils';
import { showImagePickerOptions, CapturedImage } from '@utils/cameraPicker';
import { debounce } from '@utils/debounce';

import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import { getPresignedUrl, uploadToS3, isUploadAborted } from '@utils/awsUploadHelper';
import AppText from '@components/AppText';
import CitySelectionModal from '@components/CitySelectionModal';
import CountrySelectionModal from '@components/CountrySelectionModal';
import { devDebugger } from '@utils/devDebugger';


const YES_NO_OPTIONS = ['Yes', 'No'];

interface Step1Props {
    onNext: () => void;
    onBack: () => void;
}

const CompleteProfileStep1: React.FC<Step1Props> = ({ onNext, onBack: _onBack }) => {
    const eighteenYearsAgo = React.useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d;
    }, []);

    const [dob, setDob] = useState('');
    const [dobDate, setDobDate] = useState(eighteenYearsAgo);
    const [resAddress, setResAddress] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [citizenship, setCitizenship] = useState('');
    const [workPermit, setWorkPermit] = useState('');
    const [visaStatus, setVisaStatus] = useState('');
    const [profileImage, setProfileImage] = useState<CapturedImage | null>(null);
    const [originalImageKey, setOriginalImageKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const uploadAbortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            uploadAbortControllerRef.current?.abort();
            uploadAbortControllerRef.current = null;
        };
    }, []);

    // API Data state
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
    const [canadaCountry, setCanadaCountry] = useState<{ label: string; value: string }[]>([]);
    const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
    
    // Modal State
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);
    const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedCountryId, setSelectedCountryId] = useState('');
    const [selectedCitizenshipId, setSelectedCitizenshipId] = useState('');

    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    //
    const { userId, updateLastStep } = useAuth();

    React.useEffect(() => {
        updateLastStep('CompleteProfileStep1');
        fetchCountries();
        fetchCanadaCountry();
        fetchProvinces();
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    React.useEffect(() => {
        if (province && !selectedProvinceId && provinces.length > 0) {
            const match = provinces.find(p => p.label === province);
            if (match) setSelectedProvinceId(match.value);
            else if (provinces.find(p => p.value === province)) setSelectedProvinceId(province);
        }
    }, [province, provinces]);

    React.useEffect(() => {
        if (country && !selectedCountryId && countries.length > 0) {
            const match = countries.find(c => c.label === country);
            if (match) setSelectedCountryId(match.value);
            else if (countries.find(c => c.value === country)) setSelectedCountryId(country);
        }
    }, [country, countries]);

    React.useEffect(() => {
        if (citizenship && !selectedCitizenshipId && countries.length > 0) {
            const match = countries.find(c => c.label === citizenship);
            if (match) setSelectedCitizenshipId(match.value);
            else if (countries.find(c => c.value === citizenship)) setSelectedCitizenshipId(citizenship);
        }
    }, [citizenship, countries]);

    const fetchCountries = async () => {
        try {
            const response = await AuthService.getCountries();
            if (response.success && response.data) {
                const mappedCountries = response.data.countries.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setCountries(mappedCountries);
            }
        } catch (error) {
            devDebugger.error('[CompleteProfile] Fetch Countries Error:', error);
        }
    };

    const fetchCanadaCountry = async () => {
        try {
            const response = await AuthService.getCountries(1, 10, 'Canada');
            if (response.success && response.data) {
                const mappedCountries = response.data.countries.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setCanadaCountry(mappedCountries);
            }
        } catch (error) {
            devDebugger.error('[CompleteProfile] Fetch Canada Country Error:', error);
        }
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
            devDebugger.error('[CompleteProfile] Fetch Provinces Error:', error);
        }
    };

    const fetchCities = async (provId: string) => {
        if (!provId) {
            Toast.show({
                type: 'info',
                text2: 'Please select a province first'
            });
            return;
        }
        setIsCityModalVisible(true);
    };

    const fetchProfile = async () => {
        try {
            const response = await ContractorService.getProfileInfo(userId!);
            if (response.success && response.data) {
                const initialData = response.data.profile?.identityVerification;
                const workerEligibility = response.data.profile?.workerEligibility;
                if (initialData) {
                    if (initialData.dateOfBirth) {
                        const date = parseDOBToLocalDate(initialData.dateOfBirth);
                        setDobDate(date);
                        setDob(formatDOBLocally(date));
                    }
                    setResAddress(initialData.residentialAddress || '');
                    setStreetAddress(initialData.address?.street || initialData.street || '');

                    const cityObj = initialData.address?.city || initialData.city;
                    const provObj = initialData.address?.province || initialData.province;
                    const countryObj = initialData.address?.country || initialData.country;

                    setCity(cityObj?.name || cityObj || '');
                    setSelectedCityId(cityObj?._id || cityObj?.id || '');

                    setProvince(provObj?._id || provObj?.id || provObj || '');
                    setSelectedProvinceId(provObj?._id || provObj?.id || provObj || '');

                    setPostalCode(initialData.address?.postalCode || initialData.postalCode || '');

                    setCountry(countryObj?.name || countryObj || 'Canada');
                    setSelectedCountryId(countryObj?._id || countryObj?.id || '');

                    if (workerEligibility) {
                        const citObj = workerEligibility.citizenshipStatus;
                        setCitizenship(citObj?.name || citObj || '');
                        setSelectedCitizenshipId(citObj?._id || citObj?.id || '');

                        setWorkPermit(workerEligibility.workPermit || '');
                        setVisaStatus(workerEligibility.visaStatus || '');
                    }

                    const imageToShow = [initialData.profileImageUrl, initialData.profileImage].find(
                        (url) => typeof url === 'string' && url.trim() !== '' && url.startsWith('http')
                    );
                    if (imageToShow) {
                        setProfileImage({ uri: imageToShow } as any);
                    }
                    if (initialData.profileImage) {
                        setOriginalImageKey(initialData.profileImage);
                    }
                }
            }
        } catch (error) {
            devDebugger.log('[Step1] Fetch Profile Error:', error);
        }
    };
    
    // Field-specific validation
    const validateField = React.useCallback((name: string, value: any) => {
        let error = '';
        switch (name) {
            case 'dob':
                error = validateAge18(value);
                break;
            case 'resAddress':
                error = validateRequired(value, strings.auth.contractor.completeProfile.resAddressLabel);
                if (!error && value.trim().length < 5) error = strings.validation.invalidAddress;
                break;
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
            case 'citizenship':
                error = validateRequired(value, strings.auth.contractor.completeProfile.citizenshipStatusLabel);
                break;
            case 'workPermit':
                error = validateRequired(value, strings.auth.contractor.completeProfile.workPermitLabel);
                break;
            case 'visaStatus':
                error = validateRequired(value, strings.auth.contractor.completeProfile.visaStatusLabel);
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


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Date of Birth
        const dobError = validateAge18(dobDate);
        if (dobError) newErrors.dob = dobError;

        // Residential Address
        const resAddressRequired = validateRequired(resAddress, strings.auth.contractor.completeProfile.resAddressLabel);
        if (resAddressRequired) {
            newErrors.resAddress = resAddressRequired;
        } else if (resAddress.trim().length < 5) {
            newErrors.resAddress = strings.validation.invalidAddress;
        }

        // Street Address
        const streetAddressRequired = validateRequired(streetAddress, strings.auth.contractor.completeProfile.streetAddressLabel);
        if (streetAddressRequired) {
            newErrors.streetAddress = streetAddressRequired;
        } else if (streetAddress.trim().length < 5) {
            newErrors.streetAddress = strings.validation.invalidStreetAddress;
        }

        // City
        const cityRequired = validateRequired(city, strings.auth.contractor.completeProfile.cityLabel);
        if (cityRequired) {
            newErrors.city = cityRequired;
        }

        // Province & Postal Code
        const provinceRequired = validateRequired(province, strings.auth.contractor.completeProfile.provinceLabel);
        if (provinceRequired) newErrors.province = provinceRequired;

        const postalCodeRequired = validateRequired(postalCode, strings.auth.contractor.completeProfile.postalCodeLabel);
        if (postalCodeRequired) {
            newErrors.postalCode = postalCodeRequired;
        } else {
            const postalCodeInvalid = validateCanadianPostalCode(postalCode);
            if (postalCodeInvalid) newErrors.postalCode = postalCodeInvalid;
        }

        // Country
        const countryRequired = validateRequired(country, strings.auth.contractor.completeProfile.countryLabel);
        if (countryRequired) {
            newErrors.country = countryRequired;
        } else if (country.trim().length < 2) {
            newErrors.country = strings.validation.invalidCountry;
        }

        // Dropdowns
        newErrors.citizenship = validateRequired(citizenship, strings.auth.contractor.completeProfile.citizenshipStatusLabel);
        newErrors.workPermit = validateRequired(workPermit, strings.auth.contractor.completeProfile.workPermitLabel);
        newErrors.visaStatus = validateRequired(visaStatus, strings.auth.contractor.completeProfile.visaStatusLabel);

        // Remove empty strings from the errors object
        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAndContinue = async () => {
        if (validateForm()) {
            Keyboard.dismiss();
            setIsLoading(true);

            try {
                let profileImageKey = '';

                // 1. Handle Profile Image Upload to S3 (if image exists and is new)
                if (profileImage?.uri) {
                    if (profileImage.uri.startsWith('http')) {
                        // Image is already on server, use existing key or the URL itself as fallback
                        profileImageKey = originalImageKey || profileImage.uri;
                    } else {
                        // Image is local, upload to S3
                        uploadAbortControllerRef.current?.abort();
                        const controller = new AbortController();
                        uploadAbortControllerRef.current = controller;

                        const res = await getPresignedUrl(profileImage.size || 1024 * 50, 'image/jpeg', 'contractor', controller.signal);

                        if (controller.signal.aborted) return;

                        if (res?.uploadUrl) {
                            await uploadToS3(res.uploadUrl, profileImage.uri, 'image/jpeg', controller.signal);
                            if (controller.signal.aborted) return;
                            profileImageKey = res.key;
                        } else {
                            throw new Error('Failed to get upload URL');
                        }
                    }
                }

                // If image was selected but upload failed (no key), don't proceed
                if (profileImage && !profileImageKey) {
                    // Fallback: if we have a remote URI but no key (shouldn't happen with above logic), 
                    // we might need to handle it, but for now we throw error.
                    throw new Error(strings.auth.contractor.completeProfile.imageUploadFailed);
                }

                // 2. Submit Identity Data
                const response = await AuthService.addIdentity({
                    dateOfBirth: formatDateYYYYMMDD(dobDate),
                    residentialAddress: resAddress,
                    street: streetAddress,
                    city: selectedCityId,
                    province: selectedProvinceId,
                    postalCode: postalCode,
                    country: selectedCountryId,
                    citizenshipStatus: selectedCitizenshipId,
                    workPermit: workPermit,
                    visaStatus: visaStatus,
                    profileImage: profileImageKey, // Send the S3 key instead of local URI
                });

                if (response.success) {
                    onNext();
                } else {
                    Toast.show({
                        type: 'error',
                        text1: strings.common.error,
                        text2: response.message || strings.auth.contractor.completeProfile.saveFailedIdentity,
                    });
                }
            } catch (error: any) {
                if (isUploadAborted(error, uploadAbortControllerRef.current?.signal)) {
                    devDebugger.log('[Step1] Upload aborted by user');
                    return;
                }
                devDebugger.error('[Step1] Save Error:', error);
                Toast.show({
                    type: 'error',
                    text1: strings.common.error,
                    text2: error.message || strings.auth.contractor.signup.somethingWentWrong,
                });
            } finally {
                setIsLoading(false);
                uploadAbortControllerRef.current = null;
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >

                        <View style={styles.container}>
                            <View style={styles.topSection}>
                                <AppText style={styles.sectionTitle}>{strings.auth.contractor.completeProfile.identityInformation}</AppText>

                                {/* ── Profile Picture ── */}
                                <View style={styles.profilePicSection}>
                                    <View style={styles.profilePicWrapper}>
                                        <View style={styles.profilePicContainerWrapper}>
                                            <TouchableOpacity
                                                style={styles.profilePicContainer}
                                                onPress={() => {
                                                    if (isLoading) return;
                                                    showImagePickerOptions((result) => {
                                                        if (result) {
                                                            setProfileImage(result);
                                                            if (errors.profileImage) setErrors(prev => ({ ...prev, profileImage: '' }));
                                                        }
                                                    });
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                {profileImage ? (
                                                    <FastImage source={{ uri: profileImage.uri }} style={styles.profilePic} />
                                                ) : (
                                                    <View style={styles.placeholderPic}>
                                                        <Image
                                                            source={require('@assets/images/contractor/UploadProfile.png')}
                                                            style={styles.placeholderIcon}
                                                            resizeMode="contain"
                                                        />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                            {profileImage && (
                                                <TouchableOpacity
                                                    style={styles.removeImageButton}
                                                    onPress={() => {
                                                        if (isLoading) return;
                                                        setProfileImage(null);
                                                        setOriginalImageKey('');
                                                    }}
                                                    activeOpacity={0.7}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                >
                                                    <Image
                                                        source={require('@assets/images/common/close.png')}
                                                        style={styles.removeIconImg}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <AppText style={styles.uploadProfileText}>{strings.auth.contractor.completeProfile.uploadProfilePicture}</AppText>
                                        {!!errors.profileImage && <AppText style={styles.errorText}>{errors.profileImage}</AppText>}
                                    </View>
                                </View>


                                <TouchableOpacity onPress={() => setOpenDatePicker(true)} activeOpacity={0.7}>
                                    <View pointerEvents="none">
                                        <InputField
                                            label={strings.auth.contractor.completeProfile.dobLabel}
                                            placeholder={strings.auth.contractor.completeProfile.selectDob}
                                            value={dob}
                                            editable={false}
                                            disabled={isLoading}
                                            error={errors.dob}
                                            wrapperStyle={styles.inputWrapper}
                                            renderRightIcon={() => (
                                                <Image
                                                    source={require('@assets/images/common/calander.png')}
                                                    style={styles.calendarIcon}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <InputField
                                    label={strings.auth.contractor.completeProfile.resAddressLabel}
                                    placeholder={strings.auth.contractor.completeProfile.enterAddress}
                                    value={resAddress}
                                    onChangeText={(val) => {
                                        setResAddress(val);
                                        debouncedValidateField('resAddress', val);
                                    }}
                                    editable={!isLoading}
                                    error={errors.resAddress}
                                    wrapperStyle={styles.inputWrapper}
                                />

                                <InputField
                                    label={strings.auth.contractor.completeProfile.streetAddressLabel}
                                    placeholder={strings.auth.contractor.completeProfile.enterAddress}
                                    value={streetAddress}
                                    onChangeText={(val) => {
                                        setStreetAddress(val);
                                        debouncedValidateField('streetAddress', val);
                                    }}
                                    editable={!isLoading}
                                    error={errors.streetAddress}
                                    wrapperStyle={styles.inputWrapper}
                                />

                                <View style={styles.row}>
                                    <DropdownField
                                        label={strings.auth.contractor.completeProfile.countryLabel}
                                        placeholder={strings.auth.contractor.completeProfile.enterCountry}
                                        value={selectedCountryId }
                                        disabled={isLoading}
                                        onChange={(val) => {
                                            setSelectedCountryId(val);
                                            setCountry(val);
                                            validateField('country', val);
                                        }}
                                        data={canadaCountry}
                                        error={errors.country}
                                        wrapperStyle={[styles.inputWrapper, { flex: 1, marginRight: horizontalScale(10) }]}
                                        labelStyle={{ marginBottom: verticalScale(12) }}
                                        errorTextStyle={{ marginTop: verticalScale(6) }}
                                    />
                                    <DropdownField
                                        label={strings.auth.contractor.completeProfile.provinceLabel}
                                        placeholder={strings.auth.contractor.completeProfile.enterProvince}
                                        value={selectedProvinceId || province}
                                        disabled={isLoading}
                                        onChange={(val) => {
                                            setSelectedProvinceId(val);
                                            setProvince(val);
                                            setSelectedCityId('');
                                            setCity('');
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
                                            fetchCities(selectedProvinceId);
                                        }}
                                        style={{ flex: 1, marginRight: horizontalScale(10) }}
                                    >
                                        <View pointerEvents="none" style={{ flex: 1 }}>
                                            <InputField
                                                label={strings.auth.contractor.completeProfile.cityLabel}
                                                placeholder={strings.auth.contractor.completeProfile.enterCity || 'Select City'}
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

                                <AppText style={styles.sectionTitle}>{strings.auth.contractor.completeProfile.workEligibility}</AppText>

                                <TouchableOpacity 
                                    activeOpacity={0.7} 
                                    onPress={() => setIsCountryModalVisible(true)}
                                >
                                    <View pointerEvents="none">
                                        <InputField
                                            label={strings.auth.contractor.completeProfile.citizenshipStatusLabel}
                                            placeholder={strings.auth.contractor.completeProfile.selectCitizenship}
                                            value={citizenship}
                                            editable={false}
                                            error={errors.citizenship}
                                            wrapperStyle={styles.inputWrapper}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <DropdownField
                                    label={strings.auth.contractor.completeProfile.workPermitLabel}
                                    placeholder={strings.auth.contractor.completeProfile.selectWorkPermit}
                                    value={workPermit}
                                    disabled={isLoading}
                                    onChange={(val) => {
                                        setWorkPermit(val);
                                        validateField('workPermit', val);
                                    }}
                                    error={errors.workPermit}
                                    data={YES_NO_OPTIONS}
                                    wrapperStyle={styles.inputWrapper}
                                />

                                <DropdownField
                                    label={strings.auth.contractor.completeProfile.visaStatusLabel}
                                    placeholder={strings.auth.contractor.completeProfile.selectVisaStatus}
                                    value={visaStatus}
                                    disabled={isLoading}
                                    onChange={(val) => {
                                        setVisaStatus(val);
                                        validateField('visaStatus', val);
                                    }}
                                    error={errors.visaStatus}
                                    data={YES_NO_OPTIONS}
                                    wrapperStyle={styles.inputWrapper}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </ScrollView>

            <View style={[styles.buttonWrapper]}>
                <LoginButton
                    text={strings.auth.contractor.completeProfile.saveAndContinue}
                    onPress={handleSaveAndContinue}
                    loading={isLoading}
                    disabled={isLoading}
                />
            </View>
            <CitySelectionModal
                visible={isCityModalVisible}
                provinceId={selectedProvinceId}
                onClose={() => setIsCityModalVisible(false)}
                selectedCityId={selectedCityId}
                onSelect={(item) => {
                    setSelectedCityId(item.value);
                    setCity(item.label);
                    validateField('city', item.label);
                    setIsCityModalVisible(false);
                }}
            />

            <CountrySelectionModal
                visible={isCountryModalVisible}
                onClose={() => setIsCountryModalVisible(false)}
                title="Select Citizenship"
                selectedCountryId={selectedCitizenshipId}
                onSelect={(item) => {
                    setSelectedCitizenshipId(item.value);
                    setCitizenship(item.label);
                    validateField('citizenship', item.label);
                    setIsCountryModalVisible(false);
                }}
            />

            <DatePicker
                modal
                open={openDatePicker}
                date={dobDate}
                mode="date"
                maximumDate={eighteenYearsAgo} // Disable future dates and enforce age >= 18
                onConfirm={(date) => {
                    setOpenDatePicker(false);
                    setDobDate(date);
                    setDob(formatDOBLocally(date));
                    validateField('dob', date);
                }}
                onCancel={() => {
                    setOpenDatePicker(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: verticalScale(40)
    },
    container: {
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
    },
    title: {
        fontSize: fontSize(24),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    stepText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#9CA3AF',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: verticalScale(10),
        marginHorizontal: horizontalScale(20),
        width: SCREEN_WIDTH - horizontalScale(40),
        marginBottom: verticalScale(20),
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.green,
        borderRadius: 2,
    },
    topSection: {
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(20),
    },
    sectionTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginTop: verticalScale(10),
        marginBottom: verticalScale(15),
    },
    inputWrapper: {
        marginBottom: verticalScale(15),
    },
    row: {
        flexDirection: 'row',
    },
    buttonWrapper: {
        paddingBottom: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.white,
        position: 'relative',

    },
    calendarIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
    },
    profilePicSection: {
        alignItems: 'center',
        marginVertical: verticalScale(20),
    },
    profilePicWrapper: {
        alignItems: 'center',
    },
    profilePicContainerWrapper: {
        position: 'relative',
    },
    profilePicContainer: {
        width: horizontalScale(110),
        height: horizontalScale(110),
        borderRadius: horizontalScale(55),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#9CA3AF',
        overflow: 'hidden',
    },
    removeImageButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        width: horizontalScale(24),
        height: horizontalScale(24),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    removeIconImg: {
        width: horizontalScale(24),
        height: horizontalScale(24),
    },
    profilePic: {
        width: '100%',
        height: '100%',
        borderRadius: horizontalScale(55),
    },
    placeholderPic: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        width: horizontalScale(50),
        height: horizontalScale(50),
    },
    uploadProfileText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: '#ABB5C5',
        marginTop: verticalScale(12),
    },
    errorText: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: colors.red,
        marginTop: verticalScale(5),
    },
});

export default CompleteProfileStep1;
