import { CURRENCY } from '@constants/strings';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    Dimensions
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InputField from '@components/InputField';
import LoginButton from '@components/LoginButton';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import DropdownField from '@components/DropdownField';

import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import { sanitizeDecimalInput } from '@utils/validation';
import { devDebugger } from '@utils/devDebugger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────

interface Step3Props {
    onNext: () => void;
    onBack: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────


const AVAILABILITY_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

// ─── Screen ──────────────────────────────────────────────────────────────────

const CompleteProfileStep3: React.FC<Step3Props> = ({ onNext, onBack }) => {
    const insets = useSafeAreaInsets();
    const { userId, updateLastStep } = useAuth();
    const [workCategory, setWorkCategory] = useState<{ id: string; name: string } | null>(null);
    const [dynamicWorkCategories, setDynamicWorkCategories] = useState<{ id: string; name: string }[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState<string>('');
    const [experience, setExperience] = useState<string>('');
    const [hourlyRate, setHourlyRate] = useState<string>('');
    const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
    const [shortBio, setShortBio] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    React.useEffect(() => {
        updateLastStep('CompleteProfileStep3');
        fetchWorkCategories();
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await ContractorService.getProfileInfo(userId!);
            if (response.success && response.data) {
                const initialData = response.data.profile?.professionalProfile;
                if (initialData) {
                    setWorkCategory(initialData.workCategory || null);
                    setSkills(initialData.skills || []);
                    setExperience(initialData.experience?.toString() || '');
                    setHourlyRate(initialData.hourlyRate?.toString() || '');
                    setAvailabilityDays(initialData.availabilityDays || []);
                    setShortBio(initialData.bio || '');
                }
            }
        } catch (error) {
            devDebugger.log('[Step3] Fetch Profile Error:', error);
        }
    };

    const fetchWorkCategories = async () => {
        try {
            const response = await AuthService.getWorkCategories();
            if (response.success && response.data) {
                setDynamicWorkCategories(response.data);
            }
        } catch (error) {
            devDebugger.error('[Step3] Fetch Work Categories Error:', error);
        }
    };

    // ── Validation ──────────────────────────────────────────────────────────

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed) {
            if (skills.length >= 10) {
                Toast.show({
                    type: 'error',
                    text1: strings.auth.contractor.completeProfile.skillLimitTitle,
                    text2: strings.auth.contractor.completeProfile.skillLimitMessage,
                });
                return;
            }
            if (!skills.includes(trimmed)) {
                setSkills([...skills, trimmed]);
                setSkillInput('');
                if (errors.skills) setErrors(prev => ({ ...prev, skills: '' }));
            }
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!workCategory) newErrors.workCategory = strings.validation.workCategoryRequired;
        if (skills.length === 0) newErrors.skills = strings.validation.selectAtLeastOneSkill;
        if (!experience) newErrors.experience = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.experienceLevelLabel);
        if (!hourlyRate) {
            newErrors.hourlyRate = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.hourlyRateLabel);
        }
        if (availabilityDays.length === 0) newErrors.availabilityDays = strings.validation.availabilityRequired;

        if (!shortBio) {
            newErrors.shortBio = strings.validation.fieldMandatory(strings.auth.contractor.completeProfile.bioLabel);
        } else {
            const words = shortBio.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length < 5) {
                newErrors.shortBio = strings.validation.minWords('Short Bio', 5);
            } else if (words.length > 70) {
                newErrors.shortBio = strings.validation.maxWords('Short Bio', 70);
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = async () => {
        Keyboard.dismiss();
        if (validate()) {
            setIsLoading(true);
            try {
                const response = await AuthService.addProfile({
                    workCategory: {
                        id: workCategory!.id,
                        name: workCategory!.name,
                    },
                    skills,
                    experience: experience,
                    hourlyRate,
                    availabilityDays,
                    bio: shortBio,
                });

                if (response.success) {
                    onNext();
                } else {
                    Toast.show({
                        type: 'error',
                        text1: strings.common.error,
                        text2: response.message || strings.auth.contractor.completeProfile.saveFailed,
                    });
                }
            } catch (error: any) {
                Toast.show({
                    type: 'error',
                    text2: error.message || strings.auth.contractor.signup.somethingWentWrong,
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const bottomPadding = Platform.OS === 'android'
        ? (isKeyboardVisible ? verticalScale(150) : verticalScale(40))
        : verticalScale(120);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ flex: 1 }}
                    onPress={Keyboard.dismiss}
                >
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingBottom: bottomPadding,
                            },
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Body ── */}
                        <View style={[styles.body, { marginTop: verticalScale(20) }]}>
                            <AppText style={styles.sectionTitle}>{strings.auth.contractor.completeProfile.contractorProfileInfo}</AppText>

                            <DropdownField
                                label={strings.auth.contractor.completeProfile.workCategoryLabel}
                                placeholder={strings.common.select}
                                value={workCategory?.id || ''}
                                disabled={isLoading}
                                onChange={(val) => {
                                    const selected = dynamicWorkCategories.find(c => c.id === val);
                                    if (selected) {
                                        setWorkCategory(selected);
                                    }
                                    if (errors.workCategory) setErrors(prev => ({ ...prev, workCategory: '' }));
                                }}
                                data={dynamicWorkCategories.map(c => ({ label: c.name, value: c.id }))}
                                error={errors.workCategory}
                                wrapperStyle={styles.fieldWrapper}
                                labelStyle={styles.fieldLabel}
                            />

                            <InputField
                                label={strings.auth.contractor.completeProfile.skillsLabelMax || `${strings.auth.contractor.completeProfile.skillsLabel} (Max 10)`}
                                placeholder={strings.auth.contractor.completeProfile.skillsPlaceholder}
                                value={skillInput}
                                onChangeText={setSkillInput}
                                onSubmitEditing={handleAddSkill}
                                editable={!isLoading}
                                error={errors.skills}
                                wrapperStyle={styles.fieldWrapper}
                                inputStyle={styles.fieldLabel}
                                maxLength={100}
                            />

                            {skills.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {skills.map((skill, index) => (
                                        <View key={index} style={styles.tag}>
                                            <AppText style={styles.tagText}>{skill}</AppText>
                                            <TouchableOpacity
                                                onPress={() => !isLoading && handleRemoveSkill(skill)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                disabled={isLoading}
                                            >
                                                <AppText style={styles.removeTagText}>✕</AppText>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <InputField
                                label={strings.auth.contractor.completeProfile.experienceLevelLabel}
                                placeholder={strings.auth.contractor.completeProfile.experienceLevelPlaceholder}
                                value={experience}
                                onChangeText={(val) => {
                                    setExperience(val);
                                    if (errors.experience) setErrors(prev => ({ ...prev, experience: '' }));
                                }}
                                keyboardType="numeric"
                                editable={!isLoading}
                                error={errors.experience}
                                wrapperStyle={styles.fieldWrapper}
                                inputStyle={styles.fieldLabel}
                                maxLength={2}
                            />

                            <InputField
                                label={strings.auth.contractor.completeProfile.hourlyRateLabel}
                                placeholder={strings.auth.contractor.completeProfile.hourlyRatePlaceholderNumeric}
                                value={hourlyRate}
                                onChangeText={(text) => {
                                    setHourlyRate(sanitizeDecimalInput(text));
                                    if (errors.hourlyRate) setErrors(prev => ({ ...prev, hourlyRate: '' }));
                                }}
                                keyboardType="decimal-pad"
                                error={errors.hourlyRate}
                                wrapperStyle={styles.fieldWrapper}
                                inputStyle={hourlyRate ? styles.hourlyRateInput : undefined}
                                renderLeftIcon={() => (
                                    hourlyRate ? <AppText style={styles.currencyPrefix}>{CURRENCY}</AppText> : null
                                )}
                                maxLength={5}
                            />

                            <DropdownField
                                label={strings.auth.contractor.completeProfile.availabilityLabel}
                                placeholder={strings.auth.contractor.completeProfile.availabilityPlaceholder}
                                isMultiSelect={true}
                                value={availabilityDays}
                                disabled={isLoading}
                                onChange={(val) => {
                                    setAvailabilityDays(val);
                                    if (errors.availabilityDays) setErrors(prev => ({ ...prev, availabilityDays: '' }));
                                }}
                                data={AVAILABILITY_DAYS}
                                error={errors.availabilityDays}
                                wrapperStyle={styles.fieldWrapper}
                            />

                            <InputField
                                label={strings.auth.contractor.completeProfile.shortBioLabel}
                                placeholder={strings.auth.contractor.completeProfile.shortBioPlaceholderLong}
                                value={shortBio}
                                onChangeText={(val) => {
                                    setShortBio(val);
                                    if (errors.shortBio) setErrors(prev => ({ ...prev, shortBio: '' }));
                                }}
                                multiline={true}
                                numberOfLines={4}
                                editable={!isLoading}
                                error={errors.shortBio}
                                wrapperStyle={styles.fieldWrapper}
                                containerStyle={styles.bioContainer}
                                inputStyle={styles.bioInput}
                                maxLength={500}
                            />
                        </View>
                    </ScrollView>
                </TouchableOpacity>
            </KeyboardAvoidingView>
            {/* ── Bottom button row ── */}
            <View
                style={[
                    styles.buttonRow,
                    {
                        paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(15),
                    },
                ]}
            >
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

        </View>
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
    fieldWrapper: {
        marginBottom: verticalScale(20),
    },
    fieldLabel: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.black,
        marginLeft: 0,
    },
    bioContainer: {
        height: verticalScale(120),
        alignItems: 'flex-start',
        paddingTop: verticalScale(10),
    },
    bioInput: {
        height: '100%',
        textAlignVertical: 'top',
    },
    currencyPrefix: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.black,
        marginRight: 0,
    },
    hourlyRateInput: {
        paddingLeft: 0,
        marginLeft: 0,
    },

    // ── Tags ──
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: horizontalScale(8),
        marginBottom: verticalScale(20),
        marginTop: verticalScale(-10),
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAE5FF',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: verticalScale(20),

    },
    tagText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.primary,
        marginRight: horizontalScale(6),
    },
    removeTagText: {
        fontSize: fontSize(14),
        color: colors.primary,
        fontWeight: 'bold',
    },

    // ── Bottom bar ──
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(15),
        paddingBottom: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.white,
        paddingTop: verticalScale(20),
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

export default CompleteProfileStep3;
