import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import TopHeader from '@components/TopHeader';
import { getLocalDateTime } from '@utils/dateUtils';
import strings from '@constants/strings';
import { getStatusStyles } from '@utils/statusUtils';
import styles from './styles';
import ProposeRateModal from './components/ProposeRateModal';
import DetailsSkeleton from './components/DetailsSkeleton';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import CustomButton from '@components/CustomButton';
import KycRejectedPopup from '@components/KycRejectedPopup';
import colors from '@styles/colors';
import { useUserStore } from '@store/useUserStore';
import { verticalScale } from '@styles/mixins';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'JobDetails'>;
type JobDetailsRouteProp = RouteProp<ContractorAppStackParamList, 'JobDetails'>;

const JobDetailTag = ({ icon, text, style, textStyle }: { icon: any; text: string; style?: any; textStyle?: any }) => (
    <View style={[styles.infoItem, style]}>
        <Image source={icon} style={styles.infoIcon} />
        <AppText style={[styles.infoText, textStyle]}>{text || 'N/A'}</AppText>
    </View>
);

const JobDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<JobDetailsRouteProp>();
    const { jobId } = route.params || {};
    const isRestricted = useUserStore((state) => state.isRestricted());
    const s = strings.auth.contractor.matches;

    const [jobData, setJobData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [proposalRate, setProposalRate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isKycPopupVisible, setIsKycPopupVisible] = useState(false);

    /**
     * Safe Date Formatter
     */
    const formatDate = useCallback((dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    }, []);

    /**
     * Fetch Job Details
     */
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setIsLoading(true);
                setHasError(false);
                const res = await ContractorService.getJobDetails(jobId);
                if (res.success && res.data) {
                    setJobData(res.data);
                } else {
                    setHasError(true);
                    Toast.showError(res.message || 'Failed to load job details');
                }
            } catch (error) {
                devDebugger.error('Error fetching job details:', error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    /**
     * Submit Proposal Logic
     */
    const handleSubmitProposal = async () => {
        if (isRestricted) {
            setIsKycPopupVisible(true);
            return;
        }

        if (!proposalRate.trim()) {
            Toast.showError('Please enter a valid proposal rate');
            return;
        }

        try {
            setIsSubmitting(true);
            const targetId = jobData?.invitationId || jobData?.id;

            if (!targetId) {
                Toast.showError('Invalid ID for proposal');
                return;
            }

            const res = await ContractorService.applyJob(targetId, parseFloat(proposalRate));

            if (res.success) {
                Toast.showSuccess('Proposal submitted successfully');
                setShowProposalModal(false);
                setProposalRate('');
                setJobData((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        myInvitation: {
                            isProposeRate: true,
                            proposedRate: parseFloat(proposalRate),
                            ...(res.data || {})
                        }
                    };
                });
            } else {
                Toast.showError(res.message || 'Failed to submit proposal');
            }
        } catch (error) {
            devDebugger.error('Error submitting proposal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
    * Submit apply Logic
    */
    const handleSubmitapply = async () => {
        if (isRestricted) {
            setIsKycPopupVisible(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const targetId = jobData?.invitationId || jobData?.id;


            const res = await ContractorService.applyJob(targetId);

            if (res.success) {
                Toast.showSuccess('Proposal submitted successfully');
                setShowProposalModal(false);
                setProposalRate('');
                setJobData((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        myInvitation: res.data || {}
                    };
                });
                navigation.goBack();
            } else {
                Toast.showError(res.message || 'Failed to submit proposal');
            }
        } catch (error) {
            devDebugger.error('Error submitting proposal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return (
            <View style={styles.root}>
                <TopHeader title={strings.auth.contractor.jobDetails.screenTitle} onBack={() => navigation.goBack()} />
                <DetailsSkeleton />
            </View>
        );
    }

    if (hasError || !jobData) {
        return (
            <View style={styles.root}>
                <TopHeader title={strings.auth.contractor.jobDetails.screenTitle} onBack={() => navigation.goBack()} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <EmptyState 
                        imageSource={require('@assets/images/common/noData.png')} 
                        title={strings.auth.contractor.jobDetails.jobDetailsNotAvailable} 
                        description={strings.auth.contractor.jobDetails.noDetailsFoundDesc} 
                    />
                </View>
            </View>
        );
    }

    const statusStyle = getStatusStyles(jobData.status);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            <TopHeader
                title={strings.auth.contractor.jobDetails.screenTitle}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.flex1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.detailsHeader}>
                    <View style={styles.detailsTitleRow}>
                        <AppText style={styles.detailsTitle}>{jobData.title}</AppText>
                        <View style={[styles.badge, statusStyle.badge]}>
                            <AppText style={[styles.badgeText, statusStyle.text]}>
                                {statusStyle.label}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.detailsCompanyRow}>
                        <AppText style={styles.detailsCompany}>{jobData.organizationName}</AppText>
                        {(typeof jobData.rating === 'number' && jobData.rating > 0) ? (
                            <View style={styles.detailsRatingRow}>
                                <Image
                                    source={require('@assets/images/common/star.png')}
                                    style={styles.starIcon}
                                />
                                <AppText style={styles.ratingText}>
                                    {jobData.rating.toFixed(1)}
                                </AppText>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={styles.detailsTagsContainer}>
                    {jobData.myInvitation?.isProposeRate ? (
                        <View style={styles.infoItem}>
                            <Image source={require('@assets/images/common/doller.png')} style={styles.infoIcon} />
                            <View style={styles.negotiationRatesContainer}>
                                <AppText style={styles.originalRateText}>
                                    {s.jobRate(jobData.originalHourlyRate || jobData.hourlyRate || 0)}
                                </AppText>
                                <AppText style={styles.negotiatedRateText}>
                                    {s.proposedRate(jobData.myInvitation.proposedRate || jobData.hourlyRate || 0)}
                                </AppText>
                            </View>
                        </View>
                    ) : (
                        <JobDetailTag
                            icon={require('@assets/images/common/doller.png')}
                            text={`Hourly Rate: ${formatCurrency(jobData.hourlyRate || 0)}/h`}
                        />
                    )}
                    <JobDetailTag
                        icon={require('@assets/images/common/pinLocation.png')}
                        text={jobData.location}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <JobDetailTag
                            style={{ flex: 0, marginRight: 16 }}
                            textStyle={{ flex: 0 }}
                            icon={require('@assets/images/common/calanderGray.png')}
                            text={`${formatDate(jobData.startDate)} - ${formatDate(jobData.endDate)}`}
                        />
                        <JobDetailTag
                            style={{ flex: 0 }}
                            textStyle={{ flex: 0 }}
                            icon={require('@assets/images/common/clockGray.png')}
                            text={`${jobData.startDate ? getLocalDateTime(jobData.startDate).time : '00:00'} - ${jobData.endDate ? getLocalDateTime(jobData.endDate).time : '00:00'}`}
                        />
                    </View>
                </View>

                <AppText style={styles.sectionTitle}>{strings.auth.contractor.jobDetails.description}</AppText>
                <View style={styles.descriptionBox}>
                    <AppText style={styles.descriptionText}>
                        {jobData.description}
                    </AppText>
                </View>

                {jobData.requiredCertifications && Array.isArray(jobData.requiredCertifications) && jobData.requiredCertifications.length > 0 && (
                    <>
                        <AppText style={styles.sectionTitle}>{strings.auth.contractor.jobDetails.requiredCertification}</AppText>
                        <View style={styles.certificationBox}>
                            {jobData.requiredCertifications.map((cert: any, index: number) => (
                                <AppText key={index} style={styles.certificationItem}>
                                    • {typeof cert === 'object' ? cert.name : cert}
                                </AppText>
                            ))}
                        </View>
                    </>
                )}

                <View style={styles.requiredContractorRow}>
                    <AppText style={styles.sectionTitle}>{strings.auth.contractor.jobDetails.requiredContractor}</AppText>
                    <View style={styles.countBox}>
                        <AppText style={styles.countText}>{jobData.contractorsRequired || 0}</AppText>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {jobData.isInvited ? (
                    <View style={[styles.appliedMessageContainer, { justifyContent: 'flex-start' }]}>
                        <AppText style={[styles.appliedMessageText, { flex: 1, fontSize: 14 }]}>
                            {strings.auth.contractor.jobDetails.alreadyInvited}
                        </AppText>
                    </View>
                ) : jobData.myInvitation ? (
                    <View style={[
                        styles.appliedMessageContainer,
                        jobData.myInvitation.isProposeRate && styles.proposedMessageContainer
                    ]}>

                        <AppText style={[
                            styles.appliedMessageText,
                            jobData.myInvitation.isProposeRate && styles.proposedMessageText
                        ]}>
                            {jobData.myInvitation.isProposeRate ? strings.auth.contractor.jobDetails.rateProposed : strings.auth.contractor.jobDetails.alreadyApplied}
                        </AppText>
                    </View>
                ) : (
                    <View style={styles.flex1}>
                        {jobData.isJobEligible === false && (
                            <View style={styles.ineligibleContainer}>
                                <AppText style={styles.ineligibleText}>
                                    {strings.auth.contractor.jobDetails.scheduleMismatch}
                                </AppText>
                            </View>
                        )}
                        <View style={styles.buttonsRow}>
                            <CustomButton
                                title={strings.auth.contractor.jobDetails.proposeRate}
                                onPress={() => {
                                    if (isRestricted) {
                                        setIsKycPopupVisible(true);
                                        return;
                                    }
                                    setShowProposalModal(true);
                                }}
                                disabled={jobData.isJobEligible === false}
                                style={{
                                    flex: 1,
                                    height: verticalScale(54),
                                    borderWidth: 1,
                                    borderColor: jobData.isJobEligible === false ? colors.lightGray : colors.primary
                                }}
                                gradientColors={[colors.white, colors.white]}
                                textStyle={{ color: jobData.isJobEligible === false ? colors.gray : colors.primary }}
                            />
                            <CustomButton
                                title={strings.auth.contractor.jobDetails.apply}
                                onPress={() => {
                                    if (isRestricted) {
                                        setIsKycPopupVisible(true);
                                        return;
                                    }
                                    handleSubmitapply();
                                }}
                                disabled={jobData.isJobEligible === false}
                                style={{ flex: 1, height: verticalScale(54) }}
                            />
                        </View>
                    </View>
                )}
            </View>

            <ProposeRateModal
                visible={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                value={proposalRate}
                onChange={setProposalRate}
                onSubmit={handleSubmitProposal}
                loading={isSubmitting}
            />
            <KycRejectedPopup
                visible={isKycPopupVisible}
                onClose={() => setIsKycPopupVisible(false)}
                onReKyc={() => {
                    setIsKycPopupVisible(false);
                    navigation.navigate('ReKyc' as any);
                }}
            />
        </View>
    );
};

export default JobDetailsScreen;
