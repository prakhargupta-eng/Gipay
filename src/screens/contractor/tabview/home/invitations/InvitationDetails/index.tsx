import { CURRENCY } from '@constants/strings';
import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import styles from './styles';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import ProposeRateModal from './components/ProposeRateModal';
import NegotiateRateModal from '@components/NegotiateRateModal';
import { Toast } from '@utils/ToastManager';
import ContractorService from '@config/contractorService';
import JobDetailsSkeleton from './components/JobDetailsSkeleton';
import { useUserStore } from '@store/useUserStore';
import { fontSize, horizontalScale } from '@styles/mixins';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import EmptyState from '@components/EmptyState';
import KycRejectedPopup from '@components/KycRejectedPopup';
import { getStatusStyles } from '@utils/statusUtils';
import { devDebugger } from '@utils/devDebugger';

const InvitationDetailsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ContractorAppStackParamList>>();
    const route = useRoute<RouteProp<ContractorAppStackParamList, 'InvitationDetails'>>();
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [respondingStatus, setRespondingStatus] = useState<'accepted' | 'declined' | null>(null);
    const [showNegotiateModal, setShowNegotiateModal] = useState(false);
    const [negotiationData, setNegotiationData] = useState<any>(null);
    const [isKycPopupVisible, setIsKycPopupVisible] = useState(false);
    const isRestricted = useUserStore((state) => state.isRestricted());

    const s = strings.auth.contractor.jobDetails;
    const { jobData }: any = route.params || {};
    const [jobDetails, setJobDetails] = useState<any>(jobData);

    React.useEffect(() => {
        const id = jobData?.id || jobData?._id;
        if (id) {
            fetchJobDetails();
        }
    }, [jobData?.id, jobData?._id]);

    const fetchJobDetails = async () => {
        const jobId = jobData?.id || jobData?._id;
        if (!jobId) return;

        setIsLoading(true);
        setHasError(false);
        try {
            const response = await ContractorService.getJobDetails(jobId);
            devDebugger.log('Job Details Response:', JSON.stringify(response, null, 2));

            // Support both direct results and double-nested results
            const item = response.data?.results || response.data?.data?.results || response.data;

            if (item && typeof item === 'object') {
                // Simple date formatter
                // const formatDate = (dateStr: string) => {
                //     if (!dateStr) return '';
                //     const date = new Date(dateStr);
                //     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                // };

                const mappedData = {
                    invitationId: item.myInvitation?._id || jobData?.invitationId,
                    title: item.title || jobData?.title || '',
                    company: item.organizationName || jobData?.company || '',
                    status: jobData.status || item.status,
                    rating: item.rating || jobData?.rating || '0.0',
                    distance: item.distance || jobData?.distance || '',
                    dateRange: `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}`,
                    timeRange: `${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}`,
                    rate: item.hourlyRate || jobData?.rate || '0',
                    location: item.location || jobData?.location || '',
                    description: item.description || '',
                    requiredContractors: String(item.requiredContractors ?? item.contractorsRequired ?? '0'),
                    assignedContractors: String(item.assignedContractors ?? '0'),
                    certifications: item.requiredCertifications || [],
                    invitationStatus: item.myInvitation?.status || jobData?.status,
                    originalOfferRate: item.myInvitation?.originalOfferRate || item.hourlyRate,
                    negotiateRate: item.myInvitation?.proposedRate || null,
                    hasProposedRate: item.myInvitation?.isRateProposed || !!item.myInvitation?.proposedRate || false,
                    counterOfferRate: item.myInvitation?.counterOfferRate || null,
                    finalRate: item.myInvitation?.finalRate || item.finalRate || null,
                    raw: item,
                };
                setJobDetails(mappedData);
            } else if (!jobData?.title && !jobData?.company) {
                setHasError(true);
                setJobDetails(null);
            }
        } catch (error: any) {
            devDebugger.log('Error fetching job details:', error);
            setHasError(true);
            if (!jobData?.title && !jobData?.company) {
                setJobDetails(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleProposeRate = async (rate: string) => {
        if (isRestricted) {
            setIsKycPopupVisible(true);
            return;
        }

        const invitationId = jobDetails?.invitationId;
        if (!invitationId) {
            Toast.show({ type: 'error', text1: strings.common.error, text2: strings.common.missingInvitationId });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await ContractorService.jobPropose(invitationId, Number(rate));
            if (response.success) {
                setShowModal(false);
                Toast.show({
                    type: 'success',
                    text1: strings.common.proposalSubmitted,
                    text2: s.proposalRateSentDesc(rate),
                });
                // Update local state immediately for offline/instant UI update
                setJobDetails((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        negotiateRate: Number(rate),
                        hasProposedRate: true,
                    };
                });
                // Refresh data to show new negotiated rate
                fetchJobDetails();
            } else {
                Toast.show({ type: 'error', text1: strings.common.submissionFailed, text2: response.message || strings.common.pleaseTryAgain });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: strings.common.error, text2: strings.common.somethingWentWrong });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRespond = async (status: 'accepted' | 'declined') => {
        if (status === 'accepted' && isRestricted) {
            setIsKycPopupVisible(true);
            return;
        }

        const invitationId = jobDetails?.invitationId;
        if (!invitationId) {
            devDebugger.log('Invitation ID not found');
            return;
        }

        setRespondingStatus(status);
        try {
            const apiStatus = status === 'declined' ? 'rejected' : 'accepted';
            const response = await ContractorService.respondToInvitation(invitationId, apiStatus);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: apiStatus === 'accepted' ? s.jobAcceptedTitle : s.invitationDeclinedTitle,
                    text2: apiStatus === 'accepted' ? s.jobAddedToListingDesc : s.invitationDeclinedDesc,
                });
                navigation.goBack();
            } else {
                Toast.show({ type: 'error', text1: strings.common.requestFailed, text2: response.message });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: strings.common.error, text2: strings.common.somethingWentWrong });
        } finally {
            setRespondingStatus(null);
        }
    };

    const handleViewNegotiate = async () => {
        if (jobDetails?.counterOfferRate == null) {
            Toast.show({
                type: 'info',
                text1: s.pendingOfferTitle,
                text2: s.pendingOfferDesc
            });
        } else {
            const invitationId = jobDetails?.invitationId;
            if (!invitationId) return;

            setIsLoading(true);
            try {
                const response = await ContractorService.getNegotiation(invitationId);
                if (response.success && response.data) {
                    const counterOfferRate = response.data?.counterOfferRate ?? response.data?.myInvitation?.counterOfferRate;
                    if (counterOfferRate && Number(counterOfferRate) > 0) {
                        setNegotiationData(response.data);
                        setShowNegotiateModal(true);
                    } else {

                    }
                } else {
                    Toast.show({ type: 'error', text1: strings.common.error, text2: response.message || strings.common.failedToFetchNegotiationData });
                }
            } catch (error) {
                Toast.show({ type: 'error', text1: strings.common.error, text2: strings.common.somethingWentWrong });
            } finally {
                setIsLoading(false);
            }
        }
    };


    const assets = {
        star: require('@assets/images/common/star.png'),
        dollar: require('@assets/images/common/doller.png'),
        location: require('@assets/images/common/locationPin.png'),
        calendar: require('@assets/images/common/calanderGray.png'),
        clock: require('@assets/images/common/clockGray.png'),
        chevron: require('@assets/images/common/dropdown.png'),
        dummyUser: require('@assets/images/common/dummyUser.png'),
    };


    if (isLoading) {
        return (
            <View style={styles.root}>
                <TopHeader title={s.screenTitle} onBack={() => navigation.goBack()} />
                <JobDetailsSkeleton />
            </View>
        );
    }

    if (hasError || !jobDetails || (!jobDetails.title && !jobDetails.company && !isLoading)) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader title={s.screenTitle} onBack={() => navigation.goBack()} />
                <View style={{ flex: 1 }}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title={s.noDetailsFoundTitle} description={s.noDetailsFoundDesc} />
                </View>
            </View>
        );
    }

    const renderRatingOrDistance = () => {
        if (jobDetails.rating && parseFloat(jobDetails.rating) > 0) {
            return (
                <View style={[styles.ratingRow, { marginTop: 0 }]}>
                    <Image source={assets.star} style={styles.starIcon} />
                    <AppText style={styles.ratingText}>
                        {jobDetails.rating}
                    </AppText>
                </View>
            );
        }
        if (jobDetails.distance) {
            return (
                <View style={[styles.ratingRow, { marginTop: 0 }]}>
                    <Image source={require('@assets/images/common/map.png')} style={[styles.starIcon, { tintColor: '#9CA3AF' }]} />
                    <AppText style={styles.ratingText}>{jobDetails.distance}</AppText>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={s.screenTitle}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Section */}
                <View style={styles.headerInfo}>

                    <View style={styles.headerTextContent}>
                        <View style={styles.titleRow}>
                            <AppText style={styles.jobTitle} numberOfLines={1}>
                                {jobDetails.title}
                            </AppText>
                            <View style={[styles.statusBadge, getStatusStyles(jobDetails.status).badge]}>
                                <AppText style={[styles.statusText, getStatusStyles(jobDetails.status).text]}>{getStatusStyles(jobDetails.status).label}</AppText>
                            </View>
                        </View>
                        <View style={styles.companyRatingRow}>
                            <AppText style={styles.companyName}>{jobDetails.company}</AppText>
                            {renderRatingOrDistance()}
                        </View>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsGrid}>
                    <View style={styles.rateRow}>
                        <View style={[styles.detailItem, { marginBottom: 0, flex: 1, marginRight: horizontalScale(8) }]}>
                            <Image source={assets.dollar} style={styles.detailIcon} />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                                <AppText
                                    style={[
                                        styles.detailText,
                                        (jobDetails.negotiateRate) ? styles.strikethroughJobRateText : null
                                    ]}
                                >
                                    {strings.auth.contractor.jobInvitations.jobRate(jobDetails.rate)}
                                </AppText>
                                {(jobDetails.negotiateRate) ? (
                                    <AppText style={styles.negotiateRateText}>
                                        {strings.auth.contractor.jobInvitations.Proposed(jobDetails.negotiateRate)}
                                    </AppText>
                                ) : null}
                            </View>
                        </View>
                        {jobDetails.status?.toLowerCase() !== 'expired' && (
                            (jobDetails.hasProposedRate || !!jobDetails.negotiateRate) ? (
                                <TouchableOpacity
                                    style={[styles.proposeLink, jobDetails.invitationStatus === 'accepted' && { opacity: 0.5 }]}
                                    onPress={handleViewNegotiate}
                                    disabled={jobDetails.invitationStatus === 'accepted'}
                                >
                                    <AppText style={styles.proposeText}>{s.viewNegotiate}</AppText>
                                    <Image source={assets.chevron} style={styles.chevronIcon} />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.proposeLink, jobDetails.invitationStatus === 'accepted' && { opacity: 0.5 }]}
                                    onPress={() => {
                                        if (isRestricted) {
                                            setIsKycPopupVisible(true);
                                            return;
                                        }
                                        setShowModal(true);
                                    }}
                                    disabled={jobDetails.invitationStatus === 'accepted'}
                                >
                                    <AppText style={styles.proposeText}>{s.proposeRate}</AppText>
                                    <Image source={assets.chevron} style={styles.chevronIcon} />
                                </TouchableOpacity>
                            )
                        )}
                    </View>

                    <View style={[styles.detailItem, { alignItems: 'flex-start', marginRight: horizontalScale(20) }]}>
                        <Image source={assets.location} style={styles.detailIcon} />
                        <AppText style={styles.detailText}>
                            {jobDetails.location}
                        </AppText>
                    </View>

                    <View style={styles.dateTimeRow}>
                        <View style={[styles.detailItem, { marginBottom: 0, marginRight: 15 }]}>
                            <Image source={assets.calendar} style={styles.detailIcon} />
                            <AppText style={styles.detailText}>{jobDetails.dateRange}</AppText>
                        </View>
                        <View style={[styles.detailItem, { marginBottom: 0 }]}>
                            <Image source={assets.clock} style={styles.detailIcon} />
                            <AppText style={styles.detailText}>{jobDetails.timeRange}</AppText>
                        </View>
                    </View>
                </View>

                <AppText style={styles.sectionTitle}>{s.aboutThisJob}</AppText>
                <View style={styles.descriptionBox}>
                    <AppText style={styles.descriptionText}>
                        {jobDetails.description || s.noDescriptionProvided}
                    </AppText>
                </View>

                {/* Certification Section */}
                <AppText style={styles.sectionTitle}>{s.requiredCertification}</AppText>
                <View style={styles.certificationBox}>
                    {(jobDetails.certifications || []).map((skill: any, index: number) => (
                        <AppText key={index} style={styles.certText}>
                            •  {typeof skill === 'object' ? skill.name : skill}
                        </AppText>
                    ))}
                    {(!jobDetails.certifications || jobDetails.certifications.length === 0) && (
                        <AppText style={styles.certText}>{s.noSpecificCertifications}</AppText>
                    )}
                </View>

                {/* Contractors Required Section */}
                <View style={styles.contractorRow}>
                    <AppText style={styles.contractorLabel}>{s.requiredContractor}</AppText>
                    <View style={styles.countBox}>
                        <AppText style={styles.countText}>{jobDetails.requiredContractors}</AppText>
                    </View>
                </View>

                <View style={styles.contractorRowBottom}>
                    <AppText style={styles.contractorLabel}>{s.assignedContractor}</AppText>
                    <View style={styles.countBox}>
                        <AppText style={styles.countText}>{jobDetails.assignedContractors}</AppText>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons */}

            {jobDetails.status?.toLowerCase() !== 'expired' && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.footerButton, styles.declineButton, respondingStatus && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={() => handleRespond('declined')}
                        disabled={!!respondingStatus}
                    >
                        {respondingStatus === 'declined' ? (
                            <ActivityIndicator color={colors.red} />
                        ) : (
                            <AppText style={styles.declineBtnText}>{s.decline}</AppText>
                        )}
                    </TouchableOpacity>
                    {!(jobDetails.hasProposedRate || !!jobDetails.negotiateRate) ? (
                        <TouchableOpacity
                            style={[styles.footerButton, styles.acceptButton, respondingStatus && { opacity: 0.5 }]}
                            activeOpacity={0.7}
                            onPress={() => handleRespond('accepted')}
                            disabled={!!respondingStatus}
                        >
                            {respondingStatus === 'accepted' ? (
                                <ActivityIndicator color={colors.successGreen} />
                            ) : (
                                <AppText style={styles.acceptBtnText}>{s.accept}</AppText>
                            )}
                        </TouchableOpacity>
                    ) : null}
                </View>
            )}


            {/* Propose Rate Modal */}
            <ProposeRateModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleProposeRate}
                isLoading={isSubmitting}
            />

            {/* Negotiate Rate Modal */}
            <NegotiateRateModal
                visible={showNegotiateModal}
                onClose={() => setShowNegotiateModal(false)}
                jobTitle={jobDetails?.title || ''}
                originalOffer={String(jobDetails?.rate || '')}
                proposedRate={String(negotiationData?.proposedRate || jobDetails?.negotiateRate || '')}
                clientRate={String(negotiationData?.counterOfferRate || '0')}
                onReject={() => {
                    setShowNegotiateModal(false);
                    handleRespond('declined');
                }}
                onAccept={() => {
                    setShowNegotiateModal(false);
                    handleRespond('accepted');
                }}
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

export default InvitationDetailsScreen;
