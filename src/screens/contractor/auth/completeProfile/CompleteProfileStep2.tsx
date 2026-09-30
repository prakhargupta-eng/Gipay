import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '@context/AuthContext';
import LottieView from 'lottie-react-native';

import LoginButton from '@components/LoginButton';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings from '@constants/strings';
import { Toast } from '@utils/ToastManager';
import SumsubService from '@utils/SumsubService';
import ContractorService from '@config/contractorService';
import { getUserId, STORAGE_KEYS } from '@store/storage';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────

interface Step2Props {
    onNext: () => void;
    onBack: () => void;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const CompleteProfileStep2: React.FC<Step2Props> = ({ onNext, onBack }) => {
    const { updateLastStep } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [isRejected, setIsRejected] = useState(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    // ── Lifecycle ────────────────────────────────────────────────────────────

    useEffect(() => {
        updateLastStep('CompleteProfileStep2');
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
                const kyc = response.data.governmentIdVerification;
                // Check if already verified
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

    // ── Handlers ────────────────────────────────────────────────────────────

    const launchSumsub = async () => {
        setIsLoading(true);
        try {
            const result = await SumsubService.launchKYC();

            // Status 'Approved', 'Pending', or 'ActionCompleted' or success:true are considered successful submissions
            if (result.status === 'Approved' || result.status === 'Pending' || result.status === 'ActionCompleted') {
                setIsVerified(true);
                setIsRejected(false);
                Toast.show({
                    type: 'success',
                    text1: strings.auth.contractor.completeProfile.verificationSubmitted,
                    text2: strings.auth.contractor.completeProfile.verificationSubmittedSub,
                });
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
            onNext();
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

    // ── Render ───────────────────────────────────────────────────────────────

    if (isFetchingProfile) {
        return (
            <View style={[styles.root, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.root}>
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: verticalScale(20),
    },
    body: {
        paddingHorizontal: horizontalScale(20),
    },
    sectionTitle: {
        fontSize: fontSize(22),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(10),
    },
    description: {
        fontSize: fontSize(15),
        fontFamily: fonts.regular,
        color: '#666',
        lineHeight: verticalScale(22),
        marginBottom: verticalScale(25),
    },
    
    // ── Instructions Card ──
    instructionsCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: verticalScale(16),
        padding: horizontalScale(20),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    instructionsTitle: {
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginBottom: verticalScale(15),
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    bulletNumber: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: horizontalScale(12),
    },
    bulletText: {
        color: colors.white,
        fontSize: fontSize(12),
        fontFamily: fonts.bold,
    },
    instructionText: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#4B5563',
    },
    infoBox: {
        backgroundColor: '#EFF6FF',
        borderRadius: verticalScale(10),
        padding: horizontalScale(12),
        marginTop: verticalScale(10),
    },
    infoText: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#1E40AF',
        textAlign: 'center',
    },

    // ── Success State ──
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
    },
    lottieCheck: {
        width: horizontalScale(160),
        height: horizontalScale(160),
    },
    verifiedTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(10),
    },
    verifiedSubtitle: {
        fontSize: fontSize(15),
        fontFamily: fonts.regular,
        color: '#666',
        textAlign: 'center',
        lineHeight: verticalScale(22),
    },

    // ── Common ──
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(15),
        paddingBottom: verticalScale(30),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.white,
        paddingTop: verticalScale(10),
    },
    backButton: {
        flex: 0.4,
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

export default CompleteProfileStep2;
