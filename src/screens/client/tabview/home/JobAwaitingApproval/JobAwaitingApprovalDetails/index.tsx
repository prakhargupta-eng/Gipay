import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, Image, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import strings from '@constants/strings';
import Colors from '@styles/colors';
import styles from './styles';
import TopHeader from '@components/TopHeader';
import AppText from '@components/AppText';
import JobService from '@config/jobService';
import AwaitingApprovalSkeleton from '@components/AwaitingApprovalSkeleton';
import { Toast } from '@utils/ToastManager';
import { getLocalDateTime } from '@utils/dateUtils';
import EmptyState from '@components/EmptyState';

const dollarIcon = require('@assets/images/common/doller.png');
const locationIcon = require('@assets/images/common/locationPin.png');
const calendarIcon = require('@assets/images/common/calanderGray.png');
const clockIcon = require('@assets/images/common/clockGray.png');
import { devDebugger } from '@utils/devDebugger';

const AvatarImage = ({ source, style }: { source: any, style: any }) => {
    const [imgLoading, setImgLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const fallbackSource = require('@assets/images/common/dummyUser.png');
    const imageSource = (hasError || !source || !source.uri) ? fallbackSource : source;

    return (
        <View style={[style, styles.avatarContainer]}>
            <FastImage
                source={imageSource}
                style={styles.avatarImage}
                onLoadStart={() => setImgLoading(true)}
                onLoadEnd={() => setImgLoading(false)}
                onError={() => {
                    setImgLoading(false);
                    setHasError(true);
                }}
            />
            {imgLoading && !hasError && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>
    );
};

type JobAwaitingApprovalDetailsRouteProp = RouteProp<ClientAppStackParamList, 'JobAwaitingApprovalDetails'>;

const JobAwaitingApprovalDetailsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientAppStackParamList>>();
    const route = useRoute<JobAwaitingApprovalDetailsRouteProp>();
    const { jobData } = route.params;
    const t = strings.client.jobAwaitingApproval;

    const [detailData, setDetailData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                setHasError(false);
                const jobId = jobData?.jobId || jobData?.job?._id || jobData?.id || jobData?._id;
                const contractorId = jobData?.contractorId || jobData?.contractor?._id;
                
                if (!jobId || !contractorId) {
                    setHasError(true);
                    setLoading(false);
                    return;
                }
                
                const res = await JobService.getAwaitingApprovalJobDetails(jobId, contractorId);
                if (res.success && res.data) {
                    setDetailData(res.data.results || res.data.data || res.data);
                } else {
                    setHasError(true);
                    setDetailData(null);
                }
            } catch (err: any) {
                devDebugger.error('Failed to load Awaiting Approval details', err);
                setHasError(true);
                Toast.show({ type: 'error', text2: err.message || t.loadDetailsFailed });
                setDetailData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [jobData]);

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <TopHeader title={t.detailsTitle} onBack={() => navigation.goBack()} />
                <AwaitingApprovalSkeleton />
            </View>
        );
    }

    if (hasError || !detailData) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <TopHeader title={t.detailsTitle} onBack={() => navigation.goBack()} />
                <View style={{ flex: 1 }}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title={t.noDetailsFound} description={t.relatedDataNotFound} />
                </View>
            </View>
        );
    }

    const displayData = detailData;
    const profileImage = displayData?.contractorProfilePicture;
    const contractorName = displayData?.contractorName;
    const jobRole = displayData?.jobTitle;
    const contractorHourlyRate = displayData?.contractorHourlyRate || '0';
    const hourlyRate = displayData?.workerHourlyRate || '0';
    const location = displayData?.jobLocation;
    
    const dateStr = displayData?.jobStartDate ? `${getLocalDateTime(displayData.jobStartDate).date} - ${getLocalDateTime(displayData.jobEndDate).date}` : '';
    const timeStr = displayData?.jobStartDate ? `${getLocalDateTime(displayData.jobStartDate).time} - ${getLocalDateTime(displayData.jobEndDate).time}` : '';
    const description = displayData?.description;
    
    const certifications = displayData?.requiredCertifications || displayData?.certifications || [];
    const certsArray = Array.isArray(certifications) ? certifications : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            <TopHeader title={t.detailsTitle} onBack={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileRow}>
                    <AvatarImage source={{ uri: profileImage }} style={styles.avatar} />
                    <View>
                        <AppText style={styles.nameText}>{contractorName}</AppText>
                        <AppText style={styles.rateText}>{t.hourlyRateLabel}{formatCurrency(contractorHourlyRate)}/h</AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <AppText style={styles.sectionTitle}>{jobRole}</AppText>

                <View style={styles.jobInfoRow}>
                    <Image source={dollarIcon} style={styles.iconSmall} />
                    <AppText style={styles.infoText}>{t.jobRate} {formatCurrency(hourlyRate)}/h</AppText>
                </View>
                
                <View style={styles.jobInfoRowStart}>
                    <Image source={locationIcon} style={styles.iconSmall} />
                    <AppText style={styles.infoTextWithMargin}>{location}</AppText>
                </View>

                <View style={styles.dateTimeRow}>
                    <View style={styles.jobInfoRow}>
                        <Image source={calendarIcon} style={styles.iconSmall} />
                        <AppText style={styles.infoText}>{dateStr}</AppText>
                    </View>
                    <View style={styles.jobInfoRowWithMarginLeft}>
                        <Image source={clockIcon} style={styles.iconSmall} />
                        <AppText style={styles.infoText}>{timeStr}</AppText>
                    </View>
                </View>

                <AppText style={styles.sectionTitle}>{t.aboutJob}</AppText>
                <View style={styles.aboutBox}>
                    <AppText style={styles.aboutText}>
                        {description}
                    </AppText>
                </View>

                <AppText style={styles.sectionTitle}>{t.requiredCertification}</AppText>
                <View style={styles.certList}>
                    {certsArray.length > 0 ? certsArray.map((cert: any, index: number) => (
                        <View key={index} style={styles.certItem}>
                            <View style={styles.bullet} />
                            <AppText style={styles.certText}>{typeof cert === 'string' ? cert : cert?.name}</AppText>
                        </View>
                    )) : (
                        <AppText style={styles.infoText}>{t.noCertificationsRequired}</AppText>
                    )}
                </View>

                <View style={styles.countRow}>
                    <AppText style={styles.countLabel}>{t.requiredContractor}</AppText>
                    <View style={styles.countValueBox}>
                        <AppText style={styles.countValue}>{displayData?.requiredContractors || '0'}</AppText>
                    </View>
                </View>

                <View style={styles.countRow}>
                    <AppText style={styles.countLabel}>{t.assignedContractor}</AppText>
                    <View style={styles.countValueBox}>
                        <AppText style={styles.countValue}>{displayData?.assignedContractors || '0'}</AppText>
                    </View>
                </View>
                
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

export default JobAwaitingApprovalDetailsScreen;
