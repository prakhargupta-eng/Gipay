import React from 'react';
import {
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Image
} from 'react-native';
import { Toast } from '@utils/ToastManager';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';

import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import EvidenceSheetModal from '@components/EvidenceSheetModal';
import DetailsSkeleton from './components/DetailsSkeleton';
import { getLocalDateTime } from '@utils/dateUtils';
import DisputeService from '@config/disputeService';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import HyperlinkText from '@components/HyperlinkText';

type NavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'DisputeDetails'>;
type DetailsRouteProp = RouteProp<ClientAppStackParamList, 'DisputeDetails'>;

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

    const evidenceList: any[] = React.useMemo(() => {
        let parsedEvidence = details?.evidence;
        if (typeof parsedEvidence === 'string') {
            try {
                const parsed = JSON.parse(parsedEvidence);
                if (Array.isArray(parsed)) parsedEvidence = parsed;
            } catch (e) { }
        }
        return Array.isArray(parsedEvidence) ? parsedEvidence : (parsedEvidence ? [parsedEvidence] : []);
    }, [details?.evidence]);

    const handleViewAttachment = (evidence: any) => {
        try {
            let parsedEvidence = evidence;
            if (typeof evidence === 'string') {
                try {
                    const parsed = JSON.parse(evidence);
                    if (Array.isArray(parsed)) {
                        parsedEvidence = parsed;
                    }
                } catch (e) { }
            }
            const evidenceArray = Array.isArray(parsedEvidence) ? parsedEvidence : (parsedEvidence ? [parsedEvidence] : []);

            if (evidenceArray.length === 0) {
                Toast.show({ type: 'info', text2: strings.auth.contractor.disputes.evidenceNotFound });
                return;
            }

            if (evidenceArray.length > 1) {
                setSheetEvidences(evidenceArray);
                setSheetJobTitle(details?.job?.title ? String(details.job.title) : (strings.client.disputes.disputeEvidence));
                setIsSheetVisible(true);
                return;
            }

            const firstItem = evidenceArray[0];
            const fileUrl = typeof firstItem === 'string' ? firstItem : (firstItem && typeof firstItem === 'object' ? firstItem.fileUrl : null);
            if (!fileUrl || typeof fileUrl !== 'string') {
                Toast.show({ type: 'error', text2: 'No valid attachment found.' });
                return;
            }
            const cleanUrl = fileUrl.split('?')[0];
            const ext = cleanUrl.split('.').pop()?.toLowerCase() || '';
            const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];

            if (!supportedExtensions.includes(ext)) {
                Toast.show({
                    type: 'error',
                    text2: 'Unsupported file format. This file is not viewable.'
                });
                return;
            }

            navigation.navigate('WebView', {
                url: fileUrl,
                title: 'Attachment'
            });
        } catch (error) {
            Toast.show({ type: 'error', text2: 'Unable to open attachment.' });
        }
    };

    /**
     * Fetches specific dispute details from the API.
     */
    const fetchDetails = async () => {
        setLoading(true);
        setHasError(false);
        try {
            const res = await DisputeService.getDisputeClientDetails(disputeId);
            if (res.success && res.data) {
                setDetails(res.data);
            } else {
                setHasError(true);
                Toast.show({
                    type: 'error',
                    text2: res.message || 'Failed to load dispute details'
                });
            }
        } catch (error: any) {
            setHasError(true);
            Toast.show({
                type: 'error',
                text2: error.message || 'Something went wrong'
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDetails();
    }, [disputeId]);

    const screenTitle = type === 'by' ? strings.client.disputes.byClient : strings.client.disputes.forClient;

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
                <View style={{ flex: 1 }}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title="No Details Found" description="Related data not found at the moment." />
                </View>
            </View>
        );
    }

    const jobData = details.jobId || (details as any).job || {};

    // Determine the contractor name to display in the header of the card
    const contractorName = type === 'by'
        ? (details.otherParty?.fullName || details.initiatedFor?.fullName || '')
        : (details.initiatedBy?.fullName || details.otherParty?.fullName || '');

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={contractorName}
                subtitle={`${strings.client.disputes.disputeId}${details.disputeId}`}
                onBack={() => navigation.goBack()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ── Dispute Info Card ── */}
                <View style={styles.disputeCard}>
                    <View style={styles.titleInfo}>
                        <View style={styles.disputeHeader}>
                            <AppText style={styles.disputeLabel}>{strings.client.disputes.disputeTitle}</AppText>
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
                        <AppText style={styles.disputeTitle}>{details.subject}</AppText>
                    </View>

                    <View style={styles.section}>
                        <AppText style={styles.disputeLabel}>{strings.client.disputes.disputeDescription}</AppText>
                        <HyperlinkText
                            text={details?.description }
                            style={styles.disputeDesc}
                        />
                    </View>

                    {evidenceList.length > 0 && (
                        <TouchableOpacity
                            style={styles.attachmentBtn}
                            activeOpacity={0.8}
                            onPress={() => handleViewAttachment(details.evidence)}
                        >
                            <Image source={require('@assets/images/common/attechments.png')} style={styles.attachmentIcon} />
                            <AppText style={styles.attachmentText}>
                                {`${strings.client.disputes.viewAttachment} (${evidenceList.length})`}
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Job Info Section ── */}
                <View>
                    <AppText style={styles.jobTitle}>{jobData.title}</AppText>
                    <AppText style={styles.company}>{jobData.organizationName}</AppText>

                    <View style={styles.ratingRow}>
                        <Image source={require('@assets/images/common/star.png')} style={styles.starIcon} />
                        <AppText style={styles.ratingText}>{String(details.otherParty?.rating ?? 0)}</AppText>
                    </View>

                    <View style={styles.tagItem}>
                        <Image source={require('@assets/images/common/doller.png')} style={styles.tagIcon} />
                        <AppText style={styles.tagText}>{strings.auth.contractor.home.jobRate(jobData.hourlyRate)}</AppText>
                    </View>

                    <View style={[styles.tagItem, { alignItems: 'flex-start' }]}>
                        <Image source={require('@assets/images/common/locationPin.png')} style={styles.tagIcon} />
                        <AppText style={styles.tagText}>{jobData.location}</AppText>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <View style={styles.tagItem}>
                            <Image source={require('@assets/images/common/calander.png')} style={styles.tagIcon} />
                            <AppText style={styles.tagText}>
                                {`${getLocalDateTime(jobData.startDate).date} - ${getLocalDateTime(jobData.endDate).date}`}
                            </AppText>
                        </View>
                        <View style={styles.tagItem}>
                            <Image source={require('@assets/images/common/blackClock.png')} style={styles.tagIcon} />
                            <AppText style={styles.tagText}>
                                {`${getLocalDateTime(jobData.startDate).time} - ${getLocalDateTime(jobData.endDate).time}`}
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
                        <AppText style={styles.groupTitle}>{strings.client.disputes.requiredCertification}</AppText>
                        <View style={styles.certBox}>
                            {jobData.requiredCertifications.map((cert: any, index: number) => (
                                <AppText key={index} style={styles.certItem}>•  {typeof cert === 'string' ? cert : cert.name || 'Unknown'}</AppText>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── Required Contractor ── */}
                {jobData.contractorsRequired !== undefined && (
                    <View style={styles.contractorSection}>
                        <AppText style={styles.groupTitle}>{strings.client.disputes.requiredContractor}</AppText>
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
