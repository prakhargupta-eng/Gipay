import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
    Alert
} from 'react-native';
import colors from '@styles/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import { useUserStore } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import { useAuth } from '@context/AuthContext';
import { Toast } from '@utils/ToastManager';
import DatePicker from 'react-native-date-picker';
import { showImagePickerOptions } from '@utils/cameraPicker';
import { pickDocument, types } from '@utils/documentPicker';
import { formatDateYYYYMMDD, validateCanadianPostalCode } from '@utils/validation';
import { formatDOBLocally, parseDOBToLocalDate } from '@utils/dateUtils';
import ContractorService from '@config/contractorService';
import AuthService from '@config/authService';
import TopHeader from '@components/TopHeader';
import CustomButton from '@components/CustomButton';
import CitySelectionModal from '@components/CitySelectionModal';
import CountrySelectionModal from '@components/CountrySelectionModal';
import strings from '@constants/strings';
import styles from './styles';
import { getPresignedUrl, uploadToS3, isUploadAborted } from '@utils/awsUploadHelper';
import { horizontalScale } from '@styles/mixins';
import SkeletonFrame from '@components/SkeletonFrame';


// Components
import ProfileHeader from './components/ProfileHeader';
import EditMode from './components/EditMode';
import ViewMode from './components/ViewMode';
import { devDebugger } from '@utils/devDebugger';

type ProfileDetailsRouteProp = RouteProp<ContractorAppStackParamList, 'ProfileDetails'>;
type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileDetailsSkeleton = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
            <SkeletonFrame width={horizontalScale(110)} height={horizontalScale(110)} borderRadius={horizontalScale(55)} />
            <SkeletonFrame width={150} height={24} style={{ marginTop: 20 }} />
        </View>

        <View style={styles.infoCard}>
            {[1, 2, 3, 4, 5].map((i) => (
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

        <SkeletonFrame width={150} height={20} style={{ marginTop: 24, marginBottom: 12 }} />
        <SkeletonFrame width="100%" height={100} borderRadius={12} />
    </ScrollView>
);

const ProfileDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ProfileDetailsRouteProp>();
    const { profile, setProfile } = useUserStore();
    const { settings, fetchSettings } = useSystemStore();
    const { userId, signOut } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [hasSyncedInitial, setHasSyncedInitial] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    // Profile Data States
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [dobDate, setDobDate] = useState(new Date());
    const [workCategory, setWorkCategory] = useState('');
    const [workCategoryId, setWorkCategoryId] = useState('');
    const [experience, setExperience] = useState('');

    // Address & Eligibility States
    const [resAddress, setResAddress] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [province, setProvince] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Canada');
    const [selectedCountryId, setSelectedCountryId] = useState('');

    const [availability, setAvailability] = useState<string[]>([]);
    const [hourlyRate, setHourlyRate] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1');

    const [citizenshipStatus, setCitizenshipStatus] = useState('N/A');
    const [selectedCitizenshipId, setSelectedCitizenshipId] = useState('');
    const [workPermit, setWorkPermit] = useState('N/A');
    const [visaStatus, setVisaStatus] = useState('N/A');
    const [newSkill, setNewSkill] = useState('');

    // UI Helpers
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(null);
    const [resumeDoc, setResumeDoc] = useState<any>(null);
    const [licenseDoc, setLicenseDoc] = useState<any>(null);
    const [agreementDoc, setAgreementDoc] = useState<any>(null);
    const [emailVerified, setEmailVerified] = useState(true);
    const [phoneNumberVerified, setPhoneNumberVerified] = useState(true);

    const [updatedEmail, setupdatedEmail] = useState(false);
    const [updatedMobile, setupdatedMobile] = useState(false);

    const [categories, setCategories] = useState<{ label: string; value: string; id: string }[]>([]);
    const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
    const [canadaCountry, setCanadaCountry] = useState<{ label: string; value: string }[]>([]);
    const [isPicking, setIsPicking] = useState(false);

    // Modals
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);
    const [isCitizenshipModalVisible, setIsCitizenshipModalVisible] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const uploadAbortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            uploadAbortControllerRef.current?.abort();
            uploadAbortControllerRef.current = null;
        };
    }, []);

    const s = strings.auth.contractor.profileDetails;

    // Initial Data Sync
    useEffect(() => {
        if (!hasSyncedInitial && profile) {
            syncProfileData(true);
            setHasSyncedInitial(true);
        } else if (profile) {
            syncProfileData(false);
        }
    }, [profile]);

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
        if (provinces.length === 0) {
            fetchProvinces();
        }
        if (canadaCountry.length === 0) {
            fetchCanadaCountry();
        }
        // Fetch latest profile info on mount
        const init = async () => {
            setIsLoading(true);
            await fetchLatestProfile();
            setIsLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Sync verification status when email/phone matches the store (e.g. after OTP)
    useEffect(() => {
        const storeEmail = profile?.user?.email || '';
        const storeEmailVerified = profile?.user?.isEmailVerified || false;
        if (email === storeEmail && storeEmailVerified) {
            setEmailVerified(true);
        }
    }, [email, profile?.user?.email, profile?.user?.isEmailVerified]);

    useEffect(() => {
        const storePhone = (profile?.user?.mobile || '').replace(/^\+1/, '');
        const storePhoneVerified = profile?.user?.isMobileVerified || false;
        if (phoneNumber === storePhone && storePhoneVerified) {
            setPhoneNumberVerified(true);
        }
    }, [phoneNumber, profile?.user?.mobile, profile?.user?.isMobileVerified]);


    const fetchCategories = async () => {
        try {
            const res = await AuthService.getWorkCategories();
            if (res.success && Array.isArray(res.data)) {
                const formatted = res.data.map((cat: any) => ({
                    label: cat.name,
                    value: cat.id || cat._id,
                    id: cat.id || cat._id
                }));
                setCategories(formatted);
            }
        } catch (error) {
            devDebugger.log('Error fetching categories:', error);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await AuthService.getProvinces();
            if (response.success && response.data) {
                const dataArray: any[] = Array.isArray(response.data) ? response.data : ((response.data as any).provinces || response.data);
                if (Array.isArray(dataArray)) {
                    const formatted = dataArray.map((p: any) => ({
                        label: p.name,
                        value: p._id || p.id
                    }));
                    setProvinces(formatted);
                }
            }
        } catch (error) {
            devDebugger.log('[ProfileDetails] Provinces Fetch Error:', error);
        }
    };

    const fetchCanadaCountry = async () => {
        try {
            const response = await AuthService.getCountries(1, 100, 'Canada');
            if (response.success && response.data?.countries) {
                const formatted = response.data.countries.map((c: any) => ({
                    label: c.name,
                    value: c._id || c.id
                }));
                setCanadaCountry(formatted);
            }
        } catch (error) {
            devDebugger.log('[ProfileDetails] Canada Fetch Error:', error);
        }
    };

    const syncProfileData = (isInitial = false) => {
        if (profile) {
            const user = profile.user || {};
            const details = profile.profile || {};
            const professional = details.professionalProfile || {};
            const identity = details.identityVerification || {};
            const docs = details.documents || details;

            if (isInitial || !isEditMode) {
                const fullNameVal = user.fullName || user.fullname || '';

                setFirstName(fullNameVal || '');

                setEmail(user.email || '');

                const dobVal = identity.dateOfBirth || identity.dob;
                if (dobVal) {
                    const date = parseDOBToLocalDate(dobVal);
                    setDobDate(date);
                    setDob(formatDOBLocally(date));
                }

                const rawCat: any = professional.workCategory;
                setWorkCategoryId(rawCat?.id || '');
                setWorkCategory(rawCat?.name || (typeof rawCat === 'string' ? rawCat : ''));

                setExperience(String(professional.experience || ''));

                const addrObj = identity.address || {};

                setResAddress(identity.residentialAddress || '');
                setStreetAddress(addrObj.street || '');
                setPostalCode(addrObj.postalCode || '');

                const cityObj = addrObj.city;
                setCity((cityObj as any)?.name || cityObj || '');
                setSelectedCityId((cityObj as any)?._id || (cityObj as any)?.id || '');

                const provObj = addrObj.province;
                setProvince((provObj as any)?.name || provObj || '');
                setSelectedProvinceId((provObj as any)?._id || (provObj as any)?.id || '');

                const countryObj = addrObj.country;
                setCountry((countryObj as any)?.name || countryObj || 'Canada');
                setSelectedCountryId((countryObj as any)?._id || (countryObj as any)?.id || '');
            }
            if (isInitial || !isEditMode) {
                setEmailVerified(user.isEmailVerified || false);
            }

            const phone = user.mobile || details.phoneNumber || '';
            const cleanPhone = phone.startsWith('+1') ? phone.replace('+1', '') : phone;

            // Update phone if initial sync, not in edit mode, or if phone changed via verification
            const shouldUpdatePhone = (isInitial || !isEditMode) ||
                (cleanPhone && cleanPhone !== phoneNumber && user.isMobileVerified);

            if (shouldUpdatePhone) {
                setPhoneNumber(cleanPhone);
                setPhoneNumberVerified(user.isMobileVerified || false);
            }

            if (user.isEmailUpdated) {
                setupdatedEmail(true);
            }
            if (user.isMobileUpdated) {
                setupdatedMobile(true);
            }

            setAvailability(professional.availabilityDays || []);
            setHourlyRate(String(professional.hourlyRate || ''));
            setPortfolioUrl(docs.portfolioUrl || professional.portfolioUrl || '');

            setSkills(professional.skills || []);

            const workerEligibility = details.workerEligibility || {};
            const citObj = workerEligibility.citizenshipStatus;
            setCitizenshipStatus((citObj as any)?.name || citObj || 'N/A');
            setSelectedCitizenshipId((citObj as any)?._id || (citObj as any)?.id || '');
            setWorkPermit(workerEligibility.workPermit || 'N/A');
            setVisaStatus(workerEligibility.visaStatus || 'N/A');

            const profileImg = [
                user.profileImageUrl,
                details.profileImageUrl,
                identity.profileImageUrl,
                (profile as any)?.profileImageUrl,
                identity.profileImage,
                (details as any)?.profileImage,
                (profile as any)?.profileImage
            ].find(url => typeof url === 'string' && url.trim() !== '');

            if (profileImg) {
                // Add a cache-busting timestamp to force FastImage to reload if the URL string is identical
                const timestampedUrl = profileImg.startsWith('http')
                    ? (profileImg.includes('?') ? `${profileImg}&t=${new Date().getTime()}` : `${profileImg}?t=${new Date().getTime()}`)
                    : profileImg;
                setProfileImage({ uri: timestampedUrl });
            } else {
                setProfileImage(null);
            }

            if (docs.resumeUrl) {
                setResumeDoc({
                    documentName: docs.resumeUrl.split('?')[0].split('/').pop() || 'Resume.pdf',
                    documentUrl: docs.resumeUrl
                });
            }
            if (docs.professionalLicenseUrl) {
                setLicenseDoc({
                    documentName: docs.professionalLicenseUrl.split('?')[0].split('/').pop() || 'License.pdf',
                    documentUrl: docs.professionalLicenseUrl
                });
            } else {
                setLicenseDoc('License.pdf')
            }
            if (docs.agreementUrl) {
                setAgreementDoc({
                    documentName: docs.agreementUrl.split('?')[0].split('/').pop() || 'Agreement.pdf',
                    documentUrl: docs.agreementUrl
                });
            }

        }
    };

    const fetchLatestProfile = async () => {
        const id = userId || profile?.user?._id;
        if (!id) return;

        try {
            const res = await ContractorService.getProfileInfo(id);
            if (res.success && res.data) {
                setProfile(res.data);
            }
        } catch (error) {
            devDebugger.log('Error refreshing profile:', error);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            setIsVerifyingEmail(true);
            const res = await AuthService.updateEmail(email);
            if (res.success && res.data) {
                navigation.navigate('verifyCode', {
                    email: email,
                    otpId: res.data.otpId || (res.data as any)._id,
                    expiresIn: res.data.expiresIn,
                    flowType: 'profileUpdate'
                });
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: res.message });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    const handleVerifyPhone = async () => {
        if (phoneNumber.length < 10) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Phone Number',
                text2: 'Phone number must be exactly 10 digits.'
            });
            return;
        }

        try {
            setIsVerifyingPhone(true);
            const cleanCountryCode = parseInt(countryCode.replace(/\D/g, ''), 10) || 1;
            const res = await AuthService.updateMobile(phoneNumber, cleanCountryCode);
            if (res.success && res.data) {
                navigation.navigate('verifyCode', {
                    email: email,
                    mobile: phoneNumber,
                    countryCode: cleanCountryCode,
                    otpId: res.data.otpId || (res.data as any)._id,
                    expiresIn: 59,
                    flowType: 'profileUpdate'
                });
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: res.message });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setIsVerifyingPhone(false);
        }
    };

    const toggleEditMode = () => {

        if (isEditMode) {
            syncProfileData();
            setErrors({});
        } else {
            setupdatedEmail(false);
            setupdatedMobile(false);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEditMode(!isEditMode);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!selectedCityId) {
            newErrors.city = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.cityLabel);
        }
        if (!selectedProvinceId) {
            newErrors.province = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.provinceLabel);
        }
        if (!country || !selectedCountryId) {
            newErrors.country = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.countryLabel);
        }
        
        if (!postalCode) {
            newErrors.postalCode = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.postalCodeLabel);
        } else {
            const pcError = validateCanadianPostalCode(postalCode);
            if (pcError) newErrors.postalCode = pcError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        const isPhoneChanged = phoneNumber !== (profile?.user?.mobile || '').replace(/^\+1/, '');
        const isEmailChanged = email !== profile?.user?.email;

        if (!validateForm()) {
            Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all mandatory fields correctly.' });
            return;
        }

        if (isEmailChanged && !emailVerified) {
            Toast.show({ type: 'info', text1: 'Verification Needed', text2: 'Please verify your new email first.' });
            return;
        }

        if (isPhoneChanged && !phoneNumberVerified) {
            Toast.show({ type: 'info', text1: 'Verification Needed', text2: 'Please verify your new phone number first.' });
            return;
        }

        if (selectedProvinceId && !selectedCityId) {
            Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please select a city first before updating.' });
            return;
        }

        try {
            setIsUpdating(true);
            let profileImageKey = profileImage?.uri?.startsWith('http') ? profileImage.uri : '';
            let resumeUrl = resumeDoc?.documentUrl || '';
            let licenseUrl = licenseDoc?.documentUrl || '';
            let agreementUrl = agreementDoc?.documentUrl || '';
            let newImageUploaded = false;

            if (profileImage && profileImage.uri && !profileImage.uri.startsWith('http')) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                const res = await getPresignedUrl(profileImage.size || 1024 * 50, 'image/jpeg', 'contractor', controller.signal);
                if (controller.signal.aborted) return;

                if (res?.uploadUrl) {
                    await uploadToS3(res.uploadUrl, profileImage.uri, 'image/jpeg', controller.signal);
                    if (controller.signal.aborted) return;
                    profileImageKey = res.key; // Use full URL instead of key
                    await AuthService.updateProfileImage(profileImageKey);
                    newImageUploaded = true;
                }
            }

            const payload = {
                firstName: firstName,
                fullName: `${firstName}`.trim(),
                email: email,
                phoneNumber: phoneNumber.replace(countryCode, ''),
                countryCode: countryCode,
                dateOfBirth: formatDateYYYYMMDD(dobDate),
                workCategory: { id: workCategoryId, name: workCategory },
                skills: skills,
                experience: parseInt(experience) || 0,
                residentialAddress: resAddress,
                address: {
                    street: streetAddress,
                    city: selectedCityId,
                    province: selectedProvinceId,
                    country: selectedCountryId,
                    postalCode: postalCode,
                },
                availabilityDays: availability,
                hourlyRate: parseFloat(hourlyRate) || 0,
                profileImage: profileImageKey,
                citizenshipStatus: selectedCitizenshipId,
                workPermit: workPermit,
                visaStatus: visaStatus,
                portfolioUrl: portfolioUrl,
                resumeUrl: resumeUrl,
                professionalLicenseUrl: licenseUrl,
                agreementUrl: agreementUrl
            };

            const response = await ContractorService.updateProfile(payload);
            if (response.success) {

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
                    Toast.show({ type: 'success', text1: 'Success', text2: response.message || 'Profile updated successfully' });
                    // Exit edit mode directly
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsEditMode(false);
                }
                setupdatedEmail(false);
                setupdatedMobile(false);

                // Show loading spinner on the profile image while we fetch the updated profile
                if (newImageUploaded) {
                    setImageLoading(true);
                }

                await fetchLatestProfile();

                // Exit edit mode directly — do NOT use toggleEditMode() here
                // because toggleEditMode calls syncProfileData() which reads the
                // stale `profile` from the closure and would reset the image to the old URL.
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsEditMode(false);
            } else {
                Toast.show({ type: 'error', text1: 'Update Failed', text2: response.message });
            }
        } catch (error: any) {
            if (isUploadAborted(error, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('Profile update aborted by user leaving screen');
                return;
            }
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setIsUpdating(false);
            uploadAbortControllerRef.current = null;
        }
    };

    const handleImagePick = () => {
        if (isPicking) return;
        setIsPicking(true);
        try {
            showImagePickerOptions((result) => {
                if (result) {
                    setProfileImage(result);
                }
                setIsPicking(false);
            });
        } catch (error: any) {
            devDebugger.log('Image pick error:', error);
            setIsPicking(false);
        }
    };

    const handleResumePick = async () => {
        if (isPicking) return;
        setIsPicking(true);
        try {
            const settings = useSystemStore.getState().settings;
            const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
            const minSizeValue = settings?.minDocumentSize || 1;
            const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

            const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
            const maxSizeValue = settings?.maxDocumentSize || 5;
            const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

            const doc = await pickDocument({
                allowedTypes: [types.pdf, types.doc, types.docx],
                minSize: minSizeInBytes,
                maxSize: maxSizeInBytes,
            });
            if (doc) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                const mimeType = doc.type || 'application/pdf';
                Toast.show({ type: 'info', text1: 'Uploading', text2: 'Please wait while we upload your resume...' });
                const res = await getPresignedUrl(doc.size || 1024 * 1024, mimeType, 'contractor-docs', controller.signal);
                if (controller.signal.aborted) return;

                if (res?.uploadUrl) {
                    await uploadToS3(res.uploadUrl, doc.uri, mimeType, controller.signal);
                    if (controller.signal.aborted) return;
                    setResumeDoc({
                        documentName: res.key?.split('/').pop() || doc.name || 'Resume',
                        uri: doc.uri,
                        key: res.key,
                        documentUrl: res.fileUrl // Use full URL instead of key
                    });
                    Toast.show({ type: 'success', text1: 'Success', text2: 'Resume uploaded successfully' });
                }
            }
        } catch (err: any) {
            if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('Resume upload aborted by user');
                return;
            }
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        } finally {
            setIsPicking(false);
            uploadAbortControllerRef.current = null;
        }
    };

    const handleLicensePick = async () => {
        if (isPicking) return;
        setIsPicking(true);
        try {
            const settings = useSystemStore.getState().settings;
            const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
            const minSizeValue = settings?.minDocumentSize || 10;
            const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

            const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
            const maxSizeValue = settings?.maxDocumentSize || 5;
            const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

            const doc = await pickDocument({
                allowedTypes: [types.pdf, types.doc, types.docx],
                minSize: minSizeInBytes,
                maxSize: maxSizeInBytes,
            });
            if (doc) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                const mimeType = doc.type || 'application/pdf';
                Toast.show({ type: 'info', text1: 'Uploading', text2: 'Please wait while we upload your license...' });
                const res = await getPresignedUrl(doc.size || 1024 * 1024, mimeType, 'contractor-docs', controller.signal);
                if (controller.signal.aborted) return;

                if (res?.uploadUrl) {
                    await uploadToS3(res.uploadUrl, doc.uri, mimeType, controller.signal);
                    if (controller.signal.aborted) return;
                    setLicenseDoc({
                        documentName: res.key?.split('/').pop() || doc.name || 'License',
                        uri: doc.uri,
                        key: res.key,
                        documentUrl: res.fileUrl // Use full URL instead of key
                    });
                    Toast.show({ type: 'success', text1: 'Success', text2: 'License uploaded successfully' });
                }
            }
        } catch (err: any) {
            if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('License upload aborted by user');
                return;
            }
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        } finally {
            setIsPicking(false);
            uploadAbortControllerRef.current = null;
        }
    };

    const handleAgreementPick = async () => {
        if (isPicking) return;
        setIsPicking(true);
        try {
            const settings = useSystemStore.getState().settings;
            const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
            const minSizeValue = settings?.minDocumentSize || 10;
            const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

            const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
            const maxSizeValue = settings?.maxDocumentSize || 5;
            const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

            const doc = await pickDocument({
                allowedTypes: [types.pdf, types.doc, types.docx],
                minSize: minSizeInBytes,
                maxSize: maxSizeInBytes,
            });
            if (doc) {
                uploadAbortControllerRef.current?.abort();
                const controller = new AbortController();
                uploadAbortControllerRef.current = controller;

                const mimeType = doc.type || 'application/pdf';
                Toast.show({ type: 'info', text1: 'Uploading', text2: 'Please wait while we upload your agreement...' });
                const res = await getPresignedUrl(doc.size || 1024 * 1024, mimeType, 'contractor-docs', controller.signal);
                if (controller.signal.aborted) return;

                if (res?.uploadUrl) {
                    await uploadToS3(res.uploadUrl, doc.uri, mimeType, controller.signal);
                    if (controller.signal.aborted) return;
                    setAgreementDoc({
                        documentName: res.key?.split('/').pop() || doc.name || 'Agreement',
                        uri: doc.uri,
                        key: res.key,
                        documentUrl: res.fileUrl // Use full URL instead of key
                    });
                    Toast.show({ type: 'success', text1: 'Success', text2: 'Agreement uploaded successfully' });
                }
            }
        } catch (err: any) {
            if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
                devDebugger.log('Agreement upload aborted by user');
                return;
            }
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        } finally {
            setIsPicking(false);
            uploadAbortControllerRef.current = null;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={isEditMode ? s.editTitle : s.viewTitle}
                onBack={() => {
                    if (isEditMode) {
                        syncProfileData(); // Reset unsaved changes (including picked image)
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setIsEditMode(false);
                    } else {
                        navigation.goBack();
                    }
                }
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <ProfileDetailsSkeleton />
                ) : (
                    <>
                        <ProfileHeader
                            isEditMode={isEditMode}
                            imageLoading={imageLoading}
                            profileImage={profileImage}
                            fullName={firstName}
                            profile={profile}
                            onImagePick={handleImagePick}
                            setImageLoading={setImageLoading}
                            s={s}
                            transactionFeePercent={settings?.transactionFeePercent}
                        />

                        {isEditMode ? (
                            <EditMode
                                s={s}
                                firstName={firstName}
                                setFirstName={setFirstName}
                                phoneNumber={phoneNumber}
                                setPhoneNumber={setPhoneNumber}
                                countryCode={countryCode}
                                setCountryCode={setCountryCode}
                                phoneNumberVerified={phoneNumberVerified}
                                setPhoneNumberVerified={setPhoneNumberVerified}
                                isVerifyingPhone={isVerifyingPhone}
                                handleVerifyPhone={handleVerifyPhone}
                                email={email}
                                setEmail={setEmail}
                                emailVerified={emailVerified}
                                setEmailVerified={setEmailVerified}
                                isVerifyingEmail={isVerifyingEmail}
                                handleVerifyEmail={handleVerifyEmail}
                                updatedEmail={updatedEmail}
                                updatedMobile={updatedMobile}
                                dob={dob}
                                setOpenDatePicker={setOpenDatePicker}
                                resAddress={resAddress}
                                setResAddress={setResAddress}
                                streetAddress={streetAddress}
                                setStreetAddress={setStreetAddress}
                                city={city}
                                setCity={setCity}
                                selectedCityId={selectedCityId}
                                setSelectedCityId={setSelectedCityId}
                                province={province}
                                selectedProvinceId={selectedProvinceId}
                                setSelectedProvinceId={setSelectedProvinceId}
                                postalCode={postalCode}
                                setPostalCode={setPostalCode}
                                country={country}
                                selectedCountryId={selectedCountryId}
                                setSelectedCountryId={setSelectedCountryId}
                                provinces={provinces}
                                canadaCountry={canadaCountry}
                                setIsCityModalVisible={setIsCityModalVisible}
                                setIsCitizenshipModalVisible={setIsCitizenshipModalVisible}
                                workCategory={workCategory}
                                workCategoryId={workCategoryId}
                                setWorkCategory={setWorkCategory}
                                setWorkCategoryId={setWorkCategoryId}
                                categories={categories}
                                experience={experience}
                                setExperience={setExperience}
                                hourlyRate={hourlyRate}
                                setHourlyRate={setHourlyRate}
                                newSkill={newSkill}
                                setNewSkill={setNewSkill}
                                skills={skills}
                                setSkills={setSkills}
                                availability={availability}
                                setAvailability={setAvailability}
                                citizenshipStatus={citizenshipStatus}
                                setCitizenshipStatus={setCitizenshipStatus}
                                workPermit={workPermit}
                                setWorkPermit={setWorkPermit}
                                visaStatus={visaStatus}
                                setVisaStatus={setVisaStatus}
                                portfolioUrl={portfolioUrl}
                                setPortfolioUrl={setPortfolioUrl}
                                resumeDoc={resumeDoc}
                                handleResumePick={handleResumePick}
                                licenseDoc={licenseDoc}
                                handleLicensePick={handleLicensePick}
                                agreementDoc={agreementDoc}
                                handleAgreementPick={handleAgreementPick}
                                profile={profile}
                                isLoading={isUpdating}
                                errors={errors}
                                setErrors={setErrors}
                            />
                        ) : (
                            <ViewMode
                                s={s}
                                profile={profile}
                                phoneNumber={phoneNumber}
                                email={email}
                                dob={dob}
                                address={resAddress} // Fallback mapping for view mode
                                workCategory={workCategory}
                                hourlyRate={hourlyRate}
                                skills={skills}
                                availability={availability}
                                citizenshipStatus={citizenshipStatus}
                                workPermit={workPermit}
                                visaStatus={visaStatus}
                                portfolioUrl={portfolioUrl}
                                resumeDoc={resumeDoc}
                                licenseDoc={licenseDoc}
                                agreementDoc={agreementDoc}
                                certifications={profile?.profile?.certifications || []}
                                navigation={navigation}
                            />
                        )}
                    </>
                )}

                <View style={styles.footer}>
                    <CustomButton
                        title={isEditMode ? s.updateChanges : s.editProfile}
                        onPress={isEditMode ? handleSave : toggleEditMode}
                        loading={isUpdating}
                        disabled={isUpdating}
                    />
                </View>

            </ScrollView>

            <DatePicker
                modal
                mode="date"
                open={openDatePicker}
                date={dobDate}
                onConfirm={(date) => {
                    setOpenDatePicker(false);
                    setDobDate(date);
                    setDob(formatDOBLocally(date));
                }}
                onCancel={() => setOpenDatePicker(false)}
            />

            <CitySelectionModal
                visible={isCityModalVisible}
                provinceId={selectedProvinceId}
                onClose={() => setIsCityModalVisible(false)}
                selectedCityId={selectedCityId}
                onSelect={(item) => {
                    setSelectedCityId(item.value);
                    setCity(item.label);
                    setIsCityModalVisible(false);
                }}
            />

            <CountrySelectionModal
                visible={isCitizenshipModalVisible}
                onClose={() => setIsCitizenshipModalVisible(false)}
                selectedCountryId={selectedCitizenshipId}
                onSelect={(item) => {
                    setSelectedCitizenshipId(item.value);
                    setCitizenshipStatus(item.label);
                    setIsCitizenshipModalVisible(false);
                }}
            />
        </View>
    );
};

export default ProfileDetailsScreen;
