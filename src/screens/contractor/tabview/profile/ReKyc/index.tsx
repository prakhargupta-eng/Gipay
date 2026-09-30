import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import LoginButton from '@components/LoginButton';
import TopHeader from '@components/TopHeader';
import { verticalScale } from '@styles/mixins';
import colors from '@styles/colors';
import strings from '@constants/strings';
import { Toast } from '@utils/ToastManager';
import SumsubService from '@utils/SumsubService';
import ContractorService from '@config/contractorService';
import { getUserId } from '@store/storage';
import { useUserStore } from '@store/useUserStore';
import AppText from '@components/AppText';
import styles from './styles';
import { devDebugger } from '@utils/devDebugger';


const ReKycScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const setProfile = useUserStore((state) => state.setProfile);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [isRejected, setIsRejected] = useState(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    useEffect(() => {
        fetchProfileStatus();
    }, []);

    const fetchProfileStatus = async () => {
        const userId = getUserId();
        if (!userId) {
            setIsFetchingProfile(false);
            return;
        }

        try {
            const response = await ContractorService.getProfileInfo(userId);
            if (response.success && response.data) {
                setProfile(response.data);
                const kyc = response.data.governmentIdVerification;
                if (
                    kyc?.verificationStatus === 'approved' || 
                    kyc?.sumsubReviewStatus === 'GREEN' || 
                    kyc?.selfieVerification?.livenessCheckStatus === 'passed'
                ) {
                    setIsVerified(true);
                    setIsRejected(false);
                } else if (
                    kyc?.verificationStatus === 'rejected' || 
                    kyc?.sumsubReviewStatus === 'RED'
                ) {
                    setIsRejected(true);
                    setIsVerified(false);
                    setRejectionReason(kyc?.rejectionReason || strings.auth.contractor.completeProfile.rejectionDefault);
                }
            }
        } catch (error) {
            devDebugger.error('Error fetching profile for KYC status:', error);
        } finally {
            setIsFetchingProfile(false);
        }
    };

    const launchSumsub = async () => {
        setIsLoading(true);
        try {
            const result = await SumsubService.launchKYC();

            if (result.status === 'Approved' || result.status === 'Pending' || result.status === 'ActionCompleted') {
                setIsVerified(true);
                setIsRejected(false);
                Toast.show({
                    type: 'success',
                    text1: strings.auth.contractor.completeProfile.verificationSubmitted,
                    text2: strings.auth.contractor.completeProfile.verificationSubmittedSub,
                });
                await fetchProfileStatus(); // Refresh profile to update isRestricted
            } else if (result.status === 'Initial') {
                 setIsLoading(false);
            } else {
                setIsRejected(true);
                setIsVerified(false);
                Toast.show({
                    type: 'error',
                    text1: strings.auth.contractor.completeProfile.verificationFailedTitle,
                    text2: strings.auth.contractor.completeProfile.rejectionDefault,
                });
            }

        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: strings.common.error,
                text2: error.message || strings.auth.contractor.completeProfile.verificationStartError,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = () => {
        if (isVerified) {
            navigation.goBack();
        } else {
            launchSumsub();
        }
    };

    const renderContent = () => {
        if (isVerified) {
            return (
                <View style={styles.successContainer}>
                    <LottieView
                        source={require('@assets/animation/Success Check.json')}
                        style={styles.lottieCheck}
                        autoPlay
                        loop={false}
                    />
                    <AppText style={styles.verifiedTitle}>{strings.auth.contractor.completeProfile.identityVerified}</AppText>
                    <AppText style={styles.verifiedSubtitle}>
                        {strings.auth.contractor.completeProfile.identityVerifiedSub}
                    </AppText>
                </View>
            );
        }

        if (isRejected) {
            return (
                <View style={styles.successContainer}>
                    <LottieView
                        source={require('@assets/animation/cross.json')}
                        style={styles.lottieCheck}
                        autoPlay
                        loop={false}
                    />
                    <AppText style={[styles.verifiedTitle, { color: colors.red }]}>{strings.auth.contractor.completeProfile.verificationFailedTitle}</AppText>
                    <AppText style={styles.verifiedSubtitle}>
                        {rejectionReason || strings.auth.contractor.completeProfile.rejectionSub}
                    </AppText>
                </View>
            );
        }

        return (
            <>
                <AppText style={styles.description}>
                    {strings.auth.contractor.completeProfile.kycDescription}
                </AppText>

                <View style={styles.instructionsCard}>
                    <AppText style={styles.instructionsTitle}>{strings.auth.contractor.completeProfile.howItWorks}</AppText>
                    
                    <View style={styles.instructionItem}>
                        <View style={styles.bulletNumber}><AppText style={styles.bulletText}>1</AppText></View>
                        <AppText style={styles.instructionText}>{strings.auth.contractor.completeProfile.howItWorksStep1}</AppText>
                    </View>
                    
                    <View style={styles.instructionItem}>
                        <View style={styles.bulletNumber}><AppText style={styles.bulletText}>2</AppText></View>
                        <AppText style={styles.instructionText}>{strings.auth.contractor.completeProfile.howItWorksStep2}</AppText>
                    </View>
                    
                    <View style={styles.instructionItem}>
                        <View style={styles.bulletNumber}><AppText style={styles.bulletText}>3</AppText></View>
                        <AppText style={styles.instructionText}>{strings.auth.contractor.completeProfile.howItWorksStep3}</AppText>
                    </View>

                    <View style={styles.infoBox}>
                        <AppText style={styles.infoText}>
                            {strings.auth.contractor.completeProfile.wellLitNote}
                        </AppText>
                    </View>
                </View>
            </>
        );
    };

    if (isFetchingProfile) {
        return (
            <View style={[styles.root, styles.center]}>
                <TopHeader title={strings.auth.contractor.completeProfile.kycVerification} onBack={() => navigation.goBack()} />
                <View style={styles.flexCenter}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={strings.auth.contractor.completeProfile.kycVerification} onBack={() => navigation.goBack()} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.body, { marginTop: verticalScale(20) }]}>
                    <AppText style={styles.sectionTitle}>{strings.auth.contractor.completeProfile.govIdVerification}</AppText>
                    
                    {renderContent()}
                </View>
            </ScrollView>

            <View style={styles.buttonRow}>
                <View style={{ flex: 1 }}>
                    <LoginButton
                        text={isVerified ? strings.common.next : isRejected ? strings.auth.contractor.completeProfile.verifyAgain : strings.auth.contractor.completeProfile.startVerification}
                        onPress={handleAction}
                        loading={isLoading}
                        disabled={isLoading}
                    />
                </View>
            </View>
        </View>
    );
};

export default ReKycScreen;
