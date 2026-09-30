import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import DropdownField from '@components/DropdownField';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import AppText from '@components/AppText';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { devDebugger } from '@utils/devDebugger';

export interface MobileInputProps {
    mobile: string;
    countryCode: string;
    countryCodesList?: { label: string; value: string }[];
    onChangeMobile: (text: string) => void;
    onChangeCountryCode: (code: string) => void;
    mobilePlaceholder?: string;
    codePlaceholder?: string;
    containerStyle?: ViewStyle | ViewStyle[];
    dropdownWidth?: number;
    hideCheck?: boolean;
    showVerifyButton?: boolean;
    onVerify?: () => void;
    isVerifying?: boolean;
    editable?: boolean;
    disabledStyle?: any;
    updatedMobile?: boolean;
}

const MobileInput: React.FC<MobileInputProps> = ({
    mobile,
    countryCode,
    countryCodesList,
    onChangeMobile,
    onChangeCountryCode,
    mobilePlaceholder = 'Enter Mobile Number',
    codePlaceholder = 'Code',
    containerStyle,
    dropdownWidth = horizontalScale(60),
    hideCheck = true,
    showVerifyButton = false,
    onVerify,
    isVerifying = false,
    editable = true,
    disabledStyle = {},
    updatedMobile = false,
}) => {
    const [fetchedCodes, setFetchedCodes] = React.useState<{ label: string; value: string }[]>([]);

    React.useEffect(() => {
        if (!countryCodesList || countryCodesList.length === 0) {
            fetchCountryCodes();
        }
    }, [countryCodesList]);

    const fetchCountryCodes = async () => {
        try {
            const response: any = await AuthService.getCountryCodes();
            
            // Robust extraction to handle various API response structures
            let resultsArray: any[] = [];
            if (Array.isArray(response.results)) {
                resultsArray = response.results;
            } else if (response.data && Array.isArray(response.data.results)) {
                resultsArray = response.data.results;
            } else if (response.data?.results && Array.isArray(response.data.results.results)) {
                resultsArray = response.data.results.results;
            } else if (Array.isArray(response.data)) {
                resultsArray = response.data;
            } else if (Array.isArray(response)) {
                resultsArray = response;
            }

            if (resultsArray.length > 0) {
                const mapped = resultsArray.map((item: any) => ({
                    label: `+${item.countryCode}`,
                    value: `+${item.countryCode}`
                }));
                setFetchedCodes(mapped);
            }
        } catch (error) {
            devDebugger.log('Error fetching country codes:', error);
        }
    };

    const displayCodes = (countryCodesList && countryCodesList.length > 0) ? countryCodesList : fetchedCodes;

    return (
        <View style={[styles.mainContainer, disabledStyle, updatedMobile && { backgroundColor: '#F9FAFB', opacity: 0.8 }]}>
            <View style={[styles.container, containerStyle]}>
            <View style={[styles.dropdownContainer, { width: dropdownWidth }]}>
                <DropdownField
                    label=""
                    placeholder={codePlaceholder}
                    value={String(countryCode).trim()}
                    onChange={(val) => onChangeCountryCode(String(val))}
                    data={displayCodes}
                    hideCheck={hideCheck}
                    containerStyle={styles.dropdownInnerContainer}
                    disabled={!editable}
                />
            </View>
            <TextInput
                allowFontScaling={false}
                returnKeyType="done"
                style={[styles.textInput, updatedMobile && { color: '#9CA3AF' }]}
                value={mobile}
                maxLength={10}
                placeholder={mobilePlaceholder}
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => onChangeMobile(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                editable={editable && !updatedMobile}
            />
            </View>
            {showVerifyButton && !updatedMobile && (
                <TouchableOpacity
                    style={[styles.verifyInsideButton, (isVerifying || !editable) && { opacity: 0.7 }]}
                    onPress={onVerify}
                    disabled={isVerifying || !editable}
                >
                    {isVerifying ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <AppText style={styles.verifyButtonText}>{strings.common.verify || 'Verify'}</AppText>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

export default MobileInput;

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 0,
        overflow: 'visible',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: verticalScale(50),
    },
    dropdownContainer: {
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        height: '100%',
        justifyContent: 'center',
        zIndex: 10,
    },
    dropdownInnerContainer: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        height: '100%',
        paddingHorizontal: 8,
    },
    textInput: {
        flex: 1,
        paddingLeft: 12,
        height: '100%',
        color: colors.black,
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
    },
    verifyInsideButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(6),
        position: 'absolute',
        right: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: colors.white,
        fontSize: fontSize(12),
        fontFamily: fonts.semiBold,
    },
});
