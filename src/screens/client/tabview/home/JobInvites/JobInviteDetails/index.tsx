import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import {
  View,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import strings, { CURRENCY } from '@constants/strings';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import TopHeader from '@components/TopHeader';
import colors from '@styles/colors';
import styles from './styles';
import { horizontalScale } from '@styles/mixins';
import { getJobInviteDetails } from '@config/invitationService';
import InviteDetailsSkeleton from './components/InviteDetailsSkeleton';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'JobInviteDetails'>;
type DetailsRouteProp = RouteProp<ClientAppStackParamList, 'JobInviteDetails'>;



const JobInviteDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<DetailsRouteProp>();
    const { invitationId } = route.params;

    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                setHasError(false);
                const res: any = await getJobInviteDetails(invitationId);

                if (res.success && (res.results || res.data)) {
                    const item = res.results || res.data;
                    const contractorObj = item.contractor || {};
                    const jobObj = item.job || {};

                    setDetails({
                        invitationId: item.invitationId || item.id || item._id,
                        jobId: jobObj.jobId || jobObj.id || item.jobId || '',
                        contractorId: contractorObj.id || contractorObj._id || item.contractorId || '',
                        invitationStatus: item.invitationStatus || item.status || 'pending',
                        contractorName: item.contractorName || contractorObj.fullName || contractorObj.name,
                        workerHourlyRate: item.workerHourlyRate || item.contractorHourlyRate || contractorObj.hourlyRate || item.hourlyRate || 0,
                        jobPrice: item.jobPrice || item.jobRate || jobObj.hourlyRate || item.hourlyRate || 0,
                        jobTitle: item.jobTitle || jobObj.title || item.title,
                        jobDescription: item.jobDescription || jobObj.description || item.description,
                        jobStartDate: item.jobStartDate || jobObj.startDate || item.startDate || '',
                        jobEndDate: item.jobEndDate || jobObj.endDate || item.endDate || '',
                        jobStartTime: item.jobStartTime || jobObj.startTime || item.startTime || '',
                        jobEndTime: item.jobEndTime || jobObj.endTime || item.endTime || '',
                        organizationName: item.organizationName || jobObj.organizationName,
                        jobLocation: item.jobLocation || jobObj.location,
                        requiredCertifications: item.requiredCertifications || jobObj.requiredCertifications || [],
                        requiredContractors: item.requiredContractors || jobObj.requiredContractors || 1,
                        assignedContractors: item.assignedContractors || jobObj.assignedContractors || 0,
                        status: item.status || jobObj.status || 'open',
                        originalOfferRate: item.originalOfferRate || jobObj.hourlyRate || 0,
                        proposedRate: item.proposedRate || item.contractorHourlyRate || 0,
                        totalJobHours: item.totalJobHours || jobObj.totalHours || 0,
                        organizationImage: item.organizationImage,
                        contractorImage: item.contractorProfilePicture || item.contractorImage || contractorObj.profileImageUrl || contractorObj.profileImage || contractorObj.image || item.profileImageUrl || ''
                    });
                } else {
                    setHasError(true);
                    Toast.show({
                        type: 'error',
                        text2: res.message || 'Failed to fetch job invitation details'
                    });
                }
            } catch (error: any) {
                devDebugger.error('Error fetching invitation details:', error);
                setHasError(true);
                Toast.show({
                    type: 'error',
                    text2: error.message || 'An unexpected error occurred'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [invitationId]);



    if (loading) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader
                    title={strings.client.jobInvites.detailsTitle}
                    onBack={() => navigation.goBack()}
                />
                <InviteDetailsSkeleton />
            </View>
        );
    }

    if (hasError || !details) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader
                    title={strings.client.jobInvites.detailsTitle}
                    onBack={() => navigation.goBack()}
                />
                <View style={{ flex: 1 }}>
                    <EmptyState imageSource={require('@assets/images/common/noData.png')} title={strings.client.jobInvites.noDetailsFoundTitle} description={strings.client.jobInvites.noDetailsFoundDesc} />
                </View>
            </View>
        );
    }

    const statusStyle = getStatusStyles(details.invitationStatus);
    const formattedStartDate = getLocalDateTime(details.jobStartDate).date;
    const formattedEndDate = getLocalDateTime(details.jobEndDate).date;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={strings.client.jobInvites.detailsTitle}
                onBack={() => navigation.goBack()}
            />

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Contractor Header */}
                <View style={styles.contractorHeader}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            if (details?.contractorId) {
                                navigation.navigate('ContractorProfileDetail', { contractor: { contractorId: details.contractorId }, shouldShowButton: false });
                            }
                        }}
                    >
                        <View style={styles.avatarWrapper}>
                            <FastImage 
                                source={details.contractorImage || details.organizationImage 
                                    ? { uri: details.contractorImage || details.organizationImage }
                                    : require('@assets/images/common/dummyUser.png')} 
                                style={styles.avatar} 
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <AppText style={styles.contractorName}>{details.contractorName}</AppText>
                        <AppText style={styles.hourlyRateText}>{strings.client.jobInvites.hourlyRate} {formatCurrency(details.workerHourlyRate)}/h</AppText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.badge.backgroundColor }]}>
                        <AppText style={[styles.statusText, { color: statusStyle.text.color }]}>
                            {statusStyle.label}
                        </AppText>
                    </View>
                </View>

                {/* Divider Line */}
                <View style={styles.divider} />

                {/* Job Title & Company */}
                <View style={styles.titleSection}>
                    <AppText style={styles.jobTitle}>{details.jobTitle}</AppText>
                    <AppText style={styles.companyName}>{details.organizationName}</AppText>
                </View>

                {/* Job Details Grid */}
                <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                        <Image 
                            source={require('@assets/images/common/doller.png')} 
                            style={styles.detailIcon} 
                            tintColor="#9CA3AF"
                        />
                        <AppText style={styles.gridText}>{strings.client.jobInvites.jobRate} {formatCurrency(details.jobPrice)}/h</AppText>
                    </View>

                    <View style={[styles.detailRow,  { alignItems: 'flex-start' }]}>
                        <Image 
                            source={require('@assets/images/common/locationPin.png')} 
                            style={styles.detailIcon} 
                            tintColor="#9CA3AF"
                        />
                        <AppText style={styles.gridText} >{details.jobLocation}</AppText>
                    </View>

                    <View style={styles.rowLayout}>
                        <View style={styles.detailRow}>
                            <Image 
                                source={require('@assets/images/common/calander.png')} 
                                style={styles.detailIcon} 
                                tintColor="#9CA3AF"
                            />
                            <AppText style={[styles.gridText, { flex: 0 }]}>{formattedStartDate} - {formattedEndDate}</AppText>
                        </View>
                        <View style={[styles.detailRow, { marginLeft: horizontalScale(16) }]}>
                            <Image 
                                source={require('@assets/images/common/blackClock.png')} 
                                style={styles.detailIcon} 
                                tintColor="#9CA3AF"
                            />
                            <AppText style={[styles.gridText, { flex: 0 }]}>{getLocalDateTime(details.jobStartDate).time} - {getLocalDateTime(details.jobEndDate).time}</AppText>
                        </View>
                    </View>
                </View>

                {/* About this Job */}
                <View style={styles.sectionContainer}>
                    <AppText style={styles.sectionTitle}>{strings.client.jobInvites.aboutJob}</AppText>
                    <View style={styles.descBox}>
                        <AppText style={styles.descriptionText}>{details.jobDescription}</AppText>
                    </View>
                </View>

                {/* Required Certification */}
                {details.requiredCertifications && details.requiredCertifications.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <AppText style={styles.sectionTitle}>{strings.client.jobInvites.requiredCertification}</AppText>
                        <View style={styles.certBox}>
                            {details.requiredCertifications.map((cert: any, index: number) => {
                                const certName = typeof cert === 'object' 
                                    ? (cert.certificationName || cert.name || 'Unknown') 
                                    : cert;
                                return (
                                    <View key={index} style={styles.bulletRow}>
                                        <AppText style={styles.bullet}>•</AppText>
                                        <AppText style={styles.certText}>{certName}</AppText>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Required Contractor */}
                <View style={styles.requiredContractorRow}>
                    <AppText style={styles.requiredContractorTitle}>{strings.client.jobInvites.requiredContractor}</AppText>
                    <View style={styles.countBox}>
                        <AppText style={styles.countText}>{details.requiredContractors}</AppText>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default JobInviteDetailsScreen;
