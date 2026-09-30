import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import TopHeader from '@components/TopHeader';
import JobMatchDetailsSkeleton from './components/JobMatchDetailsSkeleton';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import NegotiatePopup from '../componts/NegotiatePopup';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

type JobMatchDetailsRouteProp = RouteProp<ClientAppStackParamList, 'JobMatchDetails'>;



const JobMatchDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<JobMatchDetailsRouteProp>();
    const { jobData: initialJobData, isPending: routeIsPending } = route.params || {};
    const t = strings.client.jobMatches;
    
    const [jobDetails, setJobDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isNegotiateVisible, setIsNegotiateVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);

    const handleAction = async (action: 'accept' | 'reject') => {
        const targetId = jobDetails?.applicationId || jobDetails?._id || jobDetails?.matchId || jobDetails?.id;
        if (!targetId) return;

        setActionLoading(action);
        try {
            let res;
            if (action === 'accept') {
                res = await JobService.acceptMatch(targetId);
            } else {
                res = await JobService.rejectMatch(targetId);
            }

            if (res.success) {
                Toast.show({ type: 'success', text2: res.message || t.matchActionSuccess(action) });
                navigation.goBack();
            } else {
                Toast.show({ type: 'error', text2: res.message || t.failedToMatchAction(action) });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text2: error.message || t.errorWhileMatchingAction(action) });
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setHasError(false);
            // Check all possible ID keys from different match types
            const targetId = initialJobData?.applicationId || initialJobData?._id || initialJobData?.matchId || initialJobData?.id;
            if (!targetId) {
                devDebugger.warn('No valid ID found to fetch match details. JobData:', initialJobData);
                setHasError(true);
                setLoading(false);
                return;
            }

            try {
                const response = await JobService.getMatchDetails(targetId);
                if (response.success && response.data) {
                    // Combine initial shallow data with the deep data from the details API
                    setJobDetails({ ...initialJobData, ...(response.data.results || response.data) });
                } else {
                    setHasError(true);
                    setJobDetails(null);
                }
            } catch (error: any) {
                devDebugger.error('Error fetching job match details:', error);
                setHasError(true);
                Toast.show({
                    type: 'error',
                    text2: error.message || t.failedToFetchDetails
                });
                setJobDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [initialJobData]);

    // Use jobDetails state for rendering
    const isPending = routeIsPending ?? (jobDetails?.applicationStatus === 'pending' || jobDetails?.status === 'Pending');
    const formattedStartDate = getLocalDateTime(jobDetails?.jobStartDate || jobDetails?.date).date;
    const formattedEndDate = getLocalDateTime(jobDetails?.jobEndDate).date;
    const isPendingApi = jobDetails?.applicationStatus == 'pending';

    const isRateProposed = jobDetails?.isRateProposed || jobDetails?.isNegotiated || jobDetails?.isProposeRate || jobDetails?.isNegotiate || !!jobDetails?.proposedRate || !!jobDetails?.counterOfferRate || !!jobDetails?.counterOffer;
    const originalRate = jobDetails?.originalHourlyRate || jobDetails?.jobHourlyRate || jobDetails?.originalOfferRate || 0;
    const negotiateRate =  jobDetails?.proposedRate || jobDetails?.finalRate || 0;
    
    const noData = hasError || !jobDetails || (!jobDetails.jobTitle && !jobDetails.title && !jobDetails.contractorName && !jobDetails.name);

    const renderContent = () => {
        if (loading) {
            return <JobMatchDetailsSkeleton />;
        }
        
        if (noData) {
            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title={t.noDetailsFound} description={t.relatedDataNotFound} />
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={[styles.content, !isPending && { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                            <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.nameText}>{jobDetails?.contractorName || jobDetails?.name}</AppText>
                            <AppText numberOfLines={1} style={styles.hourlyRateText}>{t.hourlyRate} {formatCurrency(jobDetails?.contractorHourlyRate || jobDetails?.hourlyRate || 0)}/h</AppText>
                        </View>
                        <View style={[styles.statusBadge, getStatusStyles(jobDetails?.applicationStatus ).badge]}>
                            <AppText style={[styles.statusText, getStatusStyles(jobDetails?.applicationStatus ).text]}>
                                {getStatusStyles(jobDetails?.applicationStatus).label}
                            </AppText>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Job Title & Negotiate */}
                    <View style={styles.jobTitleRow}>
                        <View style={{ flex: 1 }}>
                            <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.jobTitle}>
                                {jobDetails?.jobTitle || jobDetails?.title}
                            </AppText>
                        </View>
                        {(isRateProposed) && (
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }} onPress={() => setIsNegotiateVisible(true)}>
                                <AppText style={styles.viewNegotiateText}>{t.viewNegotiate}</AppText>
                                <Image source={require('@assets/images/common/dropdown.png')} style={styles.chevronIcon} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <AppText style={styles.companyText}>{jobDetails?.organizationName}</AppText>

                    {/* Job Details Rows */}
                    <View style={styles.iconRow}>
                        <Image source={require('@assets/images/common/doller.png')} style={styles.iconSmall} />
                        <AppText style={[styles.iconText, isRateProposed && { textDecorationLine: 'line-through' }]}>
                            {t.jobRate} {formatCurrency(originalRate)}/h
                        </AppText>
                        {isRateProposed && (
                            jobDetails?.finalRate ?
                            <AppText style={[styles.iconText, { marginLeft: 8 }]}>
                                {t.negotiatedRateLabel(jobDetails.finalRate)}
                            </AppText>
                            : 
                              <AppText style={[styles.iconText, { marginLeft: 8 }]}>
                                {t.proposedRateLabel(negotiateRate)}
                            </AppText>
                        )}
                    </View>

                    <View style={[styles.iconRow, { alignItems: 'flex-start' }]}>
                        <Image source={require('@assets/images/common/locationPin.png')} style={styles.iconSmall} />
                        <AppText style={styles.iconText} >{jobDetails?.jobLocation || t.noLocationProvided}</AppText>
                    </View>

                    <View style={[styles.iconRow, { marginBottom: 0 }]}>
                        <View style={styles.dateItem}>
                            <Image source={require('@assets/images/common/calanderGray.png')} style={styles.iconSmall} />
                            <AppText style={styles.iconText}>
                                {formattedStartDate} {formattedEndDate ? `- ${formattedEndDate}` : ''}
                            </AppText>
                        </View>
                        <View style={styles.dateItem}>
                            <Image source={require('@assets/images/common/clockGray.png')} style={styles.iconSmall} />
                            <AppText style={styles.iconText}>{getLocalDateTime(jobDetails?.jobStartDate || jobDetails?.date).time} - {getLocalDateTime(jobDetails?.jobEndDate).time}</AppText>
                        </View>
                    </View>

                    {/* About this Job */}
                    <AppText style={styles.sectionTitle}>{t.aboutJob}</AppText>
                    <View style={styles.boxContainer}>
                        <AppText style={styles.boxText}>{jobDetails?.jobDescription || jobDetails?.about || t.noDescriptionProvided}</AppText>
                    </View>

                    {/* Required Certification */}
                    {(jobDetails?.certifications?.length > 0 || jobDetails?.requiredCertifications?.length > 0) && (
                        <>
                            <AppText style={styles.sectionTitle}>{t.requiredCertification}</AppText>
                            <View style={styles.boxContainer}>
                                {(jobDetails?.certifications || jobDetails?.requiredCertifications || []).map((cert: any, index: number, arr: any[]) => (
                                    <View key={index} style={[styles.bulletRow, index === arr.length - 1 && { marginBottom: 0 }]}>
                                        <AppText style={styles.bulletPoint}>•</AppText>
                                        <AppText style={styles.bulletText}>{cert?.name || cert}</AppText>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Required Contractor */}
                    {jobDetails?.contractorRequiredCount !== undefined && (
                        <View style={styles.contractorRow}>
                            <AppText style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>{t.requiredContractor}</AppText>
                            <View style={styles.contractorBox}>
                                <AppText style={styles.contractorCount}>{jobDetails?.contractorRequiredCount || 1}</AppText>
                            </View>
                        </View>
                    )}
                </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={t.detailsTitle} onBack={() => navigation.goBack()} />

            {renderContent()}

            {/* Bottom Actions */}
            {isPending && !loading && !noData && (
                <View style={styles.bottomActionWrapper}>
                    {jobDetails?.counterOfferRate ? (
                        <View style={styles.counterOfferTextContainer}>
                            <AppText style={styles.counterOfferText}>{t.counterOfferPendingMsg}</AppText>
                        </View>
                    ) : (
                        <View style={styles.bottomActionContainer}>
                            <TouchableOpacity 
                                style={[styles.btnDecline, !!actionLoading && { opacity: 0.5 }]} 
                                onPress={() => handleAction('reject')}
                                disabled={!!actionLoading}
                            >
                                {actionLoading === 'reject' ? (
                                    <ActivityIndicator size="small" color={colors.red} />
                                ) : (
                                    <AppText style={styles.btnDeclineText}>{t.decline}</AppText>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.btnAccept, !!actionLoading && { opacity: 0.5 }]} 
                                onPress={() => handleAction('accept')}
                                disabled={!!actionLoading}
                            >
                                {actionLoading === 'accept' ? (
                                    <ActivityIndicator size="small" color={colors.successGreen} />
                                ) : (
                                    <AppText style={styles.btnAcceptText}>{t.accept}</AppText>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            <NegotiatePopup
                visible={isNegotiateVisible}
                onClose={() => setIsNegotiateVisible(false)}
                applicationId={jobDetails?.applicationId || jobDetails?._id || jobDetails?.matchId || jobDetails?.id || ''}
                candidateName={jobDetails?.contractorName || jobDetails?.name || t.unknownContractor}
                originalOffer={`${formatCurrency(jobDetails?.jobHourlyRate || jobDetails?.originalOfferRate || 0)}/h`}
                proposedOffer={`${formatCurrency(jobDetails?.proposedRate || jobDetails?.counterOfferRate || 0)}/h`}
                initialCounterOffer={jobDetails?.counterOfferRate ? `${formatCurrency(jobDetails?.counterOfferRate)}/h` : ''}
                isNegotiate={!!jobDetails?.isNegotiate}
                isHide={!isPending}
                onSuccess={() => {
                    setIsNegotiateVisible(false);
                    navigation.goBack();
                }}
            />
        </View>
    );
};

export default JobMatchDetailsScreen;
