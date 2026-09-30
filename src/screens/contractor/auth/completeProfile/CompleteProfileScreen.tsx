import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions
} from 'react-native';
import { useAuth } from '@context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ContractorProfileStackParamList } from '@navigation/contractor/ContractorProfileStack';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import strings from '@constants/strings';
import ContractorService from '@config/contractorService';

// Import steps
import CompleteProfileStep1 from './CompleteProfileStep1';
import CompleteProfileStep2 from './CompleteProfileStep2';
import CompleteProfileStep3 from './CompleteProfileStep3';
import CompleteProfileStep4 from './CompleteProfileStep4';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@components/AppText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<ContractorProfileStackParamList, 'CompleteProfileScreen'>;

const CompleteProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { lastOnboardingStep } = useAuth();
    const insets = useSafeAreaInsets();
    
    // Map lastStep string to number
    const getInitialStep = () => {
        switch (lastOnboardingStep) {
            case 'CompleteProfileStep1': return 1;
            case 'CompleteProfileStep2': return 2;
            case 'CompleteProfileStep3': return 3;
            case 'CompleteProfileStep4': return 4;
            case 'CompleteProfileStep5': return 5;
            default: return 1;
        }
    };

    const [currentStep, setCurrentStep] = useState(getInitialStep());
    const totalSteps = 5;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, verticalScale(10)) }]}>
            <View style={styles.headerRow}>
                <AppText style={styles.title}>{strings.auth.contractor.completeProfile.screenTitle}</AppText>
                <AppText style={styles.stepText}>{strings.auth.contractor.completeProfile.step(currentStep, totalSteps)}</AppText>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
            </View>
        </View>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <CompleteProfileStep1 onNext={handleNext} onBack={handleBack} />;
            case 2:
                return <CompleteProfileStep2 onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <CompleteProfileStep3 onNext={handleNext} onBack={handleBack} />;
            case 4:
                return <CompleteProfileStep4 onNext={handleNext} onBack={handleBack} />;
            default:
                return <CompleteProfileStep1 onNext={handleNext} onBack={handleBack} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            {renderHeader()}
            <View style={styles.content}>
                {renderStep()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    safeArea: {
        flex: 1,
    },
    headerContainer: {
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(15),
        backgroundColor: colors.white,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        marginBottom: verticalScale(12),
    },
    title: {
        fontSize: fontSize(22),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    stepText: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
        color: colors.primary,
    },
    progressTrack: {
        height: verticalScale(6),
        marginHorizontal: horizontalScale(20),
        backgroundColor: '#E5E7EB',
        borderRadius: verticalScale(3),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.green,
        borderRadius: verticalScale(3),
    },
    content: {
        flex: 1,
    },
});

export default CompleteProfileScreen;
