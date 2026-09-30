import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';

import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import DetailsSkeleton from './components/DetailsSkeleton';
import { formatDate, getLocalDateTime } from '@utils/dateUtils';
import AppText from '@components/AppText';
import { Toast } from '@utils/ToastManager';
import EmptyState from '@components/EmptyState';
import EvidenceSheetModal from '@components/EvidenceSheetModal';
import DisputeService from '@config/disputeService';
import { devDebugger } from '@utils/devDebugger';
import HyperlinkText from '@components/HyperlinkText';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'DisputeDetails'>;
type DetailsRouteProp = RouteProp<ContractorAppStackParamList, 'DisputeDetails'>;

const parseEvidence = (rawEvidence: any): any[] => {
    if (!rawEvidence) {
        return [];
    }
    let parsed = rawEvidence;
    if (typeof parsed === 'string') {
        try {
            const json = JSON.parse(parsed);
            if (Array.isArray(json)) {
                parsed = json;
            } else if (json && typeof json === 'object') {
                parsed = [json];
            } else if (typeof json === 'string') {
                parsed = json;
            }
        } catch (_ignoredError) {
            // Ignored: Evidence may be a direct URL string rather than serialized JSON
        }
    }
    if (Array.isArray(parsed)) {
        return parsed;
    }
    return [parsed];
};

const DisputeDetails = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<DetailsRouteProp>();
    const { disputeId, type } = route.params;

    const [details, setDetails] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    
    // For Evidence Sheet Modal
    const [isSheetVisible, setIsSheetVisible] = React.useState(false);
    const [sheetEvidences, setSheetEvidences] = React.useState<any[]>([]);
    const [sheetJobTitle, setSheetJobTitle] = React.useState('');

    const evidenceList = React.useMemo(() => parseEvidence(details?.evidence), [details?.evidence]);

    /**
     * Fetches specific dispute details from the API using the disputeId.
     */
    const fetchDetails = async () => {
        setLoading(true);
        setHasError(false);
        try {
            const response = await DisputeService.getContractorDisputeDetails(disputeId);
            if (response.success && response.data) {
                setDetails(response.data);
            } else {
                setHasError(true);
            }
        } catch (error) {
            devDebugger.error('Error fetching dispute details:', error);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Effect to fetch details when the component mounts or when disputeId changes.
     */
    React.useEffect(() => {
        fetchDetails();
    }, [disputeId]);

    const screenTitle = type === 'by' ? strings.auth.contractor.disputes.byContractor : strings.auth.contractor.disputes.forContractor;

    if (loading) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader title={screenTitle} onBack={() => navigation.goBack()} />
                <DetailsSkeleton />
            </View>
        );
    }

    if (hasError || !details) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader title={screenTitle} onBack={() => navigation.goBack()} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <EmptyState 
                        imageSource={require('@assets/images/common/noData.png')} 
                        title={strings.auth.contractor.disputes.noDetailsFoundTitle} 
                        description={strings.auth.contractor.disputes.noDetailsFoundDesc} 
                    />
                </View>
            </View>
        );
    }

    const jobData = details.jobId || (details as any).job || {};
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={screenTitle} onBack={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ── Dispute Info Card ── */}
                <View style={styles.disputeCard}>
                    <View style={styles.disputeHeader}>
                        <AppText style={styles.disputeLabel}>{strings.auth.contractor.disputes.disputeTitle}</AppText>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: details.status === 'resolved' ? colors.badgeGreen : colors.badgeAmber }
                        ]}>
                            <AppText style={[
                                styles.statusText,
                                { color: details.status === 'resolved' ? colors.badgeGreenText : colors.bageDarkOrage }
                            ]}>
                                {String(details.displayStatus || details.status || '')}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.titleInfo}>
                        <AppText style={styles.disputeTitle}>{details.subject}</AppText>
                    </View>

                    <View style={styles.section}>
                        <AppText style={styles.disputeLabel}>{strings.auth.contractor.disputes.disputeDescription}</AppText>
                        <HyperlinkText
                            text={details?.description}
                            style={styles.disputeDesc}
                        />
                    </View>


                    {evidenceList.length > 0 && (
                        <TouchableOpacity
                            style={styles.attachmentBtn}
                            activeOpacity={0.8}
                            onPress={() => {
                                try {
                                    if (evidenceList.length > 1) {
                                        setSheetEvidences(evidenceList);
                                        setSheetJobTitle(strings.auth.contractor.disputes.disputeEvidence);
                                        setIsSheetVisible(true);
                                    } else {
                                        const firstItem = evidenceList[0];
                                        let fileUrl: string | null = null;
                                        if (typeof firstItem === 'string') {
                                            fileUrl = firstItem;
                                        } else if (firstItem && typeof firstItem === 'object' && 'fileUrl' in firstItem) {
                                            fileUrl = firstItem.fileUrl;
                                        }

                                        if (!fileUrl || typeof fileUrl !== 'string') {
                                            Toast.show({ type: 'info', text2: 'Invalid attachment' });
                                        } else {
                                            navigation.navigate('WebView', {
                                                url: fileUrl,
                                                title: strings.auth.contractor.disputes.attachment
                                            });
                                        }
                                    }
                                } catch (err) {
                                    devDebugger.error('Error opening attachment:', err);
                                    Toast.show({ type: 'error', text2: 'Unable to open attachment.' });
                                }
                            }}
                        >
                            <Image source={require('@assets/images/common/attechments.png')} style={styles.attachmentIcon} />
                            <AppText style={styles.attachmentText}>
                                {strings.auth.contractor.disputes.viewAttachment} {`(${evidenceList.length})`}
                            </AppText>
                        </TouchableOpacity>
                    )}

                </View>

                {/* ── Job Info Section ── */}
                <View>
                    <AppText style={styles.jobTitle}>{jobData.title}</AppText>
                    <AppText style={styles.company}>{jobData.organizationName}</AppText>

                    {/* Assuming rating isn't in the provided snippet but usually present in similar UIs */}
                    <View style={styles.ratingRow}>
                        <Image source={require('@assets/images/common/star.png')} style={styles.starIcon} />
                        <AppText style={styles.ratingText}>{String(details.otherParty?.rating ?? details.rating ?? 0)}</AppText>
                    </View>

                    <View style={styles.tagItem}>
                        <Image source={require('@assets/images/common/doller.png')} style={styles.tagIcon} />
                        <AppText style={styles.tagText}>{strings.auth.contractor.home.jobRate(jobData.hourlyRate)}</AppText>
                    </View>

                    <View style={[styles.tagItem, { alignItems: 'flex-start' }]}>
                        <Image source={require('@assets/images/common/locationPin.png')} style={styles.tagIcon} />
                        <AppText style={styles.tagText}>{jobData.location}</AppText>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={styles.tagItem}>
                            <Image source={require('@assets/images/common/calander.png')} style={styles.tagIcon} />
                            <AppText style={styles.tagText}>
                                {`${getLocalDateTime(jobData.startDate).date} - ${getLocalDateTime(jobData.endDate).date}`}
                            </AppText>
                        </View>
                        <View style={styles.tagItem}>
                            <Image source={require('@assets/images/common/blackClock.png')} style={styles.tagIcon} />
                            <AppText style={styles.tagText}>
                                {jobData.startDate && jobData.endDate
                                    ? `${getLocalDateTime(jobData.startDate).time} - ${getLocalDateTime(jobData.endDate).time}`
                                    : '' 
                                }
                            </AppText>
                        </View>
                    </View>
                </View>

                {/* ── Description Box ── */}
                <View style={styles.detailsGroup}>
                    <AppText style={styles.groupTitle}>{strings.common.description}</AppText>
                    <View style={styles.descBox}>
                        <AppText style={styles.descText}>
                            {jobData.description}
                        </AppText>
                    </View>
                </View>

                {/* ── Required Certification ── */}
                {jobData.requiredCertifications && jobData.requiredCertifications.length > 0 && (
                    <View style={styles.detailsGroup}>
                        <AppText style={styles.groupTitle}>{strings.auth.contractor.disputes.requiredCertification}</AppText>
                        <View style={styles.certBox}>
                            {jobData.requiredCertifications.map((cert: any, index: number) => (
                                <AppText key={index} style={styles.certItem}>•  {typeof cert === 'string' ? cert : cert.name || strings.common.unknown}</AppText>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── Required Contractor ── */}
                {jobData.contractorsRequired !== undefined && (
                    <View style={styles.contractorSection}>
                        <AppText style={styles.groupTitle}>{strings.auth.contractor.disputes.requiredContractor}</AppText>
                        <View style={styles.countBox}>
                            <AppText style={styles.countText}>{String(jobData.contractorsRequired)}</AppText>
                        </View>
                    </View>
                )}
            </ScrollView>
            <EvidenceSheetModal
                visible={isSheetVisible}
                onClose={() => setIsSheetVisible(false)}
                evidences={sheetEvidences}
                jobTitle={sheetJobTitle}
            />
        </View>
    );
};

export default DisputeDetails;

