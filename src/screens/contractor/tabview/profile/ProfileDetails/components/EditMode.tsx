import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import styles from '../styles';
import colors from '@styles/colors';
import { verticalScale } from '@styles/mixins';
import { getFileIcon } from '@utils/fileUtils';
import { formatEmail } from '@utils/validation';
import DropdownField from '@components/DropdownField';
import InputField from '@components/InputField';
import { Tag } from './CommonComponents';
import AppText from '@components/AppText';
import strings from '@constants/strings';
import MobileInput from '@components/MobileInput';
import { sanitizeDecimalInput } from '@utils/validation';

interface EditModeProps {
    s: any;
    firstName: string;
    setFirstName: (val: string) => void;
    phoneNumber: string;
    setPhoneNumber: (val: string) => void;
    countryCode: string;
    setCountryCode: (val: string) => void;
    phoneNumberVerified: boolean;
    setPhoneNumberVerified: (val: boolean) => void;
    isVerifyingPhone: boolean;
    handleVerifyPhone: () => void;
    email: string;
    setEmail: (val: string) => void;
    emailVerified: boolean;
    setEmailVerified: (val: boolean) => void;
    isVerifyingEmail: boolean;
    handleVerifyEmail: () => void;
    dob: string;
    setOpenDatePicker: (val: boolean) => void;
    resAddress: string;
    setResAddress: (val: string) => void;
    streetAddress: string;
    setStreetAddress: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    selectedCityId: string;
    setSelectedCityId: (val: string) => void;
    province: string;
    selectedProvinceId: string;
    setSelectedProvinceId: (val: string) => void;
    postalCode: string;
    setPostalCode: (val: string) => void;
    country: string;
    selectedCountryId: string;
    setSelectedCountryId: (val: string) => void;
    provinces: { label: string; value: string }[];
    canadaCountry: { label: string; value: string }[];
    setIsCityModalVisible: (val: boolean) => void;
    setIsCitizenshipModalVisible: (val: boolean) => void;
    workCategory: string;
    workCategoryId: string;
    setWorkCategory: (val: string) => void;
    setWorkCategoryId: (val: string) => void;
    categories: any[];
    experience: string;
    setExperience: (val: string) => void;
    hourlyRate: string;
    setHourlyRate: (val: string) => void;
    newSkill: string;
    setNewSkill: (val: string) => void;
    skills: string[];
    setSkills: (val: string[]) => void;
    availability: string[];
    setAvailability: (val: string[]) => void;
    citizenshipStatus: string;
    setCitizenshipStatus: (val: string) => void;
    workPermit: string;
    setWorkPermit: (val: string) => void;
    visaStatus: string;
    setVisaStatus: (val: string) => void;
    portfolioUrl: string;
    setPortfolioUrl: (val: string) => void;
    resumeDoc: any;
    handleResumePick: () => void;
    licenseDoc: any;
    handleLicensePick: () => void;
    agreementDoc: any;
    handleAgreementPick: () => void;
    profile: any;
    isLoading: boolean;
    updatedEmail: boolean;
    updatedMobile: boolean;
    errors?: { [key: string]: string };
    setErrors?: (val: any) => void;
}

const EditMode: React.FC<EditModeProps> = ({
    s,
    firstName,
    setFirstName,
    phoneNumber,
    setPhoneNumber,
    countryCode,
    setCountryCode,
    phoneNumberVerified,
    setPhoneNumberVerified,
    isVerifyingPhone,
    handleVerifyPhone,
    email,
    setEmail,
    emailVerified,
    setEmailVerified,
    isVerifyingEmail,
    handleVerifyEmail,
    dob,
    setOpenDatePicker,
    resAddress,
    setResAddress,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    selectedCityId,
    setSelectedCityId,
    province,
    selectedProvinceId,
    setSelectedProvinceId,
    postalCode,
    setPostalCode,
    country,
    selectedCountryId,
    setSelectedCountryId,
    provinces,
    canadaCountry,
    setIsCityModalVisible,
    setIsCitizenshipModalVisible,
    workCategory,
    workCategoryId,
    setWorkCategory,
    setWorkCategoryId,
    categories,
    experience,
    setExperience,
    hourlyRate,
    setHourlyRate,
    newSkill,
    setNewSkill,
    skills,
    setSkills,
    availability,
    setAvailability,
    citizenshipStatus,
    setCitizenshipStatus,
    workPermit,
    setWorkPermit,
    visaStatus,
    setVisaStatus,
    portfolioUrl,
    setPortfolioUrl,
    resumeDoc,
    handleResumePick,
    licenseDoc,
    handleLicensePick,
    agreementDoc,
    handleAgreementPick,
    profile,
    isLoading,
    updatedEmail,
    updatedMobile,
    errors = {},
    setErrors,
}) => {
    const disabledStyle = isLoading ? { opacity: 0.6 } : {};

    return (
        <View style={[styles.editSection, isLoading && { opacity: 0.8 }]}>
            <AppText style={styles.sectionTitle}>{s.personalInfo}</AppText>
            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>{s.fullName}</AppText>
                <TextInput allowFontScaling={false} style={[styles.input, disabledStyle]}
                    returnKeyType="done"
                    value={`${firstName}`}
                    maxLength={100}
                    onChangeText={(text) => {
                        // Prevent special characters and emojis in name
                        const sanitizedText = text.replace(/[^a-zA-Z\s]/g, '');
                        setFirstName(sanitizedText);
                    }}
                    placeholder={strings.auth.contractor.signup.fullNamePlaceholder}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText style={styles.inputLabel}>{s.phoneNumber}</AppText>
                    {updatedMobile && <AppText style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>{strings.client.profileDetails.verified}</AppText>}
                </View>
                <View style={styles.inputWithButton}>
                    <MobileInput
                        mobile={phoneNumber}
                        countryCode={countryCode}
                        onChangeMobile={(text) => {
                            const numeric = text.replace(/[^0-9]/g, '');
                            setPhoneNumber(numeric);
                            const originalPhone = (profile?.user?.mobile || '').replace(new RegExp('^\\' + countryCode), '');
                            setPhoneNumberVerified(numeric === originalPhone);
                        }}
                        onChangeCountryCode={(code) => setCountryCode(code)}
                        editable={!isLoading && !updatedMobile}
                        disabledStyle={disabledStyle}
                        updatedMobile={updatedMobile}
                        showVerifyButton={!phoneNumberVerified && phoneNumber.trim() !== '' && phoneNumber !== (profile?.user?.mobile || '').replace(/^\+1/, '') && !updatedMobile}
                        onVerify={handleVerifyPhone}
                        isVerifying={isVerifyingPhone}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText style={styles.inputLabel}>{s.emailAddress}</AppText>
                    {updatedEmail && <AppText style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>{strings.client.profileDetails.verified}</AppText>}
                </View>
                <View style={styles.inputWithButton}>
                    <TextInput allowFontScaling={false} style={[styles.input, { flex: 1 }, disabledStyle, updatedEmail && { backgroundColor: '#F9FAFB', opacity: 0.8, color: '#9CA3AF' }]}
                        returnKeyType="done"
                        value={email}
                        maxLength={100}
                        onChangeText={(text) => {
                            const cleanText = formatEmail(text);
                            setEmail(cleanText);
                            setEmailVerified(cleanText === (profile?.user?.email || ''));
                        }}
                        keyboardType="email-address"
                        placeholder={`Enter ${s.emailAddress}`}
                        placeholderTextColor={colors.textSecondary}
                        editable={!isLoading && !updatedEmail}
                    />
                    {(!emailVerified && email.trim() !== '' && email !== (profile?.user?.email || '') && !updatedEmail) && (
                        <TouchableOpacity
                            style={[styles.verifyInsideButton, (isVerifyingEmail || isLoading) && { opacity: 0.7 }]}
                            onPress={handleVerifyEmail}
                            disabled={isVerifyingEmail || isLoading}
                        >
                            {isVerifyingEmail ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <AppText style={styles.verifyButtonText}>{strings.common.verify}</AppText>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TouchableOpacity
                onPress={() => setOpenDatePicker(true)}
                style={styles.inputGroup}
                disabled={isLoading}
            >
                <AppText style={styles.inputLabel}>{s.dob}</AppText>
                <View style={[styles.dateInput, disabledStyle]}>
                    <AppText style={styles.dateText}>{dob}</AppText>
                </View>
            </TouchableOpacity>

            <InputField
                label={s.resAddress}
                placeholder={strings.auth.contractor.completeProfile.enterResidentialAddress}
                value={resAddress}
                onChangeText={setResAddress}
                editable={!isLoading}
                wrapperStyle={styles.inputGroup}
            />

            <InputField
                label={strings.auth.contractor.completeProfile.streetAddressLabel}
                placeholder={strings.auth.contractor.completeProfile.enterAddress}
                value={streetAddress}
                onChangeText={setStreetAddress}
                editable={!isLoading}
                wrapperStyle={styles.inputGroup}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(20) }}>
                <DropdownField
                    label={strings.auth.contractor.completeProfile.countryLabel}
                    placeholder={strings.auth.contractor.completeProfile.enterCountry}
                    value={selectedCountryId}
                    disabled={isLoading}
                    onChange={(val) => {
                        setSelectedCountryId(val);
                        if (setErrors && errors.country) setErrors({ ...errors, country: '' });
                    }}
                    data={canadaCountry}
                    error={errors.country}
                    wrapperStyle={{ flex: 1, marginRight: 10 }}
                />
                <DropdownField
                    label={strings.auth.contractor.completeProfile.provinceLabel}
                    placeholder={strings.auth.contractor.completeProfile.enterProvince}
                    value={selectedProvinceId || province}
                    disabled={isLoading}
                    onChange={(val) => {
                        setSelectedProvinceId(val);
                        setSelectedCityId('');
                        setCity('');
                        if (setErrors && errors.province) setErrors({ ...errors, province: '' });
                    }}
                    data={provinces}
                    error={errors.province}
                    wrapperStyle={{ flex: 1 }}
                />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(20) }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsCityModalVisible(true)}
                    style={{ flex: 1, marginRight: 10 }}
                >
                    <View pointerEvents="none">
                        <InputField
                            label={strings.auth.contractor.completeProfile.cityLabel}
                            placeholder={strings.auth.contractor.completeProfile.enterCity}
                            value={city}
                            editable={false}
                            error={errors.city}
                        />
                    </View>
                </TouchableOpacity>
                <InputField
                    label={strings.auth.contractor.completeProfile.postalCodeLabel}
                    placeholder={strings.auth.contractor.completeProfile.enterPostalCode}
                    value={postalCode}
                    onChangeText={(val) => {
                        setPostalCode(val.toUpperCase());
                        if (setErrors && errors.postalCode) setErrors({ ...errors, postalCode: '' });
                    }}
                    autoCapitalize="characters"
                    editable={!isLoading}
                    error={errors.postalCode}
                    wrapperStyle={{ flex: 1 }}
                />
            </View>

            <AppText style={styles.sectionTitle}>{s.professionalInfo}</AppText>
            <View style={styles.inputGroup}>
                <DropdownField
                    label={s.workCategory}
                    data={categories}
                    value={workCategoryId}
                    onChange={(val: string) => {
                        setWorkCategoryId(val);
                        const cat = categories.find(c => c.value === val);
                        if (cat) setWorkCategory(cat.label);
                    }}
                    disabled={isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>{s.experienceLevel}</AppText>
                <TextInput allowFontScaling={false} style={[styles.input, disabledStyle]}
                    returnKeyType="done"
                    value={experience}
                    maxLength={2}
                    onChangeText={(text) => {
                        // Strictly numeric only
                        const sanitized = text.replace(/[^0-9]/g, '');
                        setExperience(sanitized);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>{s.hourlyRate}</AppText>
                <TextInput allowFontScaling={false} style={[styles.input, disabledStyle]}
                    returnKeyType="done"
                    value={hourlyRate}
                    maxLength={10}
                    onChangeText={(text) => {
                        setHourlyRate(sanitizeDecimalInput(text));
                    }}
                    keyboardType="decimal-pad"
                    placeholder={s.hourlyRatePlaceholderNumeric}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>{s.skills}</AppText>
                <TextInput allowFontScaling={false} style={[styles.input, disabledStyle]}
                    returnKeyType="done"
                    value={newSkill}
                    placeholder={s.addSkill}
                    placeholderTextColor={colors.textSecondary}
                    maxLength={50}
                    onChangeText={(text) => {
                        // Remove emojis from skill input
                        const cleaned = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F02B}\u{1F004}\u{1F0CF}\u{1F0D1}]/gu, '');
                        setNewSkill(cleaned);
                    }}
                    onSubmitEditing={() => {
                        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                            setSkills([...skills, newSkill.trim()]);
                            setNewSkill('');
                        }
                    }}
                    editable={!isLoading}
                />
                <View style={[styles.tagsContainer, { marginTop: 10 }]}>
                    {skills.map((skill, index) => (
                        <Tag
                            key={index}
                            label={skill}
                            index={index}
                            onDelete={() => !isLoading && setSkills(skills.filter(s => s !== skill))}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <DropdownField
                    label={s.availability}
                    data={[
                        { label: 'Monday', value: 'Monday' },
                        { label: 'Tuesday', value: 'Tuesday' },
                        { label: 'Wednesday', value: 'Wednesday' },
                        { label: 'Thursday', value: 'Thursday' },
                        { label: 'Friday', value: 'Friday' },
                        { label: 'Saturday', value: 'Saturday' },
                        { label: 'Sunday', value: 'Sunday' }
                    ]}
                    value={availability}
                    onChange={setAvailability}
                    placeholder={s.selectDays}
                    isMultiSelect={true}
                    disabled={isLoading}
                />
            </View>

            <AppText style={styles.sectionTitle}>{s.workEligibility}</AppText>
            <View style={styles.inputGroup}>
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => setIsCitizenshipModalVisible(true)}
                >
                    <View pointerEvents="none">
                        <InputField
                            label={s.citizenshipStatus}
                            placeholder={s.selectCitizenship}
                            value={citizenshipStatus}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <DropdownField
                    label={s.workPermit}
                    data={[
                        { label: strings.common.yes, value: 'Yes' },
                        { label: strings.common.no, value: 'No' },
                    ]}
                    value={workPermit}
                    onChange={setWorkPermit}
                    disabled={isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <DropdownField
                    label={s.visaStatus}
                    data={[
                        { label: strings.common.yes, value: 'Yes' },
                        { label: strings.common.no, value: 'No' }
                    ]}
                    value={visaStatus}
                    onChange={setVisaStatus}
                    disabled={isLoading}
                />
            </View>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>{s.portfolio}</AppText>
                <TextInput allowFontScaling={false} style={[styles.input, disabledStyle]}
                    returnKeyType="done"
                    value={portfolioUrl}
                    maxLength={100}
                    onChangeText={setPortfolioUrl}
                    placeholder={strings.auth.contractor.profileDetails.addPortfolioUrl}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isLoading}
                />
            </View>

            <AppText style={styles.sectionTitle}>{s.docsAndUploads}</AppText>

            <View style={styles.docField}>
                <View style={styles.docHeader}>
                    <AppText style={styles.docLabel}>{s.resume}</AppText>
                    {!isLoading && <Image source={require('@assets/images/common/editPencil.png')} style={styles.editIconSmall} />}
                </View>

                <TouchableOpacity onPress={handleResumePick} disabled={isLoading}>
                    <View style={[styles.docItem, disabledStyle]}>
                        <Image source={getFileIcon(resumeDoc?.documentUrl || resumeDoc?.uri)} style={styles.pdfIcon} />
                        <AppText style={styles.docName} numberOfLines={1}>
                            {resumeDoc?.documentName || s.uploadResume }
                        </AppText>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.docField}>
                <View style={styles.docHeader}>
                    <AppText style={styles.docLabel}>{s.professionalLicense}</AppText>
                </View>
                <TouchableOpacity onPress={handleLicensePick} disabled={isLoading}>
                    <View style={[styles.docItem, disabledStyle]}>
                        <Image source={getFileIcon(licenseDoc?.documentUrl || licenseDoc?.uri)} style={styles.pdfIcon} />
                        <AppText style={styles.docName} numberOfLines={1}>
                            {licenseDoc?.documentName || s.uploadLicense || 'Upload License'}
                        </AppText>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.docField}>
                <View style={styles.docHeader}>
                    <AppText style={styles.docLabel}>{s.contractorAgreement}</AppText>
                </View>
                <TouchableOpacity onPress={handleAgreementPick} disabled={isLoading}>
                    <View style={[styles.docItem, disabledStyle]}>
                        <Image source={getFileIcon(agreementDoc?.documentUrl || agreementDoc?.uri)} style={styles.pdfIcon} />
                        <AppText style={styles.docName} numberOfLines={1}>
                            {agreementDoc?.documentName || s.uploadAgreement || 'Upload Agreement'}
                        </AppText>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default EditMode;
